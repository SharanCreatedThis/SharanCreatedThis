//
//  RopeStyleTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing

@testable import Hangly

/// What a rope style is, and what it has to actually do.
///
/// The risk this feature carries is not that it crashes — it is that it ships as
/// five names for one rope. A style that changed only the colour of the cord would
/// pass every structural test here and still be a lie, so the behavioural suite
/// below swings each of the five and measures them.
@Suite("Rope style")
@MainActor
struct RopeStyleTests {
    private let anchor = CGPoint(x: 260, y: 15)
    private let frame120: TimeInterval = 1.0 / 120.0

    // MARK: - Thread is what the rope already did

    @Test("Thread is the rope exactly as it was before styles existed")
    func threadMatchesTheShippedDefaults() {
        let physics = RopeStyle.thread.physics
        let defaults = RopeConfiguration.default

        #expect(physics.gravityScale == 1.0)
        #expect(physics.damping == defaults.damping)
        #expect(physics.maxStretchRatio == defaults.maxStretchRatio)
        #expect(physics.constraintIterations == defaults.constraintIterations)
        #expect(physics.stretchPasses == defaults.stretchPasses)
        #expect(physics.charmMassScale == 1.0)

        // Applying thread to the defaults must be the identity function, or the
        // shipped rope changed the day styles were added.
        #expect(defaults.applying(.thread) == defaults)
        #expect(RopeStyle.default == .thread)
    }

    @Test("Thread's cord is drawn with the constants the renderer used to hold")
    func threadKeepsItsDrawnCord() {
        let appearance = RopeStyle.thread.appearance

        #expect(appearance.widthScale == 0.046)
        #expect(appearance.minimumWidth == 1.5)
        #expect(appearance.glowStrength == 0)
        #expect(appearance.beadTint == nil)
        #expect(appearance.texture == .twist(pitch: 1.5, offset: 0.20))

        // The gold that used to live on the charms as `cordTint`.
        #expect(appearance.palette.primary == CharmColor(0.47, 0.34, 0.11))
        #expect(appearance.palette.light == CharmColor(0.78, 0.62, 0.30))
    }

    // MARK: - Applying a style

    @Test("Applying a style is idempotent and order-independent")
    func applyingIsOrderIndependent() {
        let base = RopeConfiguration.default

        for style in RopeStyle.allCases {
            let once = base.applying(style)
            #expect(once.applying(style) == once)
            // A configuration must not remember what it used to be.
            #expect(base.applying(.goldChain).applying(style) == once)
            #expect(base.applying(.neon).applying(.leather).applying(style) == once)
        }
    }

    @Test("Geometry survives a style; only the solver's tuning changes")
    func applyingLeavesGeometryAlone() {
        let base = RopeConfiguration.fitted(to: CGSize(width: 740, height: 420))

        for style in RopeStyle.allCases {
            let styled = base.applying(style)
            #expect(styled.segmentCount == base.segmentCount)
            #expect(styled.segmentLength == base.segmentLength)
            #expect(styled.fixedTimeStep == base.fixedTimeStep)
            #expect(styled.framesBeforeSleep == base.framesBeforeSleep)
            #expect(styled.initialAngle == base.initialAngle)
        }
    }

    /// The bug this feature was always going to have: the overlay re-fits the rope
    /// whenever its window changes size, and a fit that forgot the style would put
    /// the charm silently back on thread the first time the user rescaled it.
    @Test("A resize keeps the style instead of resetting it")
    func resizingKeepsTheStyle() {
        let rope = RopeSimulation(anchor: anchor, style: .goldChain)
        rope.start()
        rope.resize(to: CGSize(width: 900, height: 520))

        #expect(rope.style == .goldChain)
        #expect(rope.configuration.damping == RopeStyle.goldChain.physics.damping)
        let expectedGravity = RopeConfiguration.default.gravity * RopeStyle.goldChain.physics.gravityScale
        #expect(rope.configuration.gravity == expectedGravity)

        let fitted = RopeConfiguration.fitted(to: CGSize(width: 900, height: 520), style: .neon)
        #expect(fitted.maxStretchRatio == RopeStyle.neon.physics.maxStretchRatio)
    }

    // MARK: - The styles are actually different

    @Test("No two styles are the same rope")
    func everyStyleIsDistinct() {
        let styles = RopeStyle.allCases
        // Five shipped in 2.0, plus the four the collections brought.
        #expect(styles.count == 9)

        for (index, style) in styles.enumerated() {
            for other in styles[(index + 1)...] {
                #expect(style.physics != other.physics, "\(style) and \(other) swing identically")
                #expect(style.appearance != other.appearance, "\(style) and \(other) look identical")
                #expect(style.appearance.palette != other.appearance.palette)
                #expect(style.displayName != other.displayName)
                #expect(style.rawValue != other.rawValue)
            }
        }
    }

    // MARK: - Changing style mid-swing

    @Test("Changing style mid-swing keeps every node's momentum")
    func changingStyleKeepsMomentum() {
        let rope = RopeSimulation(anchor: anchor, style: .thread)
        rope.start()
        for _ in 0..<60 { rope.step(deltaTime: frame120) }

        let positions = rope.points.map(\.position)
        let displacements = rope.points.map(\.displacement)
        #expect(displacements.contains { $0.magnitude > 0 }, "the rope must be moving for this to mean anything")

        rope.setStyle(.neon)

        // Not reset, not paused, not re-fitted: the change costs the rope nothing.
        #expect(rope.points.map(\.position) == positions)
        #expect(rope.points.map(\.displacement) == displacements)
        #expect(!rope.isSleeping)
        #expect(rope.configuration.damping == RopeStyle.neon.physics.damping)
    }

    @Test("A sleeping rope wakes for a style change")
    func changingStyleWakesTheRope() {
        let rope = RopeSimulation(anchor: anchor, style: .thread)
        rope.start()
        rope.resetToHanging()
        for _ in 0..<600 { rope.step(deltaTime: frame120) }
        #expect(rope.isSleeping)

        rope.setStyle(.leather)
        #expect(!rope.isSleeping)
    }

    // MARK: - The cross-fade

    @Test("A style change blends the cord's look over a quarter of a second")
    func theLookInterpolates() {
        var transition = RopeStyleTransition(style: .thread)
        #expect(!transition.isRunning)
        #expect(transition.layers == [RopeStyleLayer(style: .thread, opacity: 1)])

        transition.begin(.goldChain)
        #expect(transition.isRunning)
        #expect(transition.style == .goldChain)
        // Both cords are drawn, and at the first frame the outgoing one still holds
        // the whole of it.
        #expect(transition.layers.count == 2)
        #expect(transition.layers[0].style == .thread)
        #expect(transition.layers[0].opacity == 1)
        #expect(transition.appearance.palette == RopeStyle.thread.appearance.palette)
        #expect(transition.appearance.widthScale == RopeStyle.thread.appearance.widthScale)

        transition.advance(by: RopeStyleTransition.duration / 2)
        let midway = transition.appearance
        let thread = RopeStyle.thread.appearance
        let gold = RopeStyle.goldChain.appearance
        #expect(midway.widthScale > thread.widthScale)
        #expect(midway.widthScale < gold.widthScale)
        #expect(midway.palette != thread.palette)
        #expect(midway.palette != gold.palette)
        #expect(abs(transition.layers[0].opacity + transition.layers[1].opacity - 1) < 1e-9)

        transition.advance(by: RopeStyleTransition.duration)
        #expect(!transition.isRunning)
        #expect(transition.appearance == gold)
        #expect(transition.layers == [RopeStyleLayer(style: .goldChain, opacity: 1)])
    }

    @Test("Reduce Motion puts the new cord there without a cross-fade")
    func reduceMotionSkipsTheCrossFade() {
        var transition = RopeStyleTransition(style: .thread)
        transition.begin(.neon, immediately: true)

        #expect(!transition.isRunning)
        #expect(transition.appearance == RopeStyle.neon.appearance)
        #expect(transition.layers == [RopeStyleLayer(style: .neon, opacity: 1)])
    }

    @Test("Picking the style already on the rope does nothing at all")
    func choosingTheSameStyleIsInert() {
        var transition = RopeStyleTransition(style: .leather)
        transition.begin(.leather)

        #expect(!transition.isRunning)
        #expect(transition.layers.count == 1)
    }

    // MARK: - Persistence

    @Test("The style is saved, restored, and defaults to the shipped one")
    func stylePersists() throws {
        #expect(OverlaySettings().ropeStyle == .shipped)

        var settings = OverlaySettings()
        settings.ropeStyle = .silverChain
        let data = try JSONEncoder().encode(settings)
        let restored = try JSONDecoder().decode(OverlaySettings.self, from: data)

        #expect(restored.ropeStyle == .silverChain)
        #expect(restored == settings)
    }

    @Test("A settings file from another build cannot break the overlay")
    func unknownStylesDegradeToThread() throws {
        // A style written by a newer build, and a file written by an older one that
        // has no style at all. Both must land on thread with every other preference
        // intact, rather than throwing the whole document away.
        let newer = Data(#"{"ropeStyle":"hemp","opacity":0.5,"isEnabled":false}"#.utf8)
        let older = Data(#"{"opacity":0.5}"#.utf8)

        let fromNewer = try JSONDecoder().decode(OverlaySettings.self, from: newer)
        #expect(fromNewer.ropeStyle == .shipped)
        #expect(fromNewer.opacity == 0.5)
        #expect(fromNewer.isEnabled == false)

        let fromOlder = try JSONDecoder().decode(OverlaySettings.self, from: older)
        #expect(fromOlder.ropeStyle == .shipped)
        #expect(fromOlder.opacity == 0.5)
    }

    // MARK: - The menu

    @Test("Every style can be named and drawn in the menu")
    func everyStyleIsPresentable() {
        for style in RopeStyle.allCases {
            #expect(!style.displayName.isEmpty)
            #expect(!style.symbolName.isEmpty)
            #expect(style.id == style.rawValue)
            #expect(RopeStyle(rawValue: style.rawValue) == style)
        }
    }
}
