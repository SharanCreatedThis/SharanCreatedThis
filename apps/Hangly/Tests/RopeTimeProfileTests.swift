//
//  RopeTimeProfileTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing

@testable import Hangly

/// The rope at three times of day.
///
/// The design goal is a feeling, which cannot be asserted — but the two halves of it
/// can. That it feels *different* is a claim about settling time, measured below.
/// That it does not feel like a *different rope* is a claim about everything that
/// was left alone: period, length, shape, stiffness. Both are checked.
@Suite("Rope time profile")
@MainActor
struct RopeTimeProfileTests {
    private let canvas = CGSize(width: 740, height: 420)
    private let frame120: TimeInterval = 1.0 / 120.0

    private func makeRope(_ profile: RopeTimeProfile, style: RopeStyle = .thread) -> RopeSimulation {
        let rope = RopeSimulation(style: style, timeProfile: profile)
        rope.resize(to: canvas)
        rope.start()
        return rope
    }

    /// How long the rope takes to settle from its own release, in simulated seconds.
    private func settleTime(_ profile: RopeTimeProfile, style: RopeStyle = .thread) -> TimeInterval {
        let rope = makeRope(profile, style: style)
        var seconds = 0.0
        while seconds < 300, !rope.isSleeping {
            rope.step(deltaTime: frame120)
            seconds += frame120
        }
        return seconds
    }

    // MARK: - The afternoon is the rope that shipped

    @Test("The afternoon changes nothing at all")
    func afternoonIsTheIdentity() {
        let physics = RopeTimeProfile.afternoon.physics
        #expect(physics.energyLossScale == 1)
        #expect(physics.releaseAngleScale == 1)
        #expect(physics.restSpeedScale == 1)
        #expect(RopeTimeProfile.baseline == .afternoon)

        // Applied to anything, it is the identity function — so the rope at three in
        // the afternoon is the rope as it shipped, to the last bit.
        for style in RopeStyle.allCases {
            let styled = RopeConfiguration.default.applying(style)
            #expect(styled.applying(style, at: .afternoon) == styled)
        }
        #expect(RopeConfiguration.fitted(to: canvas) == RopeConfiguration.fitted(to: canvas, profile: .afternoon))
    }

    // MARK: - What changes, and what does not

    @Test("Only how long motion lasts changes; the rope itself does not")
    func onlyPersistenceChanges() {
        let base = RopeConfiguration.fitted(to: canvas, profile: .afternoon)

        for profile in RopeTimeProfile.allCases {
            let configuration = RopeConfiguration.fitted(to: canvas, profile: profile)

            // The things that would make it read as a different rope.
            #expect(configuration.gravity == base.gravity, "\(profile) changed the swing period")
            #expect(configuration.segmentCount == base.segmentCount)
            #expect(configuration.segmentLength == base.segmentLength)
            #expect(configuration.maxStretchRatio == base.maxStretchRatio, "\(profile) changed the stiffness")
            #expect(configuration.constraintIterations == base.constraintIterations)
            #expect(configuration.fixedTimeStep == base.fixedTimeStep)
            #expect(configuration.maximumReachRatio == base.maximumReachRatio)

            // And it is still a rope that settles.
            #expect(configuration.damping < 1)
            #expect(configuration.damping > 0.99)
        }
    }

    @Test("A time of day scales what a style already does rather than replacing it")
    func profilesComposeWithStyles() {
        // The point of scaling energy loss instead of writing a damping number:
        // leather loses energy four times faster than thread, and it has to stay
        // that way at every hour or the five styles collapse into each other.
        for profile in RopeTimeProfile.allCases {
            let thread = RopeConfiguration.default.applying(.thread, at: profile)
            let leather = RopeConfiguration.default.applying(.leather, at: profile)
            #expect((1 - leather.damping) > (1 - thread.damping) * 3, "\(profile) flattened the styles")
        }

        // And applying a profile is order-independent and idempotent, like a style.
        let morning = RopeConfiguration.default.applying(.neon, at: .morning)
        #expect(morning.applying(.neon, at: .morning) == morning)
        #expect(RopeConfiguration.default.applying(.goldChain, at: .night).applying(.neon, at: .morning) == morning)
    }

    @Test("Every profile is a distinct rope to the solver, and none is extreme")
    func profilesAreDistinctButModest() {
        let profiles = RopeTimeProfile.allCases
        #expect(profiles.count == 3)

        for (index, profile) in profiles.enumerated() {
            for other in profiles[(index + 1)...] {
                #expect(profile.physics != other.physics)
                #expect(profile.displayName != other.displayName)
            }
            // Nothing here may be dramatic: a half or a double would be a different
            // simulation, not a different time of day.
            let physics = profile.physics
            #expect(physics.energyLossScale >= 0.6 && physics.energyLossScale <= 1.6)
            #expect(physics.releaseAngleScale >= 0.8 && physics.releaseAngleScale <= 1.25)
            #expect(physics.restSpeedScale >= 0.85 && physics.restSpeedScale <= 1.2)
        }
    }

    // MARK: - Behaviour

    @Test("Morning holds a swing longer, night lets it go sooner")
    func settlingDiffersInTheRightDirection() {
        let morning = settleTime(.morning)
        let afternoon = settleTime(.afternoon)
        let night = settleTime(.night)

        #expect(morning > afternoon, "morning settled in \(morning)s against \(afternoon)s")
        #expect(night < afternoon, "night settled in \(night)s against \(afternoon)s")

        // Felt, not watched: far enough apart to notice, near enough that nobody
        // would call it a different rope. A quarter either side of the afternoon.
        #expect(morning < afternoon * 1.75, "morning at \(morning)s is a different rope, not a different hour")
        #expect(night > afternoon * 0.55, "night at \(night)s is a different rope, not a different hour")
    }

    @Test("The ordering holds for every rope, not just for thread")
    func settlingOrderHoldsForEveryStyle() {
        for style in [RopeStyle.thread, .leather, .neon] {
            let morning = settleTime(.morning, style: style)
            let night = settleTime(.night, style: style)
            #expect(morning > night, "\(style) settles the wrong way round")
        }
    }

    @Test("Morning starts a touch wider, night a touch narrower")
    func releaseAnglesDiffer() {
        let angles = RopeTimeProfile.allCases.map {
            RopeConfiguration.fitted(to: canvas, profile: $0).initialAngle
        }
        #expect(angles[0] > angles[1], "morning should greet you with a wider swing")
        #expect(angles[2] < angles[1])
        // Still a swing, not a throw.
        #expect(angles.allSatisfy { $0 > 0.25 && $0 < 0.5 })
    }

    // MARK: - Switching

    @Test("Changing profile mid-swing keeps every node's momentum")
    func changingProfileKeepsMomentum() {
        let rope = makeRope(.afternoon)
        for _ in 0..<120 { rope.step(deltaTime: frame120) }

        let positions = rope.points.map(\.position)
        let displacements = rope.points.map(\.displacement)
        #expect(displacements.contains { $0.magnitude > 0 }, "the rope must be moving for this to mean anything")

        rope.setTimeProfile(.night)

        #expect(rope.points.map(\.position) == positions)
        #expect(rope.points.map(\.displacement) == displacements)
        #expect(rope.configuration.damping < RopeConfiguration.default.damping)
    }

    @Test("Noon arriving does not wake a rope that has gone to sleep")
    func switchingDoesNotWakeTheRope() {
        let rope = makeRope(.afternoon)
        rope.resetToHanging()
        var seconds = 0.0
        while seconds < 60, !rope.isSleeping {
            rope.step(deltaTime: frame120)
            seconds += frame120
        }
        #expect(rope.isSleeping)

        rope.setTimeProfile(.night)
        #expect(rope.isSleeping, "the clock turning over must not cost a second of simulation")
        #expect(rope.timeProfile == .night)
    }

    @Test("A resize keeps the time of day, as it keeps the style")
    func resizingKeepsTheProfile() {
        let rope = RopeSimulation(style: .goldChain, timeProfile: .night)
        rope.start()
        rope.resize(to: CGSize(width: 900, height: 520))

        #expect(rope.timeProfile == .night)
        #expect(rope.style == .goldChain)
        let expected = RopeConfiguration.fitted(to: CGSize(width: 900, height: 520), style: .goldChain, profile: .night)
        #expect(rope.configuration.damping == expected.damping)
    }

    // MARK: - The clock

    @Test("Every hour of the day belongs to exactly one profile")
    func everyHourHasAProfile() {
        for hour in 5..<12 { #expect(RopeTimeProfile.forHour(hour) == .morning, "\(hour):00") }
        for hour in 12..<18 { #expect(RopeTimeProfile.forHour(hour) == .afternoon, "\(hour):00") }
        for hour in 18..<24 { #expect(RopeTimeProfile.forHour(hour) == .night, "\(hour):00") }
        for hour in 0..<5 { #expect(RopeTimeProfile.forHour(hour) == .night, "\(hour):00") }
    }

    @Test("The clock is read where the person is")
    func datesResolveInLocalTime() throws {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = try #require(TimeZone(identifier: "Europe/Lisbon"))

        // Eleven in the morning in Lisbon is seven in the evening in Tokyo.
        let components = DateComponents(year: 2026, month: 6, day: 1, hour: 11)
        let morning = try #require(calendar.date(from: components))
        #expect(RopeTimeProfile.forDate(morning, calendar: calendar) == .morning)

        // The same instant, read in Tokyo, is the evening there.
        var tokyo = calendar
        tokyo.timeZone = try #require(TimeZone(identifier: "Asia/Tokyo"))
        #expect(RopeTimeProfile.forDate(morning, calendar: tokyo) == .night)
    }

    // MARK: - Determinism

    @Test("Each profile is exactly reproducible, and none is random")
    func profilesAreDeterministic() {
        for profile in RopeTimeProfile.allCases {
            let first = makeRope(profile)
            let second = makeRope(profile)
            for _ in 0..<600 {
                first.step(deltaTime: frame120)
                second.step(deltaTime: frame120)
            }
            #expect(
                first.points.map(\.position) == second.points.map(\.position),
                "\(profile) is not reproducible"
            )
        }
    }

    // MARK: - Persistence

    @Test("There is no way to choose a profile by hand any more")
    func theProfileIsAlwaysAutomatic() {
        // The rope keeps the time on its own. A setting that let someone pin it to
        // "Night" made a thing meant to be noticed into a thing to be managed, and
        // the redesign removed it — including from the document.
        let written = try? JSONEncoder().encode(OverlaySettings())
        let json = written.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        #expect(!json.contains("ropeProfile"))
    }

    /// The document has grown three times now. Every older shape still has to open,
    /// keep what it said, and leave the new parts at their defaults.
    @Test("Settings from every earlier build still open")
    func olderSettingsMigrate() throws {
        // Before rope styles: one charm, no style, no profile, no weather.
        let original = Data(#"{"charm":"scarab","opacity":0.5,"scale":1.2}"#.utf8)
        let first = try JSONDecoder().decode(OverlaySettings.self, from: original)
        #expect(first.charm == .builtIn(.scarab))
        #expect(first.ropeStyle == .shipped)
        #expect(first.stack.charms == [.builtIn(.scarab)])

        // After rope styles, before stacks.
        let styled = Data(#"{"charm":"nazar","ropeStyle":"goldChain"}"#.utf8)
        let second = try JSONDecoder().decode(OverlaySettings.self, from: styled)
        #expect(second.ropeStyle == .goldChain)
        #expect(second.stack.charms == [.builtIn(.nazar)])

        // After stacks, before profiles.
        let stacked = Data(#"{"charm":"daruma","charms":["hamsa","daruma"],"ropeStyle":"neon"}"#.utf8)
        let third = try JSONDecoder().decode(OverlaySettings.self, from: stacked)
        #expect(third.stack.charms == [.builtIn(.hamsa), .builtIn(.daruma)])

        // And a document that still names a profile — written by a build from
        // before the redesign — opens with the key simply ignored.
        let newer = Data(#"{"charm":"daruma","ropeProfile":"night","ropeStyle":"leather"}"#.utf8)
        let fourth = try JSONDecoder().decode(OverlaySettings.self, from: newer)
        #expect(fourth.ropeStyle == .leather)
        #expect(fourth.charm == .builtIn(.daruma))
    }
}
