//
//  CharmStackTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing

@testable import Hangly

/// The stack as a value, how it is stored, and where it puts the charms.
///
/// The geometry here is checked against every charm in the catalogue in every place
/// on the rope, because "no overlap and no clipping" is a claim about arithmetic and
/// arithmetic can be exhausted. `CharmStackBehaviourTests` swings the results.
@Suite("Charm stack")
@MainActor
struct CharmStackTests {
    private let canvas = CGSize(width: 740, height: 420)
    private var configuration: RopeConfiguration { .fitted(to: canvas) }

    // MARK: - The value

    @Test("A stack is never empty and never longer than three")
    func aStackIsAlwaysUsable() {
        #expect(CharmStack([]).count == 1)
        #expect(CharmStack([]).bottom == OverlaySettings.fallbackCharm)

        let long = CharmStack(BuiltInCharms.all.map(\.id))
        #expect(long.count == CharmStack.maximumCount)

        var stack = CharmStack(.builtIn(.daruma))
        stack.setCount(9)
        #expect(stack.count == 3)
        stack.setCount(-4)
        #expect(stack.count == 1)
    }

    @Test("Changing the number of charms never loses one")
    func changingCountKeepsWhatMatters() {
        var stack = CharmStack(.builtIn(.nazar))
        stack.setCount(3)
        #expect(stack.charms == [.builtIn(.nazar), .builtIn(.nazar), .builtIn(.nazar)])

        stack[0] = .builtIn(.hamsa)
        stack[1] = .builtIn(.scarab)
        let chosen = stack.charms

        // Shrinking hides places from the top, so the charm on the end — the one
        // being looked at — is the one that stays.
        stack.setCount(1)
        #expect(stack.charms == [.builtIn(.nazar)])

        // And growing brings back exactly what was hidden, rather than three copies
        // of the survivor. A count control nudged and put back costs nothing.
        stack.setCount(3)
        #expect(stack.charms == chosen)
    }

    @Test("A deleted charm cannot come back when the stack grows again")
    func replacingReachesHiddenSlotsToo() {
        let doomed = CharmID.custom(UUID())
        var stack = CharmStack([doomed, .builtIn(.nazar), .builtIn(.daruma)])
        stack.setCount(1)
        stack.replace(doomed, with: .builtIn(.circle))
        stack.setCount(3)

        #expect(!stack.contains(doomed))
        #expect(stack.charms == [.builtIn(.circle), .builtIn(.nazar), .builtIn(.daruma)])
    }

    @Test("The bottom charm is the charm every older part of the app means")
    func theBottomCharmIsTheCharm() {
        var settings = OverlaySettings()
        settings.stack = CharmStack([.builtIn(.hamsa), .builtIn(.scarab), .builtIn(.daruma)])

        #expect(settings.charm == .builtIn(.daruma))
        settings.charm = .builtIn(.ghanta)
        #expect(settings.stack.charms == [.builtIn(.hamsa), .builtIn(.scarab), .builtIn(.ghanta)])
    }

    @Test("Replacing a charm reaches every place it hangs")
    func replacingReachesEverySlot() {
        let doomed = CharmID.custom(UUID())
        var stack = CharmStack([doomed, .builtIn(.nazar), doomed])
        stack.replace(doomed, with: .builtIn(.circle))

        #expect(stack.charms == [.builtIn(.circle), .builtIn(.nazar), .builtIn(.circle)])
        #expect(!stack.contains(doomed))
    }

    // MARK: - Persistence

    @Test("A stack survives a round trip, and so does a document that predates it")
    func stacksPersist() throws {
        var settings = OverlaySettings()
        settings.stack = CharmStack([.builtIn(.hamsa), .builtIn(.daruma)])
        let restored = try JSONDecoder().decode(
            OverlaySettings.self,
            from: JSONEncoder().encode(settings)
        )
        #expect(restored.stack.charms == settings.stack.charms)
        #expect(restored == settings)

        // A document written before stacks names one charm and no list.
        let old = Data(#"{"charm":"scarab","opacity":0.5}"#.utf8)
        let upgraded = try JSONDecoder().decode(OverlaySettings.self, from: old)
        #expect(upgraded.stack.charms == [.builtIn(.scarab)])
        #expect(upgraded.opacity == 0.5)
    }

    @Test("Charms put away come back after a relaunch, not three copies of one")
    func hiddenSlotsSurviveALaunch() throws {
        var settings = OverlaySettings()
        settings.stack = CharmStack([.builtIn(.hamsa), .builtIn(.scarab), .builtIn(.daruma)])
        settings.stack.setCount(1)

        let restored = try JSONDecoder().decode(
            OverlaySettings.self,
            from: JSONEncoder().encode(settings)
        )
        #expect(restored.stack.charms == [.builtIn(.daruma)])

        var grown = restored.stack
        grown.setCount(3)
        #expect(grown.charms == [.builtIn(.hamsa), .builtIn(.scarab), .builtIn(.daruma)])
    }

    @Test("The bottom charm is written where an older build will find it")
    func downgradingKeepsACharmOnTheRope() throws {
        var settings = OverlaySettings()
        settings.stack = CharmStack([.builtIn(.hamsa), .builtIn(.ghanta)])
        let written = try JSONSerialization.jsonObject(
            with: JSONEncoder().encode(settings)
        ) as? [String: Any]

        #expect(written?["charm"] as? String == "ghanta")
        #expect(written?["charms"] as? [String] == ["hamsa", "ghanta"])
    }

    @Test("A settings file naming a charm that no longer exists loses the stack, not the app")
    func anUnreadableCharmFallsBack() throws {
        let broken = Data(#"{"charms":["hamsa","no-such-charm"],"charm":"scarab"}"#.utf8)
        let settings = try JSONDecoder().decode(OverlaySettings.self, from: broken)

        #expect(settings.stack.charms == [.builtIn(.scarab)])
    }

    // MARK: - Where the charms go

    @Test("Charms divide the rope, and the last one always takes the end")
    func attachmentsDivideTheRope() {
        let attach = { RopeConfiguration.Layout.attachments(forCharmCount: $0, segmentCount: 20) }

        #expect(attach(1) == [20])
        #expect(attach(2) == [10, 20])
        #expect(attach(3) == [6, 13, 20])

        for count in 1...CharmStack.maximumCount {
            let nodes = attach(count)
            #expect(nodes.count == count)
            #expect(nodes.last == 20, "the bottom charm must hang on the end of the rope")
            #expect(nodes == nodes.sorted())
            #expect(Set(nodes).count == count, "two charms cannot share a node")
            #expect(nodes.allSatisfy { $0 > 0 }, "no charm may hang on the anchor")
        }
    }

    @Test("One charm is sized and placed exactly as it was before stacks existed")
    func oneCharmIsUntouched() {
        for charm in BuiltInCharms.all {
            let layout = CharmStackLayout.resolve(
                metrics: [charm.metrics],
                beadReach: [CharmBead.reach(of: charm.beads)],
                configuration: configuration
            )
            let slot = try? #require(layout.slots.first)
            #expect(slot?.node == 20)
            #expect(slot?.radius == configuration.totalLength * charm.metrics.radiusRatio)
        }
    }

    /// Exhaustive rather than representative: every charm in the catalogue, in every
    /// place, at every count. "No overlap" and "no clipping" are claims about this
    /// function, and this function is cheap enough to ask about all of them.
    @Test("No two charms overlap and none falls off the canvas, whatever the choice")
    func noCombinationOverlapsOrClips() {
        let all = BuiltInCharms.all
        let anchor = RopeConfiguration.Layout.anchor(in: canvas)
        let segment = configuration.segmentLength

        for first in all {
            for second in all {
                // A representative third rather than all sixteen: the pair above is
                // what decides spacing, and this keeps the sweep at a few thousand
                // rather than tens of thousands.
                for third in [all[0], all[all.count / 2], all[all.count - 1]] {
                    for charms in [[first], [first, second], [first, second, third]] {
                        let layout = CharmStackLayout.resolve(
                            metrics: charms.map(\.metrics),
                            beadReach: charms.map { CharmBead.reach(of: $0.beads) },
                            configuration: configuration
                        )
                        let names = charms.map(\.displayName).joined(separator: " + ")

                        // On a rope hanging straight, which is where they rest.
                        for index in 0..<(layout.slots.count - 1) {
                            let gap = Double(layout.slots[index + 1].node - layout.slots[index].node) * segment
                            let needed = layout.slots[index].radius + layout.slots[index + 1].radius
                            #expect(gap >= needed, "\(names) overlap by \(needed - gap) points")
                        }

                        // Nothing pokes out of the top or the bottom of the canvas.
                        for slot in layout.slots {
                            let centre = anchor.y + (Double(slot.node) * segment)
                            let halo = slot.radius * RopeConfiguration.Layout.charmHaloExtent
                            #expect(centre - halo >= -1e-9, "\(names) reaches above the canvas")
                            #expect(centre + halo <= canvas.height, "\(names) hangs past the canvas")
                        }
                    }
                }
            }
        }
    }

    @Test("Every charm's beads get cord to hang in")
    func everyCharmHasRoomForItsBeads() {
        let all = BuiltInCharms.all
        for first in all {
            for second in all {
                let charms = [first, second, BuiltInCharms.charm(for: .daruma)]
                let layout = CharmStackLayout.resolve(
                    metrics: charms.map(\.metrics),
                    beadReach: charms.map { CharmBead.reach(of: $0.beads) },
                    configuration: configuration
                )
                for (index, slot) in layout.slots.enumerated() {
                    let needed = CharmBead.reach(of: charms[index].beads) * slot.radius
                    #expect(
                        slot.beadSpan >= needed - 1e-9,
                        "\(charms[index].displayName) has \(slot.beadSpan) points for \(needed) of beads"
                    )
                }
            }
        }
    }

    @Test("An outsized imported charm is cut down rather than allowed to collide")
    func anOversizedCharmIsCapped() {
        // Larger than anything the Studio can make, let alone the catalogue.
        let giant = CharmMetrics(mass: 3, radiusRatio: 0.9, knotInset: 0.9)
        let layout = CharmStackLayout.resolve(
            metrics: [giant, giant, giant],
            beadReach: [0, 0, 0],
            configuration: configuration
        )

        let segment = configuration.segmentLength
        for index in 0..<(layout.slots.count - 1) {
            let gap = Double(layout.slots[index + 1].node - layout.slots[index].node) * segment
            #expect(layout.slots[index].radius + layout.slots[index + 1].radius <= gap)
        }
        #expect(layout.slots.allSatisfy { $0.radius < configuration.totalLength * 0.9 })
    }

    // MARK: - Naming

    @Test("Places on the rope are named by where they hang")
    func slotsAreNamedByPlace() {
        #expect(CharmStack.slotName(0, of: 1) == "Charm")
        #expect(CharmStack.slotName(0, of: 2) == "Top")
        #expect(CharmStack.slotName(1, of: 2) == "Bottom")
        #expect(CharmStack.slotName(0, of: 3) == "Top")
        #expect(CharmStack.slotName(1, of: 3) == "Middle")
        #expect(CharmStack.slotName(2, of: 3) == "Bottom")
    }
}
