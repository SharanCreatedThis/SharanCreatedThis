//
//  WeatherService.swift
//  Hangly
//
//  What the weather is, what it was, and when to ask again.
//

import Foundation
import Observation
import OSLog

/// Owns the weather: the cache, the half-hourly refresh, and what to do when the
/// network is not there.
///
/// Everything a charm sees comes out of ``mood``, which is `.clear` unless all of
/// these are true: the user turned weather on, there is a reading, and the reading
/// is fresh. Any of them failing gives a charm drawn exactly as its designer drew
/// it, which is also what the app does today — so the failure mode of every part of
/// this feature is the app without the feature.
@MainActor
@Observable
final class WeatherService {
    /// How often the weather is asked for.
    static let refreshInterval: TimeInterval = 30 * 60

    /// How long to wait after a failed request. Shorter than the refresh, because a
    /// failure is usually a closed lid or a café's captive portal and both clear up
    /// quickly — but not so short that a machine with no network spends its day
    /// asking.
    static let retryInterval: TimeInterval = 5 * 60

    /// The last reading that arrived, from this session or a previous one.
    private(set) var reading: WeatherReading?

    /// Why there is no weather, when there is none. Shown in the menu so that "it
    /// isn't working" always has an answer.
    private(set) var status: Status = .idle

    enum Status: Equatable, Sendable {
        case idle
        case locating
        case refreshing
        /// Nothing to show, and why.
        case unavailable(String)
        case ready
    }

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let client: any WeatherFetching
    @ObservationIgnored private let defaults: UserDefaults
    @ObservationIgnored private let now: @Sendable () -> Date

    @ObservationIgnored private var refreshTask: Task<Void, Never>?

    /// Where the last good reading is kept between launches.
    @ObservationIgnored private let cacheKey: String

    init(
        settingsStore: SettingsStore,
        client: any WeatherFetching = OpenMeteoClient(),
        defaults: UserDefaults = .standard,
        cacheKey: String = AppConstants.Defaults.weatherCacheKey,
        now: @escaping @Sendable () -> Date = Date.init
    ) {
        self.settingsStore = settingsStore
        self.client = client
        self.defaults = defaults
        self.cacheKey = cacheKey
        self.now = now
        // Loaded before anything is drawn, so a charm wears yesterday's weather from
        // the first frame rather than flicking into it a second later.
        reading = loadCache()
        status = reading == nil ? .idle : .ready
    }

    deinit {
        refreshTask?.cancel()
    }

    // MARK: - What the charm wears

    /// The condition being worn, whether it came from the sky or from the menu.
    var condition: WeatherCondition? {
        let settings = settingsStore.settings.weather
        guard settings.isEnabled else { return nil }
        if let override = settings.override { return override }
        guard let reading, reading.isFresh(at: now()) else { return nil }
        return reading.condition
    }

    /// What the renderer is handed. `.clear` is the charm untouched.
    var mood: WeatherMood {
        condition?.mood ?? .clear
    }

    /// Whether the reading on hand is too old to wear. Drives the menu's wording,
    /// so that "nothing is happening" reads as "the last reading went stale" rather
    /// than as a bug.
    var isStale: Bool {
        guard let reading else { return false }
        return !reading.isFresh(at: now())
    }

    // MARK: - Running

    /// Starts the half-hourly cycle, or stops it if the user has weather off.
    ///
    /// Called at launch and again whenever the setting changes. With weather off
    /// there is no task, no timer and no request: the feature costs nothing to have
    /// in the build, which is the only honest way to ship something that touches the
    /// network into an app that promises it does not.
    func start() {
        refreshTask?.cancel()
        refreshTask = nil

        let settings = settingsStore.settings.weather
        guard settings.isEnabled, settings.override == nil else {
            status = settings.isEnabled ? .ready : .idle
            return
        }

        refreshTask = Task { [weak self] in
            await self?.run()
        }
    }

    func stop() {
        refreshTask?.cancel()
        refreshTask = nil
    }

    /// Asks now rather than waiting for the next half hour.
    func refreshNow() {
        start()
    }

    /// One request, then a long sleep, for as long as the task is alive.
    private func run() async {
        while !Task.isCancelled {
            let succeeded = await refresh()
            let wait = succeeded ? Self.refreshInterval : Self.retryInterval
            do {
                try await Task.sleep(for: .seconds(wait))
            } catch {
                return
            }
        }
    }

    /// - Returns: Whether a reading arrived.
    private func refresh() async -> Bool {
        guard let resolved = await resolvePlace() else { return false }
        let place = resolved.place

        status = .refreshing
        do {
            let condition = try await client.condition(at: place)
            let fresh = WeatherReading(
                condition: condition,
                place: place,
                observed: now(),
                request: resolved.request
            )
            reading = fresh
            saveCache(fresh)
            status = .ready
            Logger.app.diagnostic("Weather at \(place.name): \(condition.rawValue).")
            return true
        } catch {
            // The cached reading stays exactly where it was. Offline is not an error
            // state here, it is simply a half hour where nothing new arrived.
            status = reading == nil
                ? .unavailable("Could not reach the weather service.")
                : .ready
            Logger.app.diagnostic("Weather request failed: \(error).")
            return false
        }
    }

    // MARK: - Where

    /// The place to ask about: the one the user typed, or the city in the system
    /// time zone.
    ///
    /// No location permission is requested, and none is needed. A time zone
    /// identifier already carries a city — `Europe/Lisbon`, `America/Argentina/
    /// Buenos_Aires` — and that city, resolved once and cached, is close enough for
    /// something that only has five answers. It costs no prompt, no entitlement and
    /// no third party, and the machine never reports where it is.
    private func resolvePlace() async -> (place: WeatherPlace, request: String)? {
        let requested = settingsStore.settings.weather.locationName.trimmingCharacters(
            in: .whitespacesAndNewlines
        )
        guard let wanted = requested.isEmpty ? Self.timeZoneCityName() : requested, !wanted.isEmpty else {
            status = .unavailable("Set a location in Settings to use weather here.")
            return nil
        }

        // Matched against what was *asked* for rather than what came back, so that
        // a place whose official name differs from the one typed is still resolved
        // once and not again on every cycle.
        if let reading, reading.request.caseInsensitiveCompare(wanted) == .orderedSame {
            return (reading.place, wanted)
        }

        status = .locating
        do {
            return (try await client.place(named: wanted), wanted)
        } catch {
            status = .unavailable("Could not find \"\(wanted)\".")
            Logger.app.diagnostic("Weather location lookup failed: \(error).")
            return nil
        }
    }

    /// The city out of a time zone identifier, or `nil` for the ones that name no
    /// city — `UTC`, `GMT+5` and the rest.
    static func timeZoneCityName(_ identifier: String = TimeZone.current.identifier) -> String? {
        guard let last = identifier.split(separator: "/").last else { return nil }
        let city = last.replacingOccurrences(of: "_", with: " ")
        guard identifier.contains("/"), city.count > 1,
              city.rangeOfCharacter(from: .decimalDigits) == nil else { return nil }
        return city
    }

    // MARK: - Cache

    private func loadCache() -> WeatherReading? {
        guard let data = defaults.data(forKey: cacheKey) else { return nil }
        return try? JSONDecoder().decode(WeatherReading.self, from: data)
    }

    private func saveCache(_ reading: WeatherReading) {
        guard let data = try? JSONEncoder().encode(reading) else { return }
        defaults.set(data, forKey: cacheKey)
    }

    #if !HANGLY_PRODUCTION
    /// Used by tests to drive one cycle without waiting half an hour.
    @discardableResult
    func refreshOnce() async -> Bool {
        await refresh()
    }
    #endif
}
