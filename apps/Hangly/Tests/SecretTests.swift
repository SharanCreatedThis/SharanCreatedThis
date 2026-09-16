//
//  SecretTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// The About window's secrets. The rare tiers are the point of taking the roll as a
/// parameter: a one-in-a-thousand outcome is asserted here exactly, not waited for.
@Suite("Secrets")
struct SecretTests {
    @Test("The listed secrets are all present and distinct")
    func vaultContents() {
        // A floor rather than an exact count: the collection is meant to grow, and a
        // test that has to be edited every time somebody thinks of a good line is a
        // test that will eventually be edited without being read. What matters is
        // that there are enough of them not to repeat, and that none is a duplicate.
        #expect(SecretVault.common.count >= 15)
        #expect(Set(SecretVault.common.map(\.message)).count == SecretVault.common.count)

        for secret in SecretVault.common {
            #expect(secret.rarity == .common)
            #expect(secret.title == nil)
            #expect(!secret.message.isEmpty)
        }

        #expect(SecretVault.rare.title == "Achievement Unlocked")
        #expect(SecretVault.rare.message == "You found the rare secret.")
        #expect(SecretVault.rare.attribution == "– sharancreatedthis")
        #expect(SecretVault.ultraRare.title == "There is no secret.")
        #expect(SecretVault.ultraRare.message == "You just really like clicking buttons.")
    }

    // MARK: - Notes, which are not luck

    @Test("A creator note is due on its own count and on no other")
    func notesAreDueOnExactCounts() {
        let thresholds = SecretVault.notes.map(\.threshold)

        // Ascending, distinct, and none of them on the first press: a note found
        // immediately is not a note, it is the app introducing itself again.
        #expect(thresholds == thresholds.sorted())
        #expect(Set(thresholds).count == thresholds.count)
        #expect((thresholds.first ?? 0) > 1)

        for threshold in thresholds {
            #expect(SecretVault.note(unlockedAt: threshold)?.rarity == .creatorNote)
            #expect(SecretVault.note(unlockedAt: threshold - 1) == nil)
            #expect(SecretVault.note(unlockedAt: threshold + 1) == nil)
        }

        for note in SecretVault.notes.map(\.secret) {
            #expect(note.title?.isEmpty == false)
            #expect(!note.message.isEmpty)
        }
    }

    @Test("A note outranks the dice on the count it is due")
    func notesBeatTheRoll() {
        guard let first = SecretVault.notes.first else { return }

        var vault = SecretVault()
        #expect(vault.reveal(lifetimeCount: first.threshold) == first.secret)
        // And it counts, so the session tally does not silently skip one.
        #expect(vault.revealedCount == 1)

        // One either side is an ordinary reveal.
        var before = SecretVault()
        #expect(before.reveal(lifetimeCount: first.threshold - 1).rarity != .creatorNote)
        var after = SecretVault()
        #expect(after.reveal(lifetimeCount: first.threshold + 1).rarity != .creatorNote)
    }

    @Test("The trail points at the next note and then stops")
    func nextNote() {
        let thresholds = SecretVault.notes.map(\.threshold)
        #expect(SecretVault.nextNote(after: 0) == thresholds.first)

        for (index, threshold) in thresholds.enumerated() {
            // Standing on one points at the one after it.
            #expect(SecretVault.nextNote(after: threshold) == thresholds[safe: index + 1])
        }

        // Past the last there is nothing left to promise.
        #expect(SecretVault.nextNote(after: (thresholds.last ?? 0) + 1) == nil)
    }

    // MARK: - The rare tiers, exactly

    @Test("The ultra-rare secret appears below one in a thousand and nowhere above it")
    func ultraRareBoundary() {
        var vault = SecretVault()

        #expect(vault.reveal(rarityRoll: 0, selection: 0) == SecretVault.ultraRare)
        #expect(vault.reveal(rarityRoll: 0.0009, selection: 0) == SecretVault.ultraRare)
        // The boundary itself belongs to the next tier up.
        #expect(vault.reveal(rarityRoll: 0.001, selection: 0) != SecretVault.ultraRare)
    }

    @Test("The rare secret occupies exactly the next one percent")
    func rareBoundary() {
        var vault = SecretVault()

        #expect(vault.reveal(rarityRoll: 0.001, selection: 0) == SecretVault.rare)
        #expect(vault.reveal(rarityRoll: 0.0109, selection: 0) == SecretVault.rare)

        let common = vault.reveal(rarityRoll: 0.011, selection: 0)
        #expect(common.rarity == .common)
    }

    @Test("Everything above the rare tiers is a common secret")
    func commonTier() {
        var vault = SecretVault()
        for roll in stride(from: 0.02, to: 1.0, by: 0.02) {
            let secret = vault.reveal(rarityRoll: roll, selection: 0.5)
            #expect(secret.rarity == .common, "roll \(roll) produced \(secret.rarity)")
        }
    }

    @Test("The odds are what the window implies they are")
    func statedProbabilities() {
        #expect(SecretVault.ultraRareProbability == 0.001)
        #expect(SecretVault.rareProbability == 0.01)

        // Sampled across the whole range, the tiers land where they should.
        var vault = SecretVault()
        var counts: [Secret.Rarity: Int] = [:]
        let samples = 100_000
        for step in 0..<samples {
            let roll = Double(step) / Double(samples)
            counts[vault.reveal(rarityRoll: roll, selection: 0.5).rarity, default: 0] += 1
        }
        #expect(counts[.ultraRare] == 100)
        #expect(counts[.rare] == 1_000)
        #expect(counts[.common] == samples - 1_100)
    }

    // MARK: - Selection

    @Test("Every common secret is reachable")
    func selectionCoversThePool() {
        var vault = SecretVault()
        var seen: Set<String> = []
        // Walk the selection range finely enough to land in every slot, whichever
        // one is excluded as the previous pick.
        for step in 0..<2_000 {
            let selection = Double(step) / 2_000
            seen.insert(vault.reveal(rarityRoll: 0.5, selection: selection).message)
        }
        #expect(seen.count == SecretVault.common.count)
    }

    @Test("A common secret never repeats immediately")
    func noImmediateRepeats() {
        var vault = SecretVault()
        var previous: Secret?
        for step in 0..<500 {
            // A selection that would otherwise keep landing on the same slot.
            let secret = vault.reveal(rarityRoll: 0.5, selection: Double(step % 3) / 3)
            #expect(secret != previous, "repeated \(secret.message) at step \(step)")
            previous = secret
        }
    }

    @Test("Selection at the very top of the range stays inside the pool")
    func selectionClamps() {
        var vault = SecretVault()
        let secret = vault.reveal(rarityRoll: 0.5, selection: 0.999_999_999)
        #expect(secret.rarity == .common)
        #expect(SecretVault.common.contains(secret))
    }

    // MARK: - The session counter

    @Test("Every reveal counts, whichever tier it came from")
    func countsEveryReveal() {
        var vault = SecretVault()
        #expect(vault.revealedCount == 0)

        _ = vault.reveal(rarityRoll: 0, selection: 0)
        _ = vault.reveal(rarityRoll: 0.005, selection: 0)
        _ = vault.reveal(rarityRoll: 0.5, selection: 0)
        #expect(vault.revealedCount == 3)

        for _ in 0..<20 { _ = vault.reveal() }
        #expect(vault.revealedCount == 23)
    }

    @Test("Real randomness only ever produces a secret from the vault")
    func liveRevealsAreWellFormed() {
        var vault = SecretVault()
        for _ in 0..<5_000 {
            let secret = vault.reveal()
            switch secret.rarity {
            case .common: #expect(SecretVault.common.contains(secret))
            case .rare: #expect(secret == SecretVault.rare)
            case .ultraRare: #expect(secret == SecretVault.ultraRare)
            // Notes are earned, never rolled. A roll that produced one would mean
            // the ladder had leaked into the dice.
            case .creatorNote: Issue.record("A creator note came out of a random reveal")
            }
        }
    }
}

extension Array {
    /// The element at an index, or nil when there is not one.
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
