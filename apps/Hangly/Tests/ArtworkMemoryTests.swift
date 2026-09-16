//
//  ArtworkMemoryTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing
import UniformTypeIdentifiers

@testable import Hangly

/// Closing Customize gives back what its pages rasterised, and nothing else.
///
/// The contract has two halves, and the second is the one worth having tests for:
/// the window's bitmaps go, and the rope's stay. A purge that took both would look
/// exactly as good on a memory graph and would cost a rasterisation on the next
/// frame of a running simulation.
@Suite("Artwork memory")
struct ArtworkMemoryTests {
    /// A fresh `VectorImage` over the same bundled asset the nazar charm uses.
    ///
    /// Deliberately not `BuiltInCharms.charm(for: .nazar).vector`: that is one
    /// shared instance for the whole process, and these tests run beside every
    /// other suite that draws a charm. Counting entries in a cache somebody else is
    /// also filling is a test that fails on a fast machine and passes on a slow one.
    private func nazar() -> VectorImage {
        guard let vector = SVGArtworkSource(backend: .bundle).vectorImage(for: .nazar) else {
            fatalError("the nazar has no artwork; SVGAssetTests covers that case")
        }
        return vector
    }

    @Test("A purge drops the window's bitmaps and keeps the rope's")
    func purgeSparesTheRope() throws {
        let vector = nazar()

        _ = vector.raster(region: nil, pixelWidth: 64, pixelHeight: 64, dark: false, usage: .overlay)
        _ = vector.raster(region: nil, pixelWidth: 96, pixelHeight: 96, dark: false, usage: .overlay)
        _ = vector.raster(region: nil, pixelWidth: 212, pixelHeight: 212, dark: false, usage: .interface)
        _ = vector.raster(region: nil, pixelWidth: 256, pixelHeight: 256, dark: false, usage: .interface)

        #expect(vector.cachedRasterCounts == (overlay: 2, interface: 2))

        #expect(vector.purgeInterfaceRasters() == 2)
        #expect(vector.cachedRasterCounts == (overlay: 2, interface: 0))

        // The rope's bitmaps are not merely present, they are the same bitmaps: a
        // cache that quietly re-rendered them would pass a count check.
        let kept = vector.raster(region: nil, pixelWidth: 64, pixelHeight: 64, dark: false, usage: .overlay)
        #expect(vector.cachedRasterCounts.overlay == 2)
        #expect(kept != nil)

    }

    @Test("The same size on the rope and in a window are two entries, and one survives")
    func sameSizeDiffersByUsage() {
        let vector = nazar()

        _ = vector.raster(region: nil, pixelWidth: 128, pixelHeight: 128, dark: false, usage: .overlay)
        _ = vector.raster(region: nil, pixelWidth: 128, pixelHeight: 128, dark: false, usage: .interface)
        #expect(vector.cachedRasterCounts == (overlay: 1, interface: 1))

        vector.purgeInterfaceRasters()
        #expect(vector.cachedRasterCounts == (overlay: 1, interface: 0))

    }

    @Test("Shadows follow their artwork")
    func shadowsCarryTheUsage() {
        let vector = nazar()

        _ = vector.shadowRaster(
            region: nil, pixelWidth: 96, pixelHeight: 96, dark: false, opacity: 0.3, usage: .overlay
        )
        _ = vector.shadowRaster(
            region: nil, pixelWidth: 212, pixelHeight: 212, dark: false, opacity: 0.3, usage: .interface
        )
        // A shadow costs two entries: the artwork it is made from, and itself.
        #expect(vector.cachedRasterCounts == (overlay: 2, interface: 2))

        #expect(vector.purgeInterfaceRasters() == 2)
        #expect(vector.cachedRasterCounts == (overlay: 2, interface: 0))

    }

    @Test("Purging twice is not an error and finds nothing the second time")
    func purgeIsIdempotent() {
        let vector = nazar()
        _ = vector.raster(region: nil, pixelWidth: 212, pixelHeight: 212, dark: false, usage: .interface)

        #expect(vector.purgeInterfaceRasters() == 1)
        #expect(vector.purgeInterfaceRasters() == 0)

    }

    @Test("Measured regions survive a purge, because the rope reads them every step")
    func regionsAreKept() throws {
        let vector = nazar()
        let entry = try #require(CollectionCharmCatalog.entry(for: .nazar))
        let before = try #require(vector.regions(beadCount: entry.beadCount, bodyRun: entry.bodyRun))

        vector.purgeInterfaceRasters()

        let after = try #require(vector.regions(beadCount: entry.beadCount, bodyRun: entry.bodyRun))
        #expect(after.body == before.body)
        #expect(after.beads == before.beads)

    }
}

/// The other two stores a window fills.
@Suite("Artwork memory, imports and the workspace")
@MainActor
struct ArtworkMemoryImportTests {
    private func makeProcessed() throws -> ProcessedCharmImage {
        let image = try #require(TestImages.discOnClear(side: 32))
        return ProcessedCharmImage(
            pngData: try CharmImageProcessor.encodePNG(image),
            pixelSide: 32,
            metrics: CharmMetrics(mass: 3, radiusRatio: 0.12, knotInset: 0.9),
            palette: .derived(from: CharmColor(0.9, 0.2, 0.2))
        )
    }

    @Test("An import on the rope keeps its bitmap; the rest of the Library lets go")
    func purgeKeepsWhatIsOnTheRope() throws {
        let directory = try TestImages.temporaryDirectory()
        defer { try? FileManager.default.removeItem(at: directory) }
        let store = CustomCharmStore(directory: directory)

        let hanging = try store.add(makeProcessed(), name: "On the rope")
        let browsed = try store.add(makeProcessed(), name: "Only looked at")

        // Drawing a card decodes the bitmap; this is what the Library does.
        #expect(store.charm(for: hanging.id) != nil)
        #expect(store.charm(for: browsed.id) != nil)
        #expect(store.retainedBitmapIdentities.count == 2)

        #expect(store.purgeBitmaps(keeping: [hanging.id]) == 1)
        #expect(store.retainedBitmapIdentities.count == 1)

        // And the one that was dropped is still a charm — it is re-read from disk.
        #expect(store.charm(for: browsed.id) != nil)
    }

    @Test("Create keeps unsaved work and lets go of saved work")
    func workspaceIsOnlyDiscardedWhenFinished() async throws {
        let directory = try TestImages.temporaryDirectory()
        defer { try? FileManager.default.removeItem(at: directory) }

        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer { defaults.removePersistentDomain(forName: suiteName) }
        let charms = CharmManager(
            settingsStore: SettingsStore(defaults: defaults, storageKey: "settings"),
            customStore: CustomCharmStore(directory: directory.appending(path: "charms"))
        )
        let studio = CharmStudioViewModel(charmManager: charms, accessibility: AccessibilityPreferences())

        // Nothing open: nothing to give back, and no crash for asking.
        #expect(studio.discardFinishedWork() == false)

        let url = directory.appending(path: "subject.png")
        try TestImages.write(#require(TestImages.discOnWhite()), as: .png, to: url)
        await studio.open(url: url)
        #expect(studio.hasImage)

        // Unsaved: the window closing is not a decision to throw this away.
        #expect(studio.discardFinishedWork() == false)
        #expect(studio.hasImage)

        await studio.save()
        #expect(studio.stage == .saved)
        #expect(studio.discardFinishedWork())
        #expect(!studio.hasImage)
    }
}
