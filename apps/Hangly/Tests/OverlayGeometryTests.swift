//
//  OverlayGeometryTests.swift
//  HanglyTests
//

import CoreGraphics
import Testing

@testable import Hangly

/// Rope length and charm size are two controls, and the whole point of splitting
/// them is that each does one thing. That is easy to state and was, until this
/// suite, quietly false: every length in the layout was a fraction of the overlay
/// window, the window was scaled by the charm size, and so each slider moved the
/// entire ornament. What is checked here is the independence itself — move one,
/// measure the other, and find it unchanged.
@Suite("Overlay geometry")
struct OverlayGeometryTests {
    /// Fits the rope the way the app does: the window grows to make room, and the
    /// configuration is then measured against the room it asked for.
    private func rope(charmSize: Double = 1, ropeLength: Double = 1) -> RopeConfiguration {
        let room = RopeConfiguration.Layout.canvasScale(charmSize: charmSize, ropeLength: ropeLength)
        let base = AppConstants.Overlay.baseSize
        let canvas = CGSize(width: base.width * room.width, height: base.height * room.height)
        return .fitted(to: canvas, charmSize: charmSize, ropeLength: ropeLength)
    }

    private func radius(charmSize: Double = 1, ropeLength: Double = 1, charms: Int = 1) -> Double {
        let configuration = rope(charmSize: charmSize, ropeLength: ropeLength)
        let metrics = Array(repeating: CharmMetrics.default, count: charms)
        let layout = CharmStackLayout.resolve(metrics: metrics, configuration: configuration)
        return layout.bottom?.radius ?? 0
    }

    private func canvasHeight(charmSize: Double = 1, ropeLength: Double = 1) -> Double {
        let room = RopeConfiguration.Layout.canvasScale(charmSize: charmSize, ropeLength: ropeLength)
        return AppConstants.Overlay.baseSize.height * room.height
    }

    @Test("Rope length changes the rope and nothing else")
    func ropeLengthLeavesTheCharmAlone() {
        let shipped = radius()
        for length in [0.7, 0.85, 1.0, 1.15, 1.3] {
            #expect(abs(radius(ropeLength: length) - shipped) < 0.001)
        }

        // And it does change the rope, in proportion, which is the other half of
        // the claim: a control that moved nothing would also pass the line above.
        let short = rope(ropeLength: 0.7).totalLength
        let long = rope(ropeLength: 1.3).totalLength
        #expect(abs((long / short) - (1.3 / 0.7)) < 0.001)
    }

    @Test("Charm size changes the charm and nothing else")
    func charmSizeLeavesTheRopeAlone() {
        let shipped = rope()
        for size in [0.5, 0.75, 1.0, 1.5, 2.0] {
            let configuration = rope(charmSize: size)
            #expect(abs(configuration.totalLength - shipped.totalLength) < 0.001)
            #expect(abs(configuration.segmentLength - shipped.segmentLength) < 0.001)
        }

        // Doubling the size doubles the charm.
        #expect(abs(radius(charmSize: 2.0) / radius(charmSize: 1.0) - 2) < 0.001)
        #expect(abs(radius(charmSize: 0.5) / radius(charmSize: 1.0) - 0.5) < 0.001)
    }

    @Test("The charm hangs from the same place on the display whatever either control says")
    func anchorHoldsStill() {
        let shipped = rope().anchor(in: CGSize(width: 740, height: canvasHeight()))

        for size in [0.5, 1.0, 2.0] {
            for length in [0.7, 1.0, 1.3] {
                let height = canvasHeight(charmSize: size, ropeLength: length)
                let anchor = rope(charmSize: size, ropeLength: length)
                    .anchor(in: CGSize(width: 740, height: height))
                #expect(abs(anchor.y - shipped.y) < 0.001)
            }
        }
    }

    @Test("A longer rope lowers the charm; a bigger charm does not")
    func lengthMovesTheCharmAndSizeDoesNot() {
        func charmDepth(charmSize: Double = 1, ropeLength: Double = 1) -> Double {
            let configuration = rope(charmSize: charmSize, ropeLength: ropeLength)
            return configuration.anchorHeight + configuration.totalLength
        }

        #expect(charmDepth(ropeLength: 1.3) > charmDepth(ropeLength: 1.0))
        #expect(charmDepth(ropeLength: 0.7) < charmDepth(ropeLength: 1.0))
        #expect(abs(charmDepth(charmSize: 2.0) - charmDepth(charmSize: 1.0)) < 0.001)
    }

    @Test("The shipped rope is the rope that shipped")
    func defaultsAreUnchanged() {
        // Both controls at 1 must ask the canvas for nothing extra, so the overlay
        // is the window it has always been and every proportion inside it is the
        // one it had before the two could move apart.
        let room = RopeConfiguration.Layout.canvasScale(charmSize: 1, ropeLength: 1)
        #expect(room == CGSize(width: 1, height: 1))

        let base = AppConstants.Overlay.baseSize
        let configuration = rope()
        #expect(abs(configuration.totalLength - (base.height * 0.69)) < 0.001)
        #expect(abs(configuration.anchorHeight - (base.height * 0.045)) < 0.001)
        // What `CharmStackLayout` measured radii against before the split.
        #expect(abs(configuration.charmReference - configuration.totalLength) < 0.001)
    }

    @Test("Changing rope length does not modify charm radius")
    func ropeLengthDoesNotTouchTheCharm() {
        // Stated as its own test, in the words of the requirement, because this is
        // the relationship that was broken and the one worth being able to point at.
        let shipped = radius()
        for length in stride(from: 0.70, through: 1.30, by: 0.05) {
            let moved = radius(ropeLength: length)
            #expect(abs(moved - shipped) < 0.001, "rope length \(length) changed the radius to \(moved)")
        }

        // And for a rope carrying three, where the charms also have to clear
        // each other.
        let three = radius(charms: 3)
        for length in [0.7, 1.0, 1.3] {
            #expect(abs(radius(ropeLength: length, charms: 3) - three) < 0.001)
        }
    }

    @Test("Changing charm size does not modify rope geometry")
    func charmSizeDoesNotTouchTheRope() {
        let shipped = rope()
        let attachments = RopeConfiguration.Layout.attachments(
            forCharmCount: 3,
            segmentCount: shipped.segmentCount
        )

        for size in stride(from: 0.5, through: 2.0, by: 0.1) {
            let configuration = rope(charmSize: size)

            #expect(abs(configuration.segmentLength - shipped.segmentLength) < 0.001)
            #expect(abs(configuration.totalLength - shipped.totalLength) < 0.001)
            #expect(configuration.segmentCount == shipped.segmentCount)

            // Where the charms attach, in points down the rope — not just which
            // node index, which would be the easy half of the claim.
            for node in attachments {
                let shippedDepth = Double(node) * shipped.segmentLength
                let movedDepth = Double(node) * configuration.segmentLength
                #expect(abs(movedDepth - shippedDepth) < 0.001)
            }

            // And the point the whole thing hangs from has not moved.
            #expect(abs(configuration.anchorHeight - shipped.anchorHeight) < 0.001)
        }
    }

    @Test("A large charm always has room to hang without being clipped")
    func theCanvasMakesRoom() {
        for size in [1.0, 1.5, 2.0] {
            for length in [0.7, 1.0, 1.3] {
                let configuration = rope(charmSize: size, ropeLength: length)
                let bottom = radius(charmSize: size, ropeLength: length)
                let halo = bottom * RopeConfiguration.Layout.charmHaloExtent
                let used = configuration.anchorHeight + configuration.totalLength + halo
                #expect(used <= canvasHeight(charmSize: size, ropeLength: length) + 0.001)
            }
        }
    }
}
