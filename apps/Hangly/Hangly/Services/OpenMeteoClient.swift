//
//  OpenMeteoClient.swift
//  Hangly
//
//  Asking Open-Meteo what the weather is.
//

import Foundation
import OSLog

/// Anything that can answer the two questions the weather needs.
///
/// A protocol so the tests can answer them without a network, and so the offline
/// path is exercised by failing on purpose rather than by unplugging something.
protocol WeatherFetching: Sendable {
    func condition(at place: WeatherPlace) async throws -> WeatherCondition
    func place(named name: String) async throws -> WeatherPlace
}

/// Open-Meteo, and nothing else.
///
/// No API key, no account, no SDK, no entitlement — two GET requests against a
/// documented public endpoint, decoded into the smallest shape that answers the
/// question. That is the whole reason it was chosen over WeatherKit, which needs a
/// paid membership and a signed entitlement that an unsigned public build cannot
/// carry. Anyone can build this repository and have the weather work.
struct OpenMeteoClient: WeatherFetching {
    /// Where the two endpoints live. Named so a test can point them somewhere else.
    struct Endpoints: Sendable {
        var forecast = URL(string: "https://api.open-meteo.com/v1/forecast")
        var geocoding = URL(string: "https://geocoding-api.open-meteo.com/v1/search")
    }

    var endpoints = Endpoints()

    /// Short on purpose. Nothing waits on this — the charm is already wearing its
    /// cached weather — so a request that has not answered in ten seconds should get
    /// out of the way and let the next half-hour try again.
    var timeout: TimeInterval = 10

    enum Failure: Error, Equatable {
        case badURL
        case badResponse(Int)
        case unreadable
        case noSuchPlace(String)
        /// Open-Meteo answered with a code this build does not recognise.
        case unknownCondition(Int)
    }

    // MARK: - Requests

    /// The current condition where `place` is.
    func condition(at place: WeatherPlace) async throws -> WeatherCondition {
        let url = try Self.forecastURL(for: place, base: endpoints.forecast)
        let payload: ForecastPayload = try await fetch(url)
        guard let condition = WeatherCondition.fromWMOCode(payload.current.weatherCode) else {
            throw Failure.unknownCondition(payload.current.weatherCode)
        }
        return condition
    }

    /// Coordinates for a place name, through Open-Meteo's own geocoding.
    ///
    /// The same service answers both questions, so turning the weather on reaches
    /// exactly one host and no other.
    func place(named name: String) async throws -> WeatherPlace {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw Failure.noSuchPlace(name) }

        let url = try Self.geocodingURL(for: trimmed, base: endpoints.geocoding)
        let payload: GeocodingPayload = try await fetch(url)
        guard let match = payload.results?.first else { throw Failure.noSuchPlace(trimmed) }
        return WeatherPlace(name: match.name, latitude: match.latitude, longitude: match.longitude)
    }

    // MARK: - URLs

    /// Asks for exactly two fields. A smaller answer is a smaller thing to parse,
    /// and a request that asks for less says less about why it was made.
    static func forecastURL(for place: WeatherPlace, base: URL?) throws -> URL {
        guard let base, var components = URLComponents(url: base, resolvingAgainstBaseURL: false) else {
            throw Failure.badURL
        }
        components.queryItems = [
            URLQueryItem(name: "latitude", value: String(place.latitude)),
            URLQueryItem(name: "longitude", value: String(place.longitude)),
            URLQueryItem(name: "current", value: "weather_code"),
            URLQueryItem(name: "timeformat", value: "unixtime")
        ]
        guard let url = components.url else { throw Failure.badURL }
        return url
    }

    static func geocodingURL(for name: String, base: URL?) throws -> URL {
        guard let base, var components = URLComponents(url: base, resolvingAgainstBaseURL: false) else {
            throw Failure.badURL
        }
        components.queryItems = [
            URLQueryItem(name: "name", value: name),
            URLQueryItem(name: "count", value: "1"),
            URLQueryItem(name: "format", value: "json")
        ]
        guard let url = components.url else { throw Failure.badURL }
        return url
    }

    // MARK: - Transport

    private func fetch<Payload: Decodable>(_ url: URL) async throws -> Payload {
        var request = URLRequest(url: url)
        request.timeoutInterval = timeout
        // Nothing is worth re-reading: the service caches for us, with a policy it
        // can explain, and a stale HTTP cache would quietly defeat it.
        request.cachePolicy = .reloadIgnoringLocalCacheData

        let (data, response) = try await URLSession.shared.data(for: request)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw Failure.badResponse(http.statusCode)
        }
        do {
            return try JSONDecoder().decode(Payload.self, from: data)
        } catch {
            throw Failure.unreadable
        }
    }

    // MARK: - Payloads

}

// MARK: - Payloads

/// The two shapes Open-Meteo answers in, reduced to the fields that are read.
///
/// Asking for less is the point: the forecast request names one field, so the reply
/// is a few dozen bytes and there is nothing in it to be careless with.
private struct ForecastPayload: Decodable {
    let current: CurrentWeather
}

private struct CurrentWeather: Decodable {
    let weatherCode: Int

    private enum CodingKeys: String, CodingKey {
        case weatherCode = "weather_code"
    }
}

private struct GeocodingPayload: Decodable {
    let results: [GeocodingMatch]?
}

private struct GeocodingMatch: Decodable {
    let name: String
    let latitude: Double
    let longitude: Double
}
