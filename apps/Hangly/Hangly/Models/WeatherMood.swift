//
//  WeatherMood.swift
//  Hangly
//
//  What weather does to the way a charm is drawn.
//

import Foundation

/// How the weather changes a charm's colour, and nothing else.
///
/// The renderer never learns what the weather is; it is handed one of these. That
/// split is what keeps the effects honest — every one of them has to be expressible
/// as an adjustment to the artwork the designer drew, so none of them can become a
/// sticker laid on top of it. There are no sprites here, no particles and no layer:
/// rain is what rain does to the look of a thing, not raindrops drawn over it.
///
/// Every field is neutral at its identity value, and ``clear`` is the identity. A
/// charm with no weather is drawn exactly as it always was, byte for byte.
struct WeatherMood: Hashable, Sendable {
    /// Multiplier on colour saturation. Below one drains it; an overcast sky does
    /// this to everything under it.
    var saturation: Double

    /// Shift toward warm or cool, as a fraction of full scale. Sunlight is warm,
    /// snow light is not.
    var warmth: Double

    /// How much the bright parts brighten. This is the specular lift that reads as
    /// sun on gold, water on enamel, or frost catching the light — and it is why
    /// the effects keep a charm's identity: it exaggerates the shading already in
    /// the artwork rather than covering it.
    var sheen: Double

    /// How much the mid-tones darken. Wet things are darker than dry ones, which is
    /// most of why wet things look wet.
    var damp: Double

    /// A faint colour laid along the artwork's own silhouette, just inside the edge.
    /// Frost collects there, and so does a charge.
    var rim: CharmColor?

    /// Strength of the rim, zero to one.
    var rimStrength: Double

    /// Nothing at all: the charm as drawn. Every field is its identity value, which
    /// is what lets `isNeutral` skip the work rather than doing it with no effect.
    static let clear = WeatherMood(
        saturation: 1,
        warmth: 0,
        sheen: 0,
        damp: 0,
        rim: nil,
        rimStrength: 0
    )

    /// Whether this mood would change anything. A neutral mood is never applied, so
    /// weather that is off, unknown or stale costs exactly nothing to draw.
    var isNeutral: Bool {
        self == .clear
    }
}

extension WeatherCondition {
    /// How this condition is worn.
    ///
    /// Deliberately small numbers. The test of an ambient effect is whether someone
    /// notices it is *there* rather than whether they notice it changed, and every
    /// one of these is well under what would read as a filter.
    var mood: WeatherMood {
        switch self {
        case .sunny:
            // Warm light, and metals catch it. Saturation lifts a little because
            // sunlight does that to colour.
            WeatherMood(
                saturation: 1.06,
                warmth: 0.055,
                sheen: 0.14,
                damp: 0,
                rim: nil,
                rimStrength: 0
            )
        case .cloudy:
            // Flat light: colour drains, highlights go, nothing else happens.
            WeatherMood(
                saturation: 0.82,
                warmth: -0.012,
                sheen: -0.05,
                damp: 0.03,
                rim: nil,
                rimStrength: 0
            )
        case .rain:
            // Wet: darker through the middle, sharper at the top. The contrast
            // between those two is the whole of a water sheen.
            WeatherMood(
                saturation: 0.96,
                warmth: -0.03,
                sheen: 0.2,
                damp: 0.1,
                rim: CharmColor(0.62, 0.74, 0.86),
                rimStrength: 0.2
            )
        case .snow:
            // Cold, pale, and catching white along its own edge where frost would.
            WeatherMood(
                saturation: 0.78,
                warmth: -0.05,
                sheen: 0.1,
                damp: 0,
                rim: CharmColor(0.88, 0.94, 1.0),
                rimStrength: 0.34
            )
        case .storm:
            // Charged rather than lit: everything a shade deeper, with a cold edge
            // that does not move. A shimmer that actually shimmered would mean
            // redrawing the overlay for ever, and that is the whole idle budget.
            WeatherMood(
                saturation: 0.88,
                warmth: -0.055,
                sheen: 0.16,
                damp: 0.08,
                rim: CharmColor(0.55, 0.68, 1.0),
                rimStrength: 0.3
            )
        }
    }
}

extension WeatherMood {
    /// The same adjustment the artwork gets, applied to a single colour.
    ///
    /// The cord, the halo and the charms drawn from geometry rather than from a file
    /// have no pixels to run a tone curve over — they have a palette. Sharing the
    /// arithmetic is what keeps a gold cord and the gold charm on the end of it
    /// agreeing about what the light is doing.
    func applied(to color: CharmColor) -> CharmColor {
        let luminance = ((color.red * 0.2126) + (color.green * 0.7152) + (color.blue * 0.0722))
            .clamped(to: 0...1)

        func adjust(_ channel: Double, warmedBy shift: Double) -> Double {
            var value = luminance + ((channel - luminance) * saturation) + shift
            let highlight = max(0, (luminance - 0.62) / 0.38)
            value += (1 - value) * sheen * highlight
            let midtone = 1 - (abs(luminance - 0.5) * 2)
            return (value * (1 - (damp * max(0, midtone)))).clamped(to: 0...1)
        }

        return CharmColor(
            adjust(color.red, warmedBy: warmth),
            adjust(color.green, warmedBy: 0),
            adjust(color.blue, warmedBy: -warmth),
            alpha: color.alpha
        )
    }

    /// A whole palette under this weather.
    func applied(to palette: CharmPalette) -> CharmPalette {
        guard !isNeutral else { return palette }
        return CharmPalette(
            primary: applied(to: palette.primary),
            secondary: applied(to: palette.secondary),
            deep: applied(to: palette.deep),
            light: applied(to: palette.light)
        )
    }
}
