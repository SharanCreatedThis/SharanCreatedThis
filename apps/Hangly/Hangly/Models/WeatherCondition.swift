//
//  WeatherCondition.swift
//  Hangly
//
//  The five kinds of weather the charm knows about.
//

import Foundation

/// What the sky is doing, reduced to the five states a charm can wear.
///
/// Five, and no more, because this drives an ornament rather than a forecast. The
/// difference between light drizzle and heavy rain is a real difference and not one
/// a charm can say anything useful about; the difference between rain and snow is.
enum WeatherCondition: String, CaseIterable, Codable, Sendable, Identifiable {
    case sunny
    case cloudy
    case rain
    case snow
    case storm

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .sunny: "Sunny"
        case .cloudy: "Cloudy"
        case .rain: "Rain"
        case .snow: "Snow"
        case .storm: "Storm"
        }
    }

    /// The menu's icon for this condition.
    var symbolName: String {
        switch self {
        case .sunny: "sun.max"
        case .cloudy: "cloud"
        case .rain: "cloud.rain"
        case .snow: "snowflake"
        case .storm: "cloud.bolt"
        }
    }

    /// Reads a WMO 4677 present-weather code, which is what Open-Meteo reports.
    ///
    /// The table is the whole of Open-Meteo's vocabulary, collapsed onto five
    /// states. Fog joins cloud because it looks like cloud from inside it; freezing
    /// rain joins rain rather than snow because it falls as water and it is the
    /// water a charm would show; hail joins storm, which is where it comes from.
    /// An unknown code returns `nil` rather than guessing — a forecast this app
    /// cannot read should leave the charm alone.
    static func fromWMOCode(_ code: Int) -> WeatherCondition? {
        switch code {
        case 0, 1: .sunny
        case 2, 3, 45, 48: .cloudy
        case 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82: .rain
        case 71, 73, 75, 77, 85, 86: .snow
        case 95, 96, 99: .storm
        default: nil
        }
    }
}
