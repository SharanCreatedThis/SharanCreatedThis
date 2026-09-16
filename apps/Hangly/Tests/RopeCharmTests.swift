//
//  RopeCharmTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// A place on the rope owns its size, and the count is one consequence of how many
/// places there are rather than one number anybody sets.
@Suite("Rope charms")
struct RopeCharmTests {
    private let one = CharmID.builtIn(.daruma)
    private let two = CharmID.builtIn(.star)
    private let three = CharmID.builtIn(.heart)

    @Test("Adding and removing charms is what sets the count")
    func countFollowsTheCharms() {
        var stack = CharmStack(one)
        #expect(stack.count == 1)

        stack.add(two)
        #expect(stack.count == 2)
        #expect(stack.charms == [one, two])

        stack.add(three)
        #expect(stack.count == 3)

        // Three is the rope's limit, and asking for one fourth is not an error — it
        // is one button that should already be gone.
        stack.add(one)
        #expect(stack.count == 3)
        #expect(stack.charms == [one, two, three])

        stack.remove(at: 1)
        #expect(stack.charms == [one, three])

        // The rope is never bare.
        stack.remove(at: 0)
        stack.remove(at: 0)
        #expect(stack.count == 1)
    }

    @Test("Reordering moves a charm along the rope and nothing else")
    func reordering() {
        var stack = CharmStack([one, two, three])
        stack.move(from: 0, to: 2)
        #expect(stack.charms == [two, three, one])

        stack.move(from: 2, to: 0)
        #expect(stack.charms == [one, two, three])
    }

    @Test("A place keeps its size when the charm in it is swapped")
    func sizeBelongsToThePlace() {
        var stack = CharmStack([one, two, three])
        stack.setSize(0.7, at: 1)
        #expect(stack.size(at: 1) == 0.7)

        stack[1] = one
        #expect(stack.charms == [one, one, three])
        // The composition survives changing your mind about the middle charm.
        #expect(stack.size(at: 1) == 0.7)
    }

    @Test("A size travels with its place when the place is moved")
    func sizeTravelsWithThePlace() {
        var stack = CharmStack([one, two, three])
        stack.setSize(1.4, at: 0)
        stack.move(from: 0, to: 2)

        #expect(stack.charms == [two, three, one])
        #expect(stack.sizes == [1, 1, 1.4])
    }

    @Test("Sizes are clamped rather than trusted")
    func sizesAreClamped() {
        var stack = CharmStack([one, two])
        stack.setSize(99, at: 0)
        stack.setSize(-99, at: 1)
        #expect(stack.size(at: 0) == RopeCharm.sizeRange.upperBound)
        #expect(stack.size(at: 1) == RopeCharm.sizeRange.lowerBound)
    }

    @Test("A sized place hangs a charm that is both bigger and heavier")
    func sizeReachesThePhysics() {
        let base = CharmMetrics.default
        let large = base.scaled(by: 1.5)

        #expect(abs(large.radiusRatio - (base.radiusRatio * 1.5)) < .ulpOfOne)
        #expect(abs(large.mass - (base.mass * 1.5)) < .ulpOfOne)
        // A proportion of the radius is already right at any radius.
        #expect(large.knotInset == base.knotInset)
        #expect(base.scaled(by: 1) == base)
    }

    @Test("Sizes survive a write and a read")
    func sizesPersist() throws {
        var overlay = OverlaySettings()
        overlay.stack = CharmStack([one, two, three])
        overlay.stack.setSize(1.3, at: 0)
        overlay.stack.setSize(0.8, at: 2)

        let data = try JSONEncoder().encode(overlay)
        let restored = try JSONDecoder().decode(OverlaySettings.self, from: data)

        #expect(restored.stack.charms == [one, two, three])
        #expect(restored.stack.sizes == [1.3, 1, 0.8])
    }

    @Test("A document from before places could be sized reads as an unsized rope")
    func migrationFromUnsizedDocuments() throws {
        // Charm identities are stored as their bare kind, which is what one document
        // written before places could be sized holds and all it holds.
        let json = #"""
        {"charms": ["daruma", "star"],
         "charmSlots": ["heart", "daruma", "star"]}
        """#
        let overlay = try JSONDecoder().decode(OverlaySettings.self, from: Data(json.utf8))

        #expect(overlay.stack.charms == [one, two])
        #expect(overlay.stack.sizes == [1, 1])
        // And the place put away keeps its charm, as it always did.
        #expect(overlay.stack.storedSlots.map(\.charm) == [three, one, two])
    }
}
