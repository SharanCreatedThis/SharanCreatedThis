//
//  WeatherTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing

@testable import Hangly

/// A weather service that never touches the network.
///
/// Every path this feature has to survive — offline, a place that does not exist, a
/// reply this build cannot read — is a failure of one of these two calls, so they
/// are made to fail on purpose rather than by unplugging something.
private final class StubWeather: WeatherFetching, @unchecked Sendable {
    enum Outcome: Sendable {
        case condition(WeatherCondition)
        case failure
    }

    private let lock = NSLock()
    private var _outcome: Outcome
    private var _place: WeatherPlace?
    private(set) var conditionCalls = 0
    private(set) var placeCalls = 0

    init(_ outcome: Outcome, place: WeatherPlace? = WeatherPlace(name: "Lisbon", latitude: 38.72, longitude: -9.14)) {
        _outcome = outcome
        _place = place
    }

    var outcome: Outcome {
        get { lock.withLock { _outcome } }
        set { lock.withLock { _outcome = newValue } }
    }

    func condition(at place: WeatherPlace) async throws -> WeatherCondition {
        lock.withLock { conditionCalls += 1 }
        switch outcome {
        case .condition(let condition): return condition
        case .failure: throw OpenMeteoClient.Failure.badResponse(503)
        }
    }

    func place(named name: String) async throws -> WeatherPlace {
        lock.withLock { placeCalls += 1 }
        guard let place = lock.withLock({ _place }) else {
            throw OpenMeteoClient.Failure.noSuchPlace(name)
        }
        return place
    }
}

@Suite("Weather")
@MainActor
struct WeatherTests {
    private func makeDefaults() -> UserDefaults {
        let defaults = UserDefaults(suiteName: "com.hangly.weather.tests.\(UUID().uuidString)")
        return defaults ?? .standard
    }

    private func makeStore(enabled: Bool = true, override: WeatherCondition? = nil) -> SettingsStore {
        let store = SettingsStore(
            defaults: makeDefaults(),
            storageKey: "com.hangly.tests.\(UUID().uuidString)"
        )
        store.update {
            $0.weather.isEnabled = enabled
            $0.weather.override = override
        }
        return store
    }

    // MARK: - Reading the sky

    @Test("Every code Open-Meteo reports lands on one of the five states")
    func wmoCodesMapToConditions() {
        let expected: [WeatherCondition: [Int]] = [
            .sunny: [0, 1],
            .cloudy: [2, 3, 45, 48],
            .rain: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
            .snow: [71, 73, 75, 77, 85, 86],
            .storm: [95, 96, 99]
        ]
        for (condition, codes) in expected {
            for code in codes {
                #expect(WeatherCondition.fromWMOCode(code) == condition, "code \(code)")
            }
        }
        // A code this build has never heard of leaves the charm alone rather than
        // guessing at it.
        for code in [4, 30, 44, 49, 70, 90, 100, -1] {
            #expect(WeatherCondition.fromWMOCode(code) == nil, "code \(code)")
        }
    }

    @Test("The requests name one service, no key, and two fields")
    func requestsAreMinimal() throws {
        let place = WeatherPlace(name: "Lisbon", latitude: 38.7223, longitude: -9.1393)
        let forecast = try OpenMeteoClient.forecastURL(
            for: place,
            base: URL(string: "https://api.open-meteo.com/v1/forecast")
        )
        let query = try #require(URLComponents(url: forecast, resolvingAgainstBaseURL: false)?.queryItems)

        #expect(forecast.host() == "api.open-meteo.com")
        #expect(query.contains { $0.name == "current" && $0.value == "weather_code" })
        // Rounded before it is ever sent: a charm does not need the street.
        #expect(query.contains { $0.name == "latitude" && $0.value == "38.72" })
        #expect(query.contains { $0.name == "longitude" && $0.value == "-9.14" })
        #expect(!query.contains { $0.name.localizedCaseInsensitiveContains("key") })
        #expect(!query.contains { $0.name.localizedCaseInsensitiveContains("token") })
    }

    @Test("A location comes from the time zone, with no permission to ask for")
    func timeZoneNamesACity() {
        #expect(WeatherService.timeZoneCityName("Europe/Lisbon") == "Lisbon")
        #expect(WeatherService.timeZoneCityName("America/New_York") == "New York")
        #expect(WeatherService.timeZoneCityName("America/Argentina/Buenos_Aires") == "Buenos Aires")

        // The ones that name no city give nothing rather than something wrong.
        #expect(WeatherService.timeZoneCityName("UTC") == nil)
        #expect(WeatherService.timeZoneCityName("GMT") == nil)
        #expect(WeatherService.timeZoneCityName("Etc/GMT+5") == nil)
    }

    // MARK: - Fetching, caching, and going offline

    @Test("A reading is worn, and kept for the next launch")
    func aReadingIsWornAndCached() async {
        let defaults = makeDefaults()
        let store = makeStore()
        let client = StubWeather(.condition(.rain))
        let service = WeatherService(settingsStore: store, client: client, defaults: defaults, cacheKey: "cache")

        #expect(service.mood == .clear, "nothing is worn before anything has arrived")
        await service.refreshOnce()
        #expect(service.condition == .rain)
        #expect(service.mood == WeatherCondition.rain.mood)

        // A second service, as a relaunch would build it, wears the same weather
        // before it has asked anything.
        let relaunched = WeatherService(
            settingsStore: store,
            client: StubWeather(.failure),
            defaults: defaults,
            cacheKey: "cache"
        )
        #expect(relaunched.condition == .rain)
    }

    @Test("Offline keeps wearing the last reading rather than losing it")
    func offlineKeepsTheCachedReading() async {
        let store = makeStore()
        let client = StubWeather(.condition(.snow))
        let service = WeatherService(settingsStore: store, client: client, defaults: makeDefaults(), cacheKey: "c")

        await service.refreshOnce()
        #expect(service.condition == .snow)

        client.outcome = .failure
        let succeeded = await service.refreshOnce()
        #expect(!succeeded)
        #expect(service.condition == .snow, "a failed request must not undress the charm")
    }

    @Test("Offline with nothing cached is simply the app without weather")
    func offlineWithNoCacheIsNeutral() async {
        let store = makeStore()
        let service = WeatherService(
            settingsStore: store,
            client: StubWeather(.failure),
            defaults: makeDefaults(),
            cacheKey: "c"
        )

        await service.refreshOnce()
        #expect(service.condition == nil)
        #expect(service.mood == .clear)
        #expect(service.mood.isNeutral)
        if case .unavailable = service.status {} else {
            Issue.record("an unreachable service should say so: \(service.status)")
        }
    }

    @Test("A reading too old to mean anything is not worn")
    func staleReadingsAreDropped() async {
        let store = makeStore()
        let old = WeatherReading(
            condition: .storm,
            place: WeatherPlace(name: "Lisbon", latitude: 38.72, longitude: -9.14),
            observed: Date(timeIntervalSince1970: 0)
        )
        let defaults = makeDefaults()
        defaults.set(try? JSONEncoder().encode(old), forKey: "c")

        let service = WeatherService(
            settingsStore: store,
            client: StubWeather(.failure),
            defaults: defaults,
            cacheKey: "c",
            now: { Date(timeIntervalSince1970: WeatherReading.maximumAge + 60) }
        )

        #expect(service.reading != nil, "the reading is kept…")
        #expect(service.isStale)
        #expect(service.condition == nil, "…but a charm does not wear this morning's snow at dusk")
        #expect(service.mood == .clear)
    }

    @Test("Freshness is measured at the edges, not near them")
    func freshnessHasAnEdge() {
        let observed = Date(timeIntervalSince1970: 10_000)
        let reading = WeatherReading(
            condition: .sunny,
            place: WeatherPlace(name: "Lisbon", latitude: 0, longitude: 0),
            observed: observed
        )

        #expect(reading.isFresh(at: observed))
        #expect(reading.isFresh(at: observed.addingTimeInterval(WeatherReading.maximumAge - 1)))
        #expect(!reading.isFresh(at: observed.addingTimeInterval(WeatherReading.maximumAge + 1)))
        // A clock that went backwards is not a reading from the future.
        #expect(!reading.isFresh(at: observed.addingTimeInterval(-600)))
    }

    // MARK: - The switch and the override

    @Test("With weather off, nothing is worn and nothing is asked")
    func weatherOffIsInert() async {
        let store = makeStore(enabled: false)
        let client = StubWeather(.condition(.storm))
        let service = WeatherService(settingsStore: store, client: client, defaults: makeDefaults(), cacheKey: "c")

        service.start()
        #expect(service.condition == nil)
        #expect(service.mood == .clear)
        #expect(client.conditionCalls == 0, "weather is off; the network must not be touched")
        #expect(client.placeCalls == 0)
    }

    @Test("A chosen condition wins over the sky, and asks nothing")
    func theOverrideWinsAndIsOffline() async {
        let store = makeStore(enabled: true, override: .snow)
        let client = StubWeather(.condition(.sunny))
        let service = WeatherService(settingsStore: store, client: client, defaults: makeDefaults(), cacheKey: "c")

        service.start()
        #expect(service.condition == .snow)
        #expect(client.conditionCalls == 0, "a charm worn by hand needs no forecast")
    }

    @Test("A place is looked up once, not every half hour")
    func theLocationIsResolvedOnce() async {
        let store = makeStore()
        let client = StubWeather(.condition(.cloudy))
        let service = WeatherService(settingsStore: store, client: client, defaults: makeDefaults(), cacheKey: "c")

        await service.refreshOnce()
        await service.refreshOnce()
        await service.refreshOnce()

        #expect(client.conditionCalls == 3)
        #expect(client.placeCalls == 1)
    }

    // MARK: - Persistence

    @Test("Weather settings survive a round trip, and default to off")
    func settingsPersist() throws {
        #expect(AppSettings().weather.isEnabled == false, "the network stays untouched until asked")
        #expect(AppSettings().weather.override == nil)

        var settings = AppSettings()
        settings.weather = WeatherSettings(isEnabled: true, override: .storm, locationName: "Reykjavík")
        let restored = try JSONDecoder().decode(AppSettings.self, from: JSONEncoder().encode(settings))

        #expect(restored.weather == settings.weather)
    }

    @Test("A settings file from another build cannot break the weather")
    func unknownSettingsDegrade() throws {
        let newer = Data(#"{"weather":{"isEnabled":true,"override":"hail","locationName":"Oslo"}}"#.utf8)
        let settings = try JSONDecoder().decode(AppSettings.self, from: newer)

        #expect(settings.weather.isEnabled)
        #expect(settings.weather.override == nil, "a condition this build cannot read follows the sky instead")
        #expect(settings.weather.locationName == "Oslo")
    }

    @Test("A settings file that predates weather simply has none")
    func olderSettingsHaveNoWeather() throws {
        let old = Data(#"{"schemaVersion":1,"soundVolume":0.2}"#.utf8)
        let settings = try JSONDecoder().decode(AppSettings.self, from: old)

        #expect(settings.weather == WeatherSettings())
        #expect(!settings.weather.isEnabled)
    }
}
