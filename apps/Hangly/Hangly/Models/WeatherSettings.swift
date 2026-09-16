//
//  WeatherSettings.swift
//  Hangly
//
//  Whether the charm follows the weather, and where.
//

import Foundation

/// The user's side of the weather.
///
/// Off by default, and that is a deliberate promise rather than a timid one. Hangly
/// tells people it makes no network calls at all; a build that quietly started
/// asking a server where they are would make that a lie on their behalf. So nothing
/// reaches the network until someone turns this on, and the README says exactly
/// that.
struct WeatherSettings: Codable, Equatable, Sendable {
    /// Whether the charm follows the weather at all. Off until asked.
    var isEnabled: Bool

    /// A condition chosen by hand, which wins over the sky. `nil` follows the
    /// weather. Useful for looking at the effects, and for anyone who would rather
    /// their charm was sunny regardless — with an override set, nothing is fetched
    /// and the network is never touched.
    var override: WeatherCondition?

    /// The place to ask about. Empty means the city named by the system time zone,
    /// which needs no permission and no lookup of where the machine actually is.
    var locationName: String

    init(isEnabled: Bool = false, override: WeatherCondition? = nil, locationName: String = "") {
        self.isEnabled = isEnabled
        self.override = override
        self.locationName = locationName
    }

    /// Tolerant decoding, like every other settings type here: a condition written
    /// by a newer build degrades to following the weather rather than discarding
    /// the rest of the document.
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let fallback = WeatherSettings()

        self.init(
            isEnabled: (try? container.decodeIfPresent(Bool.self, forKey: .isEnabled)) ?? fallback.isEnabled,
            override: (try? container.decodeIfPresent(WeatherCondition.self, forKey: .override)).flatMap { $0 },
            locationName: (try? container.decodeIfPresent(String.self, forKey: .locationName))
                ?? fallback.locationName
        )
    }
}
