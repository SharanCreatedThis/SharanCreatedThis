//
//  StudioControlsTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing

@testable import Hangly

/// Size, Weight and Fill each answer one question, and this suite is the proof.
///
/// They did not, quite. Weight and Size were already clean, but Fill — which frames
/// the subject inside its square — also decided how much of that square was covered,
/// and mass was read off exactly that number. So re-framing a charm silently
/// re-weighed it, and a person tuning how the picture sat found the swing changing
/// underneath them with no control admitting to it.
///
/// Every test below changes one control across its whole range and measures the
/// things the other two own.
@Suite("Studio controls")
struct StudioControlsTests {
    private func draft(
        size: Double = StudioAdjustments().sizeRatio,
        weight: Double = 1,
        fill: Double = StudioAdjustments().fill
    ) async throws -> StudioCharmDraft {
        let image = try #require(TestImages.discOnClear())
        var adjustments = StudioAdjustments()
        adjustments.sizeRatio = size
        adjustments.weightScale = weight
        adjustments.fill = fill
        return try await CharmStudioPipeline.buildDraft(from: image, adjustments: adjustments.clamped())
    }

    /// Resampling a shape at a different scale moves its measured solidity by a
    /// fraction of a per cent; anything larger is a real dependency.
    private let tolerance = 0.05

    // MARK: - Size

    @Test("Size changes the drawn radius and only that")
    func sizeOwnsScaleAlone() async throws {
        let small = try await draft(size: StudioAdjustments.sizeRange.lowerBound)
        let large = try await draft(size: StudioAdjustments.sizeRange.upperBound)

        #expect(small.metrics.radiusRatio == StudioAdjustments.sizeRange.lowerBound)
        #expect(large.metrics.radiusRatio == StudioAdjustments.sizeRange.upperBound)
        #expect(large.metrics.radiusRatio > small.metrics.radiusRatio)

        // Not weight.
        #expect(abs(large.metrics.mass - small.metrics.mass) < tolerance)
        #expect(large.analysedMass == small.analysedMass)
        // Not the silhouette: the square is the same picture at both sizes.
        #expect(large.square.width == small.square.width)
        #expect(large.metrics.knotInset == small.metrics.knotInset)
    }

    // MARK: - Weight

    @Test("Weight changes mass and only that")
    func weightOwnsMassAlone() async throws {
        let light = try await draft(weight: StudioAdjustments.weightRange.lowerBound)
        let heavy = try await draft(weight: StudioAdjustments.weightRange.upperBound)

        #expect(heavy.metrics.mass > light.metrics.mass)
        // The analysis underneath is the same picture; only the scale differs.
        #expect(heavy.analysedMass == light.analysedMass)

        // Not the drawn size.
        #expect(heavy.metrics.radiusRatio == light.metrics.radiusRatio)
        #expect(heavy.square.width == light.square.width)
        // Not where the cord meets it.
        #expect(heavy.metrics.knotInset == light.metrics.knotInset)
    }

    @Test("Weight scales the analysed mass rather than replacing it")
    func weightIsAScale() async throws {
        let plain = try await draft(weight: 1)
        let doubled = try await draft(weight: 2)

        #expect(abs(plain.metrics.mass - plain.analysedMass) < .ulpOfOne)
        // Clamped at nine, which this shape is nowhere near.
        #expect(abs(doubled.metrics.mass - (plain.analysedMass * 2)) < .ulpOfOne)
    }

    // MARK: - Fill

    @Test("Fill changes the framing and leaves the weight alone")
    func fillDoesNotWeigh() async throws {
        let tight = try await draft(fill: StudioAdjustments.fillRange.lowerBound)
        let full = try await draft(fill: StudioAdjustments.fillRange.upperBound)

        // It does what it is for: the subject occupies more of its square.
        #expect(full.metrics.knotInset > tight.metrics.knotInset)

        // And nothing else. This is the relationship that was broken.
        #expect(abs(full.metrics.mass - tight.metrics.mass) < tolerance)
        #expect(abs(full.analysedMass - tight.analysedMass) < tolerance)
        // Nor the charm's own footprint on the rope.
        #expect(full.metrics.radiusRatio == tight.metrics.radiusRatio)
    }

    @Test("Fill leaves the weight alone across its whole range")
    func fillDoesNotWeighAnywhere() async throws {
        var masses: [Double] = []
        for fill in [0.70, 0.78, 0.86, 0.92, 0.98] {
            masses.append(try await draft(fill: fill).metrics.mass)
        }
        let spread = (masses.max() ?? 0) - (masses.min() ?? 0)
        #expect(spread < tolerance, "mass moved by \(spread) across the fill range")
    }

    // MARK: - The rope underneath

    @Test("None of the three touches the rope itself")
    func theRopeIsNotACharmControl() async throws {
        // Rope length, segment length and where charms attach come from the canvas
        // and the rope length setting. No charm control is an input to any of them,
        // and this is what says so.
        let base = RopeConfiguration.fitted(to: CGSize(width: 740, height: 420))

        for draft in [
            try await draft(size: StudioAdjustments.sizeRange.upperBound),
            try await draft(weight: StudioAdjustments.weightRange.upperBound),
            try await draft(fill: StudioAdjustments.fillRange.lowerBound)
        ] {
            let layout = CharmStackLayout.resolve(metrics: [draft.metrics], configuration: base)
            #expect(layout.slots.count == 1)
            #expect(base.segmentLength == RopeConfiguration.fitted(to: CGSize(width: 740, height: 420)).segmentLength)
            #expect(base.totalLength == RopeConfiguration.fitted(to: CGSize(width: 740, height: 420)).totalLength)
        }
    }

    @Test("A heavier charm hangs a different rope; a bigger one does not")
    func weightReachesThePhysicsAndSizeDoesNot() async throws {
        let light = try await draft(weight: 0.5)
        let heavy = try await draft(weight: 2.0)
        let big = try await draft(size: StudioAdjustments.sizeRange.upperBound)
        let small = try await draft(size: StudioAdjustments.sizeRange.lowerBound)

        // Mass is what the solver reads, so weight and only weight changes it.
        #expect(heavy.metrics.mass > light.metrics.mass)
        #expect(big.metrics.mass == small.metrics.mass)

        // Radius is what the renderer reads, so size and only size changes it.
        #expect(big.metrics.radiusRatio > small.metrics.radiusRatio)
        #expect(heavy.metrics.radiusRatio == light.metrics.radiusRatio)
    }
}
