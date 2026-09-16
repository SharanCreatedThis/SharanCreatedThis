//
//  Secret.swift
//  Hangly
//
//  The things the About window will tell you if you ask it enough times.
//

import Foundation

/// One thing the app admits to.
struct Secret: Hashable, Sendable {
    enum Rarity: Hashable, Sendable {
        case common
        case rare
        case ultraRare

        /// Not luck. Earned by having asked enough times, which is a different
        /// kind of rare and worth telling apart from the rolled tiers.
        case creatorNote
    }

    /// Shown above the message, in the emphasised face. The common secrets have none.
    var title: String?

    var message: String

    /// A signature, for the one secret that has earned one.
    var attribution: String?

    var rarity: Rarity

    init(title: String? = nil, message: String, attribution: String? = nil, rarity: Rarity = .common) {
        self.title = title
        self.message = message
        self.attribution = attribution
        self.rarity = rarity
    }
}

/// Picks a secret, and remembers enough not to be boring about it.
///
/// The roll is a parameter rather than something this reaches for itself, which is
/// what makes a one-in-a-thousand outcome testable: a test asks for the roll it
/// wants and gets the secret that roll should produce. `reveal()` supplies real
/// randomness for the app.
struct SecretVault: Equatable {
    /// Chance of the ultra-rare secret, per reveal.
    static let ultraRareProbability = 0.001

    /// Chance of the rare secret, per reveal.
    static let rareProbability = 0.01

    static let rare = Secret(
        title: "Achievement Unlocked",
        message: "You found the rare secret.",
        attribution: "– sharancreatedthis",
        rarity: .rare
    )

    static let ultraRare = Secret(
        title: "There is no secret.",
        message: "You just really like clicking buttons.",
        rarity: .ultraRare
    )

    /// Notes from the person who made the app, unlocked by persistence.
    ///
    /// Each is due on one exact count and on no other, which is what makes them
    /// findable: somebody who keeps pressing the button gets something nobody who
    /// pressed it twice will ever see, and the ladder can be asserted on rather
    /// than waited for.
    static let notes: [(threshold: Int, secret: Secret)] = [
        (5, Secret(
            title: "Note from the maker",
            message: "I built this because my desk was too tidy. It is not any more.",
            attribution: "– sharancreatedthis",
            rarity: .creatorNote
        )),
        (15, Secret(
            title: "Note from the maker",
            message: """
            The charms are real objects. People hang them on doors, mirrors, \
            rear-view mirrors and babies. Yours hangs on a menu bar.
            """,
            attribution: "– sharancreatedthis",
            rarity: .creatorNote
        )),
        (40, Secret(
            title: "Note from the maker",
            message: """
            Forty. At this point you have spent longer here than I spent naming \
            the app. Thank you for that, genuinely.
            """,
            attribution: "– sharancreatedthis",
            rarity: .creatorNote
        )),
        (100, Secret(
            title: "The last note",
            message: "There are no more notes. There is still a charm. Go and look at it.",
            attribution: "– sharancreatedthis",
            rarity: .creatorNote
        ))
    ]

    /// The note due at a given lifetime count, if one is.
    static func note(unlockedAt count: Int) -> Secret? {
        notes.first { $0.threshold == count }?.secret
    }

    /// How many secrets it takes to reach the next note, from a given count.
    static func nextNote(after count: Int) -> Int? {
        notes.map(\.threshold).first { $0 > count }
    }

    static let common: [Secret] = [
        Secret(message: "The charm believes in you."),
        Secret(message: "No charms were harmed during testing."),
        Secret(message: "This rope has survived more swings than most relationships."),
        Secret(message: "Physics simulation: 97%. The remaining 3% is hope."),
        Secret(message: "Every swing is calculated. The luck is not."),
        Secret(message: "The rope knows where it is. The rope knows where it isn't."),
        Secret(message: "You're supposed to be working right now."),
        Secret(message: "This app began as: \"What if desktop icons needed emotional support?\""),
        Secret(message: "Warning: Excessive charm staring may reduce productivity."),
        Secret(message: "Today's luck level: ████████░░"),
        Secret(message: "Your charm has been silently judging your desktop organization."),
        Secret(message: "The charm has witnessed every tab you've left open."),
        Secret(message: "The physics engine is working harder than it looks."),
        Secret(message: "Gravity is doing most of the work."),
        Secret(message: "Somewhere, a charm is swinging perfectly."),
        Secret(message: "This rope secretly prefers neon."),
        Secret(message: "Physics does most of the work. The charm takes the credit."),
        Secret(message: "Some charms swing longer when nobody is watching.")
    ]

    /// How many secrets have been revealed since the app started.
    private(set) var revealedCount = 0

    /// The last common secret shown, so the next one can avoid it.
    private(set) var lastCommon: Secret?

    /// Reveals a secret using real randomness.
    mutating func reveal() -> Secret {
        reveal(rarityRoll: .random(in: 0..<1), selection: .random(in: 0..<1))
    }

    /// Reveals the secret due at a given point in an install's history.
    ///
    /// - Parameter lifetimeCount: How many secrets this install has been told,
    ///   counting the one being asked for now.
    ///
    /// A creator note outranks the dice. Somebody arriving at their fifth secret
    /// should get the note for it rather than a one-in-a-thousand chance of getting
    /// something else instead and never seeing the note again.
    mutating func reveal(lifetimeCount: Int) -> Secret {
        guard let note = Self.note(unlockedAt: lifetimeCount) else { return reveal() }
        revealedCount += 1
        return note
    }

    /// Reveals a secret from two rolls.
    ///
    /// - Parameters:
    ///   - rarityRoll: In `0..<1`. Decides which tier the secret comes from.
    ///   - selection: In `0..<1`. Chooses within the common secrets.
    /// - Returns: The secret to show.
    ///
    /// A common secret never immediately repeats: the one just shown is taken out of
    /// the running, and `selection` chooses from what is left. The two rare secrets
    /// are exempt — they are rare enough that seeing one twice in a row is a story
    /// rather than a repetition, and excluding them would quietly bend the odds the
    /// rest of this type exists to keep honest.
    mutating func reveal(rarityRoll: Double, selection: Double) -> Secret {
        revealedCount += 1

        if rarityRoll < Self.ultraRareProbability {
            return Self.ultraRare
        }
        if rarityRoll < Self.ultraRareProbability + Self.rareProbability {
            return Self.rare
        }

        let candidates = Self.common.filter { $0 != lastCommon }
        let pool = candidates.isEmpty ? Self.common : candidates
        guard !pool.isEmpty else { return Self.rare }

        let index = min(pool.count - 1, max(0, Int(selection * Double(pool.count))))
        let secret = pool[index]
        lastCommon = secret
        return secret
    }
}

extension Character {
    /// Whether this is one of Unicode's Block Elements — the shaded rectangles a
    /// progress bar can be spelled with.
    var isBlockElement: Bool {
        guard let scalar = unicodeScalars.first, unicodeScalars.count == 1 else { return false }
        return (0x2580...0x259F).contains(Int(scalar.value))
    }
}
