//
//  RopeTimeProfile.swift
//  Hangly
//
//  How the rope feels at different times of day.
//

import Foundation

/// The three moods the rope moves in.
///
/// The whole design goal in one sentence: someone should think *the rope feels a
/// little different today*, never *this is a different rope*. That rules out most of
/// what could have been changed. Gravity is untouched, because it is the only knob
/// in a pendulum that alters its period, and a changed period is precisely what
/// would read as a different rope. So is the length, the segment count and the
/// stretch ceiling. What changes is how long motion *persists* — which is felt
/// rather than seen, and is the one property of a swing a person could not name if
/// asked but would notice if it were wrong.
///
/// ``afternoon`` is the identity. Every one of its scales is exactly one, so an
/// afternoon rope is the rope that shipped, to the last bit.
enum RopeTimeProfile: String, CaseIterable, Codable, Sendable, Identifiable {
    case morning
    case afternoon
    case night

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .morning: "Morning"
        case .afternoon: "Afternoon"
        case .night: "Night"
        }
    }

    var symbolName: String {
        switch self {
        case .morning: "sunrise"
        case .afternoon: "sun.max"
        case .night: "moon.stars"
        }
    }

    /// The rope as it shipped, and the profile every scale is measured against.
    static let baseline = RopeTimeProfile.afternoon
}

/// What a time of day does to the solver.
///
/// Three scales, and not one of them is an absolute value. That is deliberate: the
/// rope already has five styles with damping four times apart, and a profile that
/// wrote a fixed number would flatten them into each other — a leather rope at night
/// would settle at the same rate as a neon one. Scaling what each style already does
/// keeps leather the quick one and makes night the quicker version of whatever the
/// rope happens to be made of.
struct RopeTimePhysics: Equatable, Sendable {
    /// Multiplier on how fast the rope loses energy — that is, on `1 - damping`
    /// rather than on damping itself.
    ///
    /// The right quantity to scale. Damping is a number just under one, and the
    /// interesting part is the sliver below it: halving *that* halves the rate a
    /// swing dies away at, whatever the style set it to, where halving the damping
    /// itself would stop the rope dead.
    var energyLossScale: Double

    /// Multiplier on the angle the rope is released at when it first appears. The
    /// morning's greeting is a slightly wider swing; the night's a narrower one.
    /// Costs nothing, because it happens once.
    var releaseAngleScale: Double

    /// Multiplier on the speed below which the rope counts as still. Above one the
    /// rope decides it has finished sooner — which is the same thing a calmer
    /// evening does to a person.
    var restSpeedScale: Double
}

extension RopeTimeProfile {
    var physics: RopeTimePhysics {
        switch self {
        case .morning:
            // Keeps a swing going about a quarter longer than the afternoon, and
            // starts wider. Nothing moves faster; it simply carries on.
            RopeTimePhysics(energyLossScale: 0.80, releaseAngleScale: 1.14, restSpeedScale: 0.94)
        case .afternoon:
            // The identity, asserted as such by `RopeTimeProfileTests`. The rope
            // that shipped is the rope at three in the afternoon.
            RopeTimePhysics(energyLossScale: 1, releaseAngleScale: 1, restSpeedScale: 1)
        case .night:
            RopeTimePhysics(energyLossScale: 1.30, releaseAngleScale: 0.88, restSpeedScale: 1.10)
        }
    }

    /// Which profile a local time falls in.
    ///
    /// Morning from five, afternoon from noon, night from six — the ordinary
    /// meanings of the words, and the hours the rest of the day is described by.
    /// A pure function of the hour, so "what is the rope doing at 3am" is a
    /// question with an answer rather than an experiment.
    static func forHour(_ hour: Int) -> RopeTimeProfile {
        switch hour {
        case 5..<12: .morning
        case 12..<18: .afternoon
        default: .night
        }
    }

    /// Which profile a date falls in, read in the machine's own time zone. Local,
    /// because the point is the time where the person is.
    static func forDate(_ date: Date, calendar: Calendar = .current) -> RopeTimeProfile {
        forHour(calendar.component(.hour, from: date))
    }
}
