//
//  ArtworkMemory.swift
//  Hangly
//
//  Giving back what a window borrowed.
//

import Foundation
import OSLog

/// Reclaims the artwork Customize rasterised, when Customize closes.
///
/// Hangly idles at 23 MB, and a visit to Customize takes it to around 60. Before
/// this existed none of that came back: the Library rasterises every charm in the
/// collection at card size, About draws the current one larger than life at the top
/// of the page, Create previews every import ever made, and all of it stayed
/// resident behind a closed window for the rest of the run.
///
/// This is not the whole of that 37 MB and does not claim to be — see
/// `Docs/RC2-Audit.md` §2 for what the rest is and why it does not come back. It is
/// the part that is the app's to give.
///
/// Three stores hold it, and this empties the part of each that nothing is looking
/// at:
///
/// - **`VectorImage`**, one per collection and seasonal charm, holding up to
///   twenty-four rendered bitmaps each. Only the ones tagged `.interface` go; the
///   rope's own are tagged `.overlay` and are left exactly as they were.
/// - **`CustomCharmStore`**, holding the decoded bitmap of every import the Library
///   and Create's "Made here" strip drew. Only the imports currently on the rope
///   are kept.
/// - **`CharmStudioViewModel`**, holding the source, the isolated subject and the
///   draft of whatever was last taken through Create — three full-resolution images
///   of a photograph. Kept if there is unsaved work in them, because a window
///   closing is not a decision to throw somebody's charm away.
///
/// What is deliberately *not* dropped: the measured regions that say where a
/// charm's beads end and its body begins. They are rectangles, not bitmaps, they
/// cost a rasterisation each to work out again, and the rope reads them on every
/// step whether a window is open or not.
@MainActor
struct ArtworkMemory {
    let charms: CharmManager
    let customCharms: CustomCharmStore
    let studio: CharmStudioViewModel

    /// What one purge gave back, for the log and for the tests.
    struct Report: Equatable {
        var rasters = 0
        var importedBitmaps = 0
        var weatheredBitmaps = 0
        var discardedWorkspace = false

        var isEmpty: Bool {
            rasters == 0 && importedBitmaps == 0 && weatheredBitmaps == 0 && !discardedWorkspace
        }
    }

    /// Drops every cached bitmap a window made and nothing on the rope needs.
    ///
    /// Safe to call at any time, including with Customize open — everything it
    /// forgets is remade in a few milliseconds by the next thing that draws it. It
    /// is called on close because that is when the saving is largest and the cost
    /// of remaking is furthest away.
    @discardableResult
    func reclaim() -> Report {
        var report = Report()

        for charm in BuiltInCharms.all {
            guard let vector = (charm as? SVGCharm)?.vector else { continue }
            report.rasters += vector.purgeInterfaceRasters()
        }

        // Imports on the rope keep their bitmaps: the overlay draws straight from
        // them, and re-decoding a PNG is not something to do on a frame boundary.
        let onRope = Set(charms.stack.charms.compactMap(\.customID))
        report.importedBitmaps = customCharms.purgeBitmaps(keeping: onRope)
        report.weatheredBitmaps = WeatheredImageCache.shared.purge(
            retaining: customCharms.retainedBitmapIdentities
        )

        report.discardedWorkspace = studio.discardFinishedWork()

        if !report.isEmpty {
            Logger.overlay.diagnostic(
                """
                Reclaimed artwork: \(report.rasters) raster(s), \
                \(report.importedBitmaps) import(s), \
                \(report.weatheredBitmaps) weathered, \
                workspace \(report.discardedWorkspace ? "discarded" : "kept").
                """
            )
        }
        return report
    }
}
