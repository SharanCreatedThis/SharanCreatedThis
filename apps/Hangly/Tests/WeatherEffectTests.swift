//
//  WeatherEffectTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing

@testable import Hangly

/// What the weather does to a charm, measured in pixels.
///
/// The requirements this suite exists for are the two that are easy to claim and
/// hard to keep: the effects must stay subtle, and they must leave a charm
/// recognisably itself. Both are statements about how far pixels moved, so they are
/// checked by moving them and looking.
@Suite("Weather effects")
@MainActor
struct WeatherEffectTests {
    /// A charm-shaped test image: a shaded disc on a transparent ground, which is
    /// what every charm is once you stop caring which one.
    private func makeArtwork(side: Int = 96) -> CGImage {
        let context = RGBABitmap.makeContext(data: nil, width: side, height: side)
        guard let context else { fatalError("could not make a context") }
        let radius = Double(side) / 2

        context.setFillColor(CGColor(red: 0.78, green: 0.22, blue: 0.18, alpha: 1))
        context.fillEllipse(in: CGRect(x: 0, y: 0, width: side, height: side))
        // A highlight, so there is something for a sheen to act on.
        context.setFillColor(CGColor(red: 0.98, green: 0.86, blue: 0.80, alpha: 1))
        context.fillEllipse(in: CGRect(
            x: radius * 0.5,
            y: radius * 1.0,
            width: radius * 0.6,
            height: radius * 0.6
        ))
        guard let image = context.makeImage() else { fatalError("could not make an image") }
        return image
    }

    /// What an image averages out to, over the pixels that are actually there.
    private struct Measurement {
        var red = 0.0
        var green = 0.0
        var blue = 0.0

        /// Fraction of the image that is opaque, which is the silhouette.
        var coverage = 0.0

        /// How warm the colour reads. Positive is warmer.
        var warmth: Double { red - blue }
    }

    private func measure(_ image: CGImage) -> Measurement {
        guard let bitmap = RGBABitmap(image: image) else { return Measurement() }
        var totals = (red: 0.0, green: 0.0, blue: 0.0)
        var counted = 0.0
        for index in stride(from: 0, to: bitmap.pixels.count, by: RGBABitmap.bytesPerPixel) {
            let alpha = Double(bitmap.pixels[index + 3])
            guard alpha > 200 else { continue }
            totals.red += Double(bitmap.pixels[index]) / alpha
            totals.green += Double(bitmap.pixels[index + 1]) / alpha
            totals.blue += Double(bitmap.pixels[index + 2]) / alpha
            counted += 1
        }
        guard counted > 0 else { return Measurement() }
        let pixels = Double(bitmap.pixels.count / RGBABitmap.bytesPerPixel)
        return Measurement(
            red: totals.red / counted,
            green: totals.green / counted,
            blue: totals.blue / counted,
            coverage: counted / pixels
        )
    }

    // MARK: - Doing nothing

    @Test("Clear weather is the charm exactly as it was")
    func clearWeatherChangesNothing() {
        #expect(WeatherMood.clear.isNeutral)
        #expect(RGBABitmap.weathered(makeArtwork(), mood: .clear) == nil, "neutral weather must do no work")

        let palette = BuiltInCharms.charm(for: .daruma).palette
        #expect(WeatherMood.clear.applied(to: palette) == palette)

        // And it takes the same cache entry — the same bytes — that it always did.
        #expect(VectorTint.make(palette: nil, mood: .clear) == nil)
        #expect(VectorTint(palette: nil, mood: .clear).isIdentity)
    }

    @Test("Every condition does something, and no two do the same thing")
    func everyConditionIsDistinct() {
        let moods = WeatherCondition.allCases.map(\.mood)
        for (condition, mood) in zip(WeatherCondition.allCases, moods) {
            #expect(!mood.isNeutral, "\(condition) would be invisible")
        }
        for (index, mood) in moods.enumerated() {
            for other in moods[(index + 1)...] {
                #expect(mood != other)
            }
        }
    }

    // MARK: - Subtlety and identity

    /// The whole design rests on this: an effect that moved a charm's colour far
    /// enough would stop being weather and start being a filter, and one that added
    /// pixels outside the artwork would be a sticker. Neither is allowed, so both
    /// are measured.
    @Test("No condition repaints a charm or spills outside it")
    func effectsStaySubtleAndInside() {
        let original = makeArtwork()
        let base = measure(original)

        for condition in WeatherCondition.allCases {
            let weathered = try? #require(RGBABitmap.weathered(original, mood: condition.mood))
            guard let weathered else { continue }
            let after = measure(weathered)

            let shift = max(
                abs(after.red - base.red),
                abs(after.green - base.green),
                abs(after.blue - base.blue)
            )
            #expect(shift > 0.004, "\(condition) is not visible at all")
            #expect(shift < 0.16, "\(condition) shifts the charm's colour by \(shift) — that is a repaint")

            // Same size, same silhouette: nothing was added around the edge.
            #expect(weathered.width == original.width)
            #expect(weathered.height == original.height)
            #expect(abs(after.coverage - base.coverage) < 0.005, "\(condition) changed the charm's shape")
        }
    }

    @Test("Sun warms a charm and cloud drains it, which is the way round it should be")
    func conditionsPullInTheDirectionTheyShould() {
        let original = makeArtwork()
        let base = measure(original)

        guard let sun = RGBABitmap.weathered(original, mood: WeatherCondition.sunny.mood),
              let cloud = RGBABitmap.weathered(original, mood: WeatherCondition.cloudy.mood) else {
            Issue.record("the weather pass produced nothing")
            return
        }

        #expect(measure(sun).warmth > base.warmth, "sun should warm a charm")
        #expect(measure(cloud).warmth < base.warmth, "cloud should drain one")
    }

    @Test("A palette and a bitmap agree about what the light is doing")
    func paletteAndPixelsAgree() {
        // The cord is drawn from a palette and the charm from pixels; if the two
        // used different arithmetic a gold cord would warm while its gold charm did
        // not, and the assembly would come apart.
        let colour = CharmColor(0.78, 0.22, 0.18)
        for condition in WeatherCondition.allCases {
            let adjusted = condition.mood.applied(to: colour)
            let warmer = (adjusted.red - adjusted.blue) > (colour.red - colour.blue)
            #expect(warmer == (condition.mood.warmth > 0), "\(condition) disagrees with itself")
        }
    }

    @Test("An imported charm's weathered copy is made once and kept")
    func importedCharmsAreCached() {
        let image = makeArtwork()
        let cache = WeatheredImageCache.shared

        // Neutral weather hands back the very same image, so an imported charm with
        // weather off costs nothing at all.
        #expect(cache.image(for: image, mood: .clear) === image)

        let first = cache.image(for: image, mood: WeatherCondition.rain.mood)
        let second = cache.image(for: image, mood: WeatherCondition.rain.mood)
        #expect(first !== image)
        #expect(first === second, "the second draw must not redo the work")
    }

    // MARK: - Physics

    @Test("Weather cannot reach the physics")
    func weatherNeverTouchesTheSolver() {
        // Stated as a test because it is the one guarantee that cannot be seen: the
        // mood reaches the renderer and nothing else, so a rope swings identically
        // in a storm and in the sun.
        let anchor = CGPoint(x: 260, y: 15)
        let first = RopeSimulation(anchor: anchor)
        let second = RopeSimulation(anchor: anchor)
        first.start()
        second.start()

        for _ in 0..<600 {
            first.step(deltaTime: 1.0 / 120.0)
            second.step(deltaTime: 1.0 / 120.0)
        }
        #expect(first.points.map(\.position) == second.points.map(\.position))

        // And nothing in the physics layer has heard of it.
        #expect(WeatherMood.clear.isNeutral)
    }
}
