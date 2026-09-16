//
//  RopeStyleBehaviourTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing

@testable import Hangly

/// What the five styles actually do when you let go of them.
///
/// The risk this feature carries is not that it crashes — it is that it ships as
/// five names for one rope. A style that changed only the colour of the cord would
/// pass every structural test in `RopeStyleTests` and still be a lie, so this suite
/// swings each of the five and measures it.
@Suite("Rope style behaviour")
@MainActor
struct RopeStyleBehaviourTests {
    private let anchor = CGPoint(x: 260, y: 15)
    private let frame120: TimeInterval = 1.0 / 120.0

    /// How long one quarter of a swing takes: the rope is released from its resting
    /// angle and timed until the charm first passes under the anchor.
    private func quarterPeriod(of style: RopeStyle) -> TimeInterval {
        let rope = RopeSimulation(anchor: anchor, style: style)
        rope.start()

        let charm = rope.points.count - 1
        let offset = rope.points[charm].position.x - anchor.x
        let side = offset < 0 ? -1.0 : 1.0
        #expect(abs(offset) > 1, "the rope must start displaced for this to measure anything")

        var elapsed: TimeInterval = 0
        while elapsed < 8 {
            rope.step(deltaTime: frame120)
            elapsed += frame120
            if (rope.points[charm].position.x - anchor.x) * side <= 0 { return elapsed }
        }
        return elapsed
    }

    /// How long the rope takes to settle from the same release.
    private func settleTime(of style: RopeStyle) -> TimeInterval {
        let rope = RopeSimulation(anchor: anchor, style: style)
        rope.start()

        var elapsed: TimeInterval = 0
        while elapsed < 120 {
            rope.step(deltaTime: frame120)
            elapsed += frame120
            if rope.isSleeping { return elapsed }
        }
        return elapsed
    }

    @Test("A chain swings slower than a thread, and neon faster than either")
    func swingPeriodsDifferAsPromised() {
        let gold = quarterPeriod(of: .goldChain)
        let silver = quarterPeriod(of: .silverChain)
        let thread = quarterPeriod(of: .thread)
        let neon = quarterPeriod(of: .neon)

        // Gold is the heavy one: slowest to reach the bottom of its swing. Silver is
        // the same character with more life in it, and neon is the quickest of all.
        #expect(gold > silver)
        #expect(silver > thread)
        #expect(thread > neon)

        // And the difference is one a person can see, not one only a test can.
        #expect(gold > neon * 1.2)

        // Leather is deliberately not in that ordering. Its own claim is that it
        // settles quickly, and the drag that does the settling also slows its swing
        // by more than its gravity speeds it up — so it is timed below instead.
        #expect(quarterPeriod(of: .leather) != thread)
    }

    @Test("Leather settles quickly and neon keeps going")
    func settleTimesDifferAsPromised() {
        let leather = settleTime(of: .leather)
        let thread = settleTime(of: .thread)
        let neon = settleTime(of: .neon)

        #expect(leather < thread, "leather is meant to be the quick one")
        #expect(neon > thread, "neon is meant to be the lively one")
        #expect(thread > leather * 1.5)
    }

    @Test("Every style still obeys the stretch ceiling under a hard throw")
    func noStyleCanBeStretched() {
        for style in RopeStyle.allCases {
            let rope = RopeSimulation(anchor: anchor, style: style)
            rope.start()
            rope.beginDrag(at: rope.points[rope.points.count - 1].position)
            rope.updateDrag(to: CGPoint(x: 4000, y: -4000), velocity: CGPoint(x: 9000, y: -9000))
            for _ in 0..<240 { rope.step(deltaTime: frame120) }

            #expect(
                rope.measuredMaximumStretch <= rope.configuration.maxStretchRatio + 1e-9,
                "\(style) stretched past its limit"
            )
        }
    }

    @Test("A styled rope is still deterministic")
    func styledRopesAreDeterministic() {
        for style in RopeStyle.allCases {
            let first = RopeSimulation(anchor: anchor, style: style)
            let second = RopeSimulation(anchor: anchor, style: style)
            first.start()
            second.start()
            for _ in 0..<300 {
                first.step(deltaTime: frame120)
                second.step(deltaTime: frame120)
            }

            #expect(first.points.map(\.position) == second.points.map(\.position), "\(style) is not reproducible")
        }
    }

    @Test("Only the charm's link changes weight, and only by the style's scale")
    func styleScalesTheCharmAlone() {
        let rope = RopeSimulation(anchor: anchor, style: .thread)
        rope.start()
        let plainCharm = rope.points[rope.points.count - 1].inverseMass
        let plainMiddle = rope.points[10].inverseMass

        rope.setStyle(.goldChain)
        let heavyCharm = rope.points[rope.points.count - 1].inverseMass

        #expect(heavyCharm < plainCharm)
        #expect(rope.points[10].inverseMass == plainMiddle)
        #expect(abs((plainCharm / heavyCharm) - RopeStyle.goldChain.physics.charmMassScale) < 1e-9)
    }
}
