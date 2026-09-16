//
//  CharmCollection.swift
//  Hangly
//
//  The four collections, and the cord each one hangs on.
//

import Foundation

/// A themed set of charms that arrived together and belongs together.
///
/// Not the same thing as a `CharmCategory`. A category says what a charm is *for* —
/// protection, luck, ritual — and the eleven hand-drawn charms are spread across all
/// of them. A collection says where a charm *came from*: everything in one arrived
/// in the same release, drawn in the same sitting, in the same palette. That is why
/// collections get hero cards and categories do not — a category is a filter, and a
/// collection is something you might want to look at whole.
///
/// The Library document gives each of these charms a category whose id matches the
/// collection's, so no charm is uncategorised; `CharmLibraryViewModel` then drops
/// those four from the category chips, because a chip *and* a hero card for the same
/// set would be the same tap in two places.
///
/// Declared in the order they are offered.
enum CharmCollection: String, CaseIterable, Codable, Sendable, Identifiable {
    case marvel
    case dc
    case tamilSpiritual
    case bts

    var id: String { rawValue }

    /// On the chip, and as the hero card's heading.
    var chipName: String {
        switch self {
        case .marvel: "Marvel"
        case .dc: "DC"
        case .tamilSpiritual: "Tamil Spiritual"
        case .bts: "BTS"
        }
    }

    /// The full name, for anywhere with room for it.
    var displayName: String {
        switch self {
        case .marvel: "Marvel Collection"
        case .dc: "DC Collection"
        case .tamilSpiritual: "Tamil Spiritual Collection"
        case .bts: "BTS Collection"
        }
    }

    var summary: String {
        switch self {
        case .marvel: "Iconic Marvel-inspired charms designed as hanging ornaments."
        case .dc: "Legendary DC-inspired symbols reimagined as hanging charms."
        case .tamilSpiritual: "Traditional Tamil spiritual symbols and guardian deities."
        case .bts: "Stylized BTS-inspired collectible hanging charms."
        }
    }

    /// The cord this collection was drawn to hang on.
    ///
    /// Offered when a charm from the collection is chosen, and only if the rope is
    /// still whatever it was shipped as — see `CharmManager.select(_:)`. It is a
    /// suggestion the app makes once, not a rule the collection enforces.
    var defaultRope: RopeStyle {
        switch self {
        case .marvel: .spiderThread
        case .dc: .midnightCord
        case .tamilSpiritual: .templeThread
        case .bts: .silverCord
        }
    }

    /// What is in it, in the order the Library shows them.
    var charms: [CharmKind] {
        switch self {
        case .marvel:
            [.spiderMan, .captainAmericaShield, .ironManHelmet, .thorHammer, .hulkFist]
        case .dc:
            [
                .batmanSymbol, .supermanShield, .wonderWomanEmblem, .shazamLightning,
                .greenLanternRing
            ]
        case .tamilSpiritual:
            [.vel, .vinayagarCoin, .omSymbol, .karuppuStatue, .templeBell]
        case .bts:
            [
                .btsMemberOne, .btsMemberTwo, .btsMemberThree, .btsMemberFour, .btsMemberFive,
                .btsMemberSix, .btsMemberSeven
            ]
        }
    }

    /// The three charms a hero card fans out as its cover.
    ///
    /// Drawn from the collection's own artwork rather than being a picture of it: a
    /// static cover is one more asset to keep in step, and this one cannot go stale
    /// because it *is* the charms.
    var coverCharms: [CharmKind] {
        Array(charms.prefix(3))
    }

    /// The collection a charm belongs to, or `nil` for the hand-drawn set, the
    /// classics, the seasonal packs and imports.
    static func containing(_ kind: CharmKind) -> CharmCollection? {
        allCases.first { $0.charms.contains(kind) }
    }

    /// The collection a charm belongs to, for any identity. An import has none.
    static func containing(_ id: CharmID) -> CharmCollection? {
        guard case .builtIn(let kind) = id else { return nil }
        return containing(kind)
    }
}
