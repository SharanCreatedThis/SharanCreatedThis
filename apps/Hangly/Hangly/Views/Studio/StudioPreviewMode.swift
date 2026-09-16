//
//  StudioPreviewMode.swift
//  Hangly
//
//  Which one of the previews is being looked at.
//

import Foundation

/// The three ways of looking at a charm being made.
///
/// One at a time, on purpose. All three used to be on screen together, which
/// sounds generous and is not: three previews sharing a column are each too small
/// to judge, and the one that matters — the charm — was the smallest of them.
/// Switching costs a click and buys every pixel of the workspace.
enum StudioPreviewMode: String, CaseIterable, Identifiable, Sendable {
    /// The subject with its background gone, on a transparency grid. For judging
    /// the cut-out: edges, haloes, and anything the background removal has eaten.
    case cutout

    /// The finished charm as the rope will draw it, lit and shadowed.
    case charm

    /// The charm hanging, so its weight can be watched rather than read.
    case onRope

    var id: String { rawValue }

    var title: String {
        switch self {
        case .cutout: "Cut-out"
        case .charm: "Charm"
        case .onRope: "On the Rope"
        }
    }

    var symbolName: String {
        switch self {
        case .cutout: "scissors"
        case .charm: "sparkle"
        case .onRope: "link"
        }
    }

    /// What this view is for, in the one line there is room for.
    var caption: String {
        switch self {
        case .cutout: "Check the edges of the cut-out."
        case .charm: "The charm as the rope will draw it."
        case .onRope: "Push it to see how its weight swings."
        }
    }
}
