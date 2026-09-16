//
//  VectorImage.swift
//  Hangly
//
//  A vector asset rasterised on demand at exact device pixels.
//

import AppKit
import CoreGraphics
import Foundation

/// An SVG-backed image that renders at any size without quality loss.
///
/// AppKit keeps the vector data of an SVG loaded from a file or an asset catalog,
/// so drawing it into a context of the right pixel size yields a crisp result at
/// every scale and on every display. Rasterising is not free, though, and the
/// overlay draws at 120 Hz, so results are cached per pixel size and appearance:
/// a charm that stays the same size costs one rasterisation, then bitmap draws.
///
/// Any sub-rectangle can be rasterised on its own, which is what lets one asset
/// supply both the charm body and the beads that hang above it as separate
/// sprites. Because the source is vector, a region blown up to fill the target is
/// as sharp as the whole image would be — nothing is upscaled from pixels.
///
/// `@unchecked Sendable` because every access to the lazily loaded `NSImage` and
/// the cache goes through one lock; the image itself is never mutated once loaded.
final class VectorImage: @unchecked Sendable {
    enum Source: Sendable, Equatable {
        /// An asset-catalog image, which may carry a dark-appearance variant.
        case named(String)
        /// An SVG file on disk, used by the build-time scripts.
        case file(URL)
    }

    let source: Source

    private let lock = NSLock()
    private var loaded: NSImage?
    private var loadAttempted = false
    private var cache: [CacheKey: CGImage] = [:]
    private var order: [CacheKey] = []
    private var regionCache: [SplitKey: CharmArtworkRegions] = [:]
    private var regionMisses: Set<SplitKey> = []

    /// Enough for a charm body, its beads and a spare size of each, so a resize or
    /// a cross-fade does not evict the entries the next frame needs.
    ///
    /// Twenty-four, and not more. A charm's body at Retina scale is a few hundred
    /// kilobytes and its shadow larger still, so entries are expensive: doubling
    /// this to make room for the tinted copies a rope style asks for took the
    /// settled overlay from 33 MB to 108 MB, because the extra room simply kept
    /// stale sizes alive rather than letting them go. Tints cost nothing at rest —
    /// only one style is on screen, so its beads take the slots the untinted ones
    /// used to — and during the quarter-second of a style change a few small bead
    /// entries may evict something that is then rasterised once more. That is the
    /// right trade.
    private static let cacheLimit = 24

    private struct CacheKey: Hashable {
        let region: RegionKey
        let pixelWidth: Int
        let pixelHeight: Int
        let dark: Bool
        var shadow = false

        /// The recolour applied, if any. Part of the key rather than a second cache
        /// because a tint is a different bitmap of the same artwork, and because
        /// tints come from the five rope styles and nowhere else — so the number of
        /// distinct values this can take is five, not one per frame.
        var tint: VectorTint?

        /// Whether this bitmap is on the rope or in a window; see `ArtworkUsage`.
        /// Part of the key so that closing a window can forget the window's copies
        /// without touching the overlay's, even when the two ask for the same size.
        var usage: ArtworkUsage = .interface
    }

    private struct SplitKey: Hashable {
        let beadCount: Int
        let bodyRun: Int
    }

    /// A region quantised to integers, so float noise cannot miss the cache.
    private struct RegionKey: Hashable {
        let x: Int
        let y: Int
        let width: Int
        let height: Int

        init(_ rect: CGRect?) {
            guard let rect else {
                self.init(x: 0, y: 0, width: 0, height: 0)
                return
            }
            let scale = 100_000.0
            self.init(
                x: Int((rect.minX * scale).rounded()),
                y: Int((rect.minY * scale).rounded()),
                width: Int((rect.width * scale).rounded()),
                height: Int((rect.height * scale).rounded())
            )
        }

        private init(x: Int, y: Int, width: Int, height: Int) {
            self.x = x
            self.y = y
            self.width = width
            self.height = height
        }
    }

    init(source: Source) {
        self.source = source
    }

    /// Whether the underlying asset exists and decodes.
    var isAvailable: Bool {
        image() != nil
    }

    /// The vector's natural size in points, or `nil` if unavailable.
    var naturalSize: CGSize? {
        image()?.size
    }

    /// Where the artwork sits inside its unit square, once fitted and centred.
    ///
    /// Every region is expressed in that square, with `(0, 0)` at the top left, so
    /// the splitter, the catalogue and the renderer all speak one coordinate system.
    var unitContentRect: CGRect? {
        guard let size = naturalSize, size.width > 0, size.height > 0 else { return nil }
        let longest = max(size.width, size.height)
        let width = size.width / longest
        let height = size.height / longest
        return CGRect(x: (1 - width) / 2, y: (1 - height) / 2, width: width, height: height)
    }

    /// A square bitmap of `pixelSide` pixels with the image fitted inside and
    /// centred, preserving aspect ratio, on a transparent ground.
    /// - Parameter dark: Resolve the dark appearance, for assets that have one.
    func raster(pixelSide: Int, dark: Bool) -> CGImage? {
        raster(region: nil, pixelWidth: pixelSide, pixelHeight: pixelSide, dark: dark)
    }

    /// Rasterises one region of the fitted unit square into a bitmap of the given
    /// pixel size.
    /// - Parameters:
    ///   - region: A rectangle in unit-square coordinates, or `nil` for the whole
    ///     square. Pass a region's own aspect ratio in the pixel size to avoid
    ///     distortion.
    ///   - dark: Resolve the dark appearance, for assets that have one.
    ///   - tint: A recolour to apply to the result, or `nil` to keep the artwork's
    ///     own colours. Tinted and untinted results are cached separately.
    ///   - usage: Whether this is the rope or a window. Window results are dropped
    ///     by `purgeInterfaceRasters()` when the window closes.
    func raster(
        region: CGRect?,
        pixelWidth: Int,
        pixelHeight: Int,
        dark: Bool,
        tint: VectorTint? = nil,
        usage: ArtworkUsage = .interface
    ) -> CGImage? {
        guard pixelWidth > 0, pixelHeight > 0, let image = image() else { return nil }
        if let region, region.width <= 0 || region.height <= 0 { return nil }

        let key = CacheKey(
            region: RegionKey(region),
            pixelWidth: pixelWidth,
            pixelHeight: pixelHeight,
            dark: dark,
            tint: tint,
            usage: usage
        )

        lock.lock()
        if let cached = cache[key] {
            lock.unlock()
            return cached
        }
        lock.unlock()

        guard var rendered = Self.render(
            image,
            region: region ?? CGRect(x: 0, y: 0, width: 1, height: 1),
            pixelWidth: pixelWidth,
            pixelHeight: pixelHeight,
            dark: dark
        ) else { return nil }

        // A failed pass falls back to the artwork rather than to nothing: a bead in
        // the wrong metal, or a charm that missed the weather, is a blemish where a
        // missing bead is a bug.
        if let palette = tint?.palette,
           let recoloured = RGBABitmap.tinted(rendered, palette: palette, strength: tint?.strength ?? 1) {
            rendered = recoloured
        }
        if let mood = tint?.mood, let weathered = RGBABitmap.weathered(rendered, mood: mood) {
            rendered = weathered
        }

        store(rendered, as: key)
        return rendered
    }

    /// A soft drop shadow for a region of the artwork, ready to draw.
    ///
    /// Made once per size and kept, because a shadow filter resolved on every frame
    /// is the single most expensive thing a 120 Hz overlay can ask for, and the
    /// shadow's shape does not change between frames.
    ///
    /// The result is `RGBABitmap.padding(forBlurRadius:)` pixels larger than the
    /// artwork on every side, so the caller must draw it into a correspondingly
    /// larger rectangle; `shadowPadding(forPixelSide:)` gives that in the same units.
    func shadowRaster(
        region: CGRect?,
        pixelWidth: Int,
        pixelHeight: Int,
        dark: Bool,
        opacity: Double,
        usage: ArtworkUsage = .interface
    ) -> CGImage? {
        guard pixelWidth > 0, pixelHeight > 0 else { return nil }
        let key = CacheKey(
            region: RegionKey(region),
            pixelWidth: pixelWidth,
            pixelHeight: pixelHeight,
            dark: dark,
            shadow: true,
            tint: nil,
            usage: usage
        )

        lock.lock()
        if let cached = cache[key] {
            lock.unlock()
            return cached
        }
        lock.unlock()

        guard let artwork = raster(
                  region: region,
                  pixelWidth: pixelWidth,
                  pixelHeight: pixelHeight,
                  dark: dark,
                  usage: usage
              ),
              let rendered = RGBABitmap.shadow(
                  from: artwork,
                  blurRadius: Self.blurRadius(forPixelSide: min(pixelWidth, pixelHeight)),
                  opacity: opacity
              ) else { return nil }

        store(rendered, as: key)
        return rendered
    }

    /// Keeps a result, forgetting the oldest once the cache is full.
    private func store(_ image: CGImage, as key: CacheKey) {
        lock.lock()
        defer { lock.unlock() }
        cache[key] = image
        order.append(key)
        if order.count > Self.cacheLimit {
            cache[order.removeFirst()] = nil
        }
    }

    /// The artwork split into its charm body and the beads above it.
    ///
    /// Computed once per bead count and kept, because it costs a rasterisation:
    /// callers may ask on every frame.
    /// - Parameters:
    ///   - beadCount: How many of the blobs above the body are beads.
    ///   - bodyRun: Where the charm itself begins. The catalogue supplies both; see
    ///     `CharmArtworkSplitter`.
    func regions(beadCount: Int, bodyRun: Int) -> CharmArtworkRegions? {
        let key = SplitKey(beadCount: beadCount, bodyRun: bodyRun)

        lock.lock()
        if let cached = regionCache[key] {
            lock.unlock()
            return cached
        }
        if regionMisses.contains(key) {
            lock.unlock()
            return nil
        }
        lock.unlock()

        let computed = CharmArtworkSplitter.split(self, beadCount: beadCount, bodyRun: bodyRun)

        lock.lock()
        if let computed {
            regionCache[key] = computed
        } else {
            regionMisses.insert(key)
        }
        lock.unlock()
        return computed
    }

    /// Forgets every bitmap made for a window, and keeps every bitmap on the rope.
    ///
    /// Called when Customize closes. The measured regions are kept: they are a
    /// handful of rectangles per charm, they cost a rasterisation each to work out
    /// again, and the rope reads them on its next step whether a window is open or
    /// not.
    /// - Returns: How many bitmaps were dropped, for the log and for the tests.
    @discardableResult
    func purgeInterfaceRasters() -> Int {
        lock.lock()
        defer { lock.unlock() }

        let doomed = cache.keys.filter { $0.usage == .interface }
        guard !doomed.isEmpty else { return 0 }
        for key in doomed { cache[key] = nil }
        order.removeAll { $0.usage == .interface }
        return doomed.count
    }

    /// How many bitmaps are held, by what they are for. For the memory audit and
    /// for the tests that assert a purge left the rope alone.
    var cachedRasterCounts: (overlay: Int, interface: Int) {
        lock.lock()
        defer { lock.unlock() }
        let interface = cache.keys.count { $0.usage == .interface }
        return (cache.count - interface, interface)
    }

    #if !HANGLY_PRODUCTION
    /// Drops every cached bitmap. Used by tests.
    func purge() {
        lock.lock()
        cache.removeAll()
        order.removeAll()
        regionCache.removeAll()
        regionMisses.removeAll()
        lock.unlock()
    }
    #endif

    // MARK: - Loading

    private func image() -> NSImage? {
        lock.lock()
        defer { lock.unlock() }
        if loadAttempted { return loaded }
        loadAttempted = true

        let candidate: NSImage?
        switch source {
        case .named(let name):
            candidate = Bundle.main.image(forResource: name)
        case .file(let url):
            candidate = NSImage(contentsOf: url)
        }
        guard let candidate, candidate.size.width > 0, candidate.size.height > 0 else { return nil }
        loaded = candidate
        return candidate
    }
}
