//
//  CustomizeSection.swift
//  Hangly
//
//  The four places customization lives.
//

import Foundation

/// A page of the Customize window.
///
/// Four, and the count is the point. Hangly used to spread the same ideas across a
/// menu, a tabbed Settings window, a Charm Library and an AI Studio — four surfaces,
/// eight duplicated concepts, and a user who had to learn the app's architecture
/// before they could change their charm. These are the four questions somebody
/// actually has: *which charm, make one, how it looks, what is this*.
enum CustomizeSection: String, CaseIterable, Codable, Sendable, Identifiable {
    /// Which charms hang, in what order.
    case library

    /// Making one. The old AI Studio, no longer a separate place to go.
    case create

    /// How it all looks and behaves.
    case appearance

    case about

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .library: "Library"
        case .create: "Create"
        case .appearance: "Appearance"
        case .about: "About"
        }
    }

    var symbolName: String {
        switch self {
        case .library: "square.grid.2x2"
        case .create: "wand.and.sparkles"
        case .appearance: "paintbrush"
        case .about: "info.circle"
        }
    }
}
