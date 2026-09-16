//
//  LibraryCollection.swift
//  Hangly
//
//  What the Library is a library of.
//

import Foundation

/// The two things a rope is made of, as one collection with two shelves.
///
/// Users think in terms of what they own, not in terms of which subsystem draws it.
/// Rope styles used to live only in the menu bar, which made them a setting; here
/// they are part of the collection, which is what they actually are.
enum LibraryCollection: String, CaseIterable, Identifiable, Sendable {
    case charms
    case ropes

    var id: String { rawValue }

    var title: String {
        switch self {
        case .charms: "Charms"
        case .ropes: "Ropes"
        }
    }
}

/// One rope style as the Library lists it.
struct RopeItem: Identifiable, Hashable, Sendable {
    let id: RopeStyle
    let name: String
    let summary: String

    /// The words search looks through, folded once so filtering is cheap.
    var searchText: String {
        "\(name) \(summary)".searchFolded
    }

    init(_ style: RopeStyle) {
        id = style
        name = style.displayName
        summary = style.summary
    }
}
