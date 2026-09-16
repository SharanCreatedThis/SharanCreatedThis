//
//  WeatherReading.swift
//  Hangly
//
//  One weather observation, and where it came from.
//

import Foundation

/// Somewhere to ask about the weather.
struct WeatherPlace: Codable, Equatable, Sendable {
    /// What to call it in the interface.
    var name: String

    var latitude: Double
    var longitude: Double

    /// Coordinates are rounded to two decimals — roughly a kilometre — before they
    /// are ever sent or stored. A charm does not need to know which street you are
    /// on, and the less precise the question, the less the answer can say about you.
    init(name: String, latitude: Double, longitude: Double) {
        self.name = name
        self.latitude = (latitude * 100).rounded() / 100
        self.longitude = (longitude * 100).rounded() / 100
    }
}

/// One reading, with the time it was taken.
///
/// Kept whole rather than reduced to a condition, because the age is half of what
/// makes a cached reading usable or not.
struct WeatherReading: Codable, Equatable, Sendable {
    var condition: WeatherCondition
    var place: WeatherPlace
    var observed: Date

    /// The name that was asked for, which is not always the name that came back:
    /// ask for "NYC" and Open-Meteo answers "New York". Kept so that a place is
    /// looked up once rather than once every half hour for ever — and kept in the
    /// cache, so a relaunch does not look it up again either.
    var request: String

    init(
        condition: WeatherCondition,
        place: WeatherPlace,
        observed: Date,
        request: String = ""
    ) {
        self.condition = condition
        self.place = place
        self.observed = observed
        self.request = request.isEmpty ? place.name : request
    }

    /// How long a reading stays worth wearing.
    ///
    /// Six hours. Long enough that a laptop closed over lunch opens to the weather
    /// it closed in, short enough that the charm is not still glittering with this
    /// morning's snow at dusk. Past it the charm returns to its own colours, which
    /// is the same thing it does when weather is switched off.
    static let maximumAge: TimeInterval = 6 * 60 * 60

    func isFresh(at date: Date) -> Bool {
        let age = date.timeIntervalSince(observed)
        return age >= -60 && age <= Self.maximumAge
    }
}
