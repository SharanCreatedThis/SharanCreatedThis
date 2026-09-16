//
//  VectorTint.swift
//  Hangly
//
//  A recolour applied to a rasterised vector.
//

import Foundation

/// What a rope style does to the beads riding it.
///
/// Hashable because it is part of `VectorImage`'s cache key, and valid as one
/// because every instance is copied from a `RopeStyle`'s fixed table rather than
/// computed per frame — there are five of these in the whole app.
struct VectorTint: Hashable, Sendable {
    /// The rope style's metal, or `nil` to keep the artwork's own colours.
    var palette: CharmPalette?

    /// How far the artwork is moved toward the palette, zero to one.
    var strength: Double

    /// What the weather does to it afterwards. The two are one cache entry because
    /// they are one bitmap: recolouring for the cord and then weathering the result
    /// is a single pass of work, done when either changes and never per frame.
    var mood: WeatherMood

    /// Full strength would erase the artwork's own warmth along with its hue; this
    /// leaves a trace of what was drawn under what the style asked for.
    static let defaultStrength = 0.88

    init(
        palette: CharmPalette? = nil,
        strength: Double = VectorTint.defaultStrength,
        mood: WeatherMood = .clear
    ) {
        self.palette = palette
        self.strength = strength
        self.mood = mood
    }

    /// Whether this would change the artwork at all.
    var isIdentity: Bool {
        palette == nil && mood.isNeutral
    }

    /// A tint, or `nil` when there is nothing to do — so that a charm with no style
    /// metal and no weather takes the same cache entry, and the same bytes, that it
    /// did before either feature existed.
    static func make(palette: CharmPalette?, mood: WeatherMood) -> VectorTint? {
        let tint = VectorTint(palette: palette, mood: mood)
        return tint.isIdentity ? nil : tint
    }
}
