//
//  ArtworkUsage.swift
//  Hangly
//
//  What a rasterised charm is for, so the ones that can be forgotten are known.
//

import SwiftUI

/// What a cached rasterisation of a charm exists to draw.
///
/// Rasterising a vector charm is expensive, so `VectorImage` keeps the results —
/// and the overlay, which draws at 120 Hz, depends on that. But the same caches
/// fill up with artwork nobody is looking at: browsing the Library rasterises
/// twenty-seven charms at card size, About draws the current charm larger than life
/// at the top of the page, and Create previews every import ever made. Close the
/// window and all of it is still resident.
///
/// This is what separates the two. A raster made for the overlay is a raster
/// something is looking at right now; a raster made for a window is one that can be
/// thrown away when the window goes, and made again in a few milliseconds if the
/// window comes back.
enum ArtworkUsage: Hashable, Sendable {
    /// Drawn on the rope, on screen, now. Never purged.
    case overlay

    /// Drawn inside a window — a Library card, the About rope, a Create preview.
    /// Purged when the window closes.
    case interface
}

private struct ArtworkUsageKey: EnvironmentKey {
    /// Interface, because a view that has not said otherwise is a window.
    ///
    /// Defaulting the other way would mean a new preview surface silently pinned its
    /// artwork in memory for the life of the app until somebody noticed.
    static let defaultValue = ArtworkUsage.interface
}

extension EnvironmentValues {
    /// Set to `.overlay` by the one view that is the overlay. Read by the renderer
    /// through `GraphicsContext.environment`, so no drawing code has to be told
    /// twice which side of the line it is on.
    var artworkUsage: ArtworkUsage {
        get { self[ArtworkUsageKey.self] }
        set { self[ArtworkUsageKey.self] = newValue }
    }
}
