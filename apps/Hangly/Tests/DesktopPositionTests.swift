//
//  DesktopPositionTests.swift
//  HanglyTests
//

import CoreGraphics
import Testing

@testable import Hangly

/// Dragging a charm across a picture of a screen has to put it where the pointer
/// was. That is one claim — the mapping and its inverse agree — and everything the
/// control felt like it was doing wrong was this claim being false.
@Suite("Desktop position")
struct DesktopPositionTests {
    private let bounds = CGRect(x: 0, y: 0, width: 1512, height: 944)
    private let window = CGSize(width: 740, height: 420)
    private let inset = 24.0

    private func placement(at unit: CGPoint) -> ScreenPlacement.Placement {
        ScreenPlacement.placement(forUnit: unit, size: window, in: bounds, edgeInset: inset)
    }

    private func unit(of placement: ScreenPlacement.Placement) -> CGPoint {
        ScreenPlacement.unitPoint(for: placement, size: window, in: bounds, edgeInset: inset)
    }

    @Test("Dropping the charm somewhere and reading it back gives the same place")
    func roundTripIsExact() {
        for step in 0...40 {
            let x = Double(step) / 40
            for y in [0.0, 0.08, 0.17, 0.34] {
                let point = CGPoint(x: x, y: y)
                let back = unit(of: placement(at: point))
                #expect(abs(back.x - x) < 0.0005, "x \(x) came back as \(back.x)")
                #expect(abs(back.y - y) < 0.0005, "y \(y) came back as \(back.y)")
            }
        }
    }

    @Test("The charm reaches both edges and the middle")
    func noDeadZones() {
        // The old mapping could not do this: the window was kept wholly on screen,
        // so the charm stopped half a window short of either edge.
        let left = placement(at: CGPoint(x: 0, y: 0))
        let middle = placement(at: CGPoint(x: 0.5, y: 0))
        let right = placement(at: CGPoint(x: 1, y: 0))

        let leftFrame = ScreenPlacement.frame(
            for: window, anchor: left.anchor, in: bounds, offset: left.offset, edgeInset: inset
        )
        let middleFrame = ScreenPlacement.frame(
            for: window, anchor: middle.anchor, in: bounds, offset: middle.offset, edgeInset: inset
        )
        let rightFrame = ScreenPlacement.frame(
            for: window, anchor: right.anchor, in: bounds, offset: right.offset, edgeInset: inset
        )

        #expect(abs(leftFrame.midX - bounds.minX) < 0.5)
        #expect(abs(middleFrame.midX - bounds.midX) < 0.5)
        #expect(abs(rightFrame.midX - bounds.maxX) < 0.5)
    }

    @Test("Movement is continuous — no step, and no jump between anchor bands")
    func movementIsSmooth() {
        // Every band boundary used to be a discontinuity, because the stored number
        // meant a different thing either side of it. Walking across the screen in
        // small steps is what catches that.
        var previous = ScreenPlacement.frame(
            for: window,
            anchor: placement(at: CGPoint(x: 0, y: 0)).anchor,
            in: bounds,
            offset: placement(at: CGPoint(x: 0, y: 0)).offset,
            edgeInset: inset
        ).midX

        let step = 1.0 / 200.0
        let expected = bounds.width * step
        for index in 1...200 {
            let spot = placement(at: CGPoint(x: Double(index) * step, y: 0))
            let frame = ScreenPlacement.frame(
                for: window, anchor: spot.anchor, in: bounds, offset: spot.offset, edgeInset: inset
            )
            let moved = frame.midX - previous
            #expect(abs(moved - expected) < 0.5, "step \(index) moved \(moved), expected \(expected)")
            previous = frame.midX
        }
    }

    @Test("Which third the charm is in decides what it stays near")
    func anchorFollowsTheThirds() {
        #expect(placement(at: CGPoint(x: 0.1, y: 0)).anchor == .topLeading)
        #expect(placement(at: CGPoint(x: 0.5, y: 0)).anchor == .topCenter)
        #expect(placement(at: CGPoint(x: 0.9, y: 0)).anchor == .topTrailing)
    }

    @Test("Vertical placement is the distance down the screen, and comes back as one")
    func verticalIsPositional() {
        let high = placement(at: CGPoint(x: 0.5, y: 0))
        let low = placement(at: CGPoint(x: 0.5, y: 0.3))

        #expect(low.offset.y > high.offset.y)
        let highFrame = ScreenPlacement.frame(
            for: window, anchor: high.anchor, in: bounds, offset: high.offset, edgeInset: inset
        )
        let lowFrame = ScreenPlacement.frame(
            for: window, anchor: low.anchor, in: bounds, offset: low.offset, edgeInset: inset
        )
        // Dropped three tenths of the screen, the rope is pinned three tenths lower.
        #expect(abs((highFrame.maxY - lowFrame.maxY) - (bounds.height * 0.3)) < 0.5)
    }

    @Test("A display that is not the primary one is placed on itself")
    func worksOnASecondDisplay() {
        let secondary = CGRect(x: -1920, y: 120, width: 1920, height: 1080)
        let spot = ScreenPlacement.placement(
            forUnit: CGPoint(x: 0.25, y: 0.1), size: window, in: secondary, edgeInset: inset
        )
        let back = ScreenPlacement.unitPoint(for: spot, size: window, in: secondary, edgeInset: inset)

        #expect(abs(back.x - 0.25) < 0.0005)
        #expect(abs(back.y - 0.1) < 0.0005)
    }
}
