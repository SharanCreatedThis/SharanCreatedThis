//
//  SVGArtworkSource.swift
//  Hangly
//
//  Resolves a charm to its SVG asset, and reports the ones that are missing.
//

import AppKit
import Foundation

/// Where the collection's SVG artwork is loaded from.
///
/// In the app it is the asset catalog, where each charm is an imageset that keeps
/// its vector data and may carry a dark variant. The build-time scripts point it at
/// the designer's `Assets/Charms` folder instead, via an environment variable, so
/// previews are rendered from the very files that will be bundled.
struct SVGArtworkSource: Sendable {
    enum Backend: Sendable, Equatable {
        case bundle
        case directory(URL)
    }

    /// Set to a folder of SVGs to bypass the asset catalog.
    static let environmentKey = "HANGLY_CHARM_SVG_DIR"

    let backend: Backend

    /// The environment override if present, otherwise the bundle.
    ///
    /// Production ignores the override and only ever reads the bundle: a shipped app
    /// has no business loading its artwork from a path someone can point at it.
    static func resolveDefault() -> SVGArtworkSource {
        #if !HANGLY_PRODUCTION
        if let path = ProcessInfo.processInfo.environment[environmentKey], !path.isEmpty {
            return SVGArtworkSource(backend: .directory(URL(fileURLWithPath: path)))
        }
        #endif
        return SVGArtworkSource(backend: .bundle)
    }

    /// Asset-catalog name for a charm's artwork.
    static func assetName(for kind: CharmKind) -> String {
        "charm-\(kind.rawValue)"
    }

    /// The vector image for a charm, or `nil` when it has no artwork here.
    ///
    /// Deliberately does *not* open the bundled asset to find out. Asking whether an
    /// image is available loads it, and the charm registry is built by resolving
    /// every charm at once — so probing here meant every SVG in the app was decoded
    /// at launch whether or not anything drew it. With twenty-two of them that cost
    /// forty megabytes of resident memory for artwork nobody had asked to see.
    ///
    /// An asset that turns out to be missing still behaves as missing: nothing can
    /// be measured from it, so the charm draws its placeholder bead exactly as it
    /// did when this returned `nil`. The difference is only *when* the app finds
    /// out, and the answer is now "when something tries to draw it".
    func vectorImage(for kind: CharmKind) -> VectorImage? {
        switch backend {
        case .bundle:
            return VectorImage(source: .named(Self.assetName(for: kind)))
        case .directory(let directory):
            guard let fileName = CollectionCharmCatalog.sourceFileName(for: kind) else { return nil }
            let url = directory.appending(path: fileName)
            guard FileManager.default.fileExists(atPath: url.path) else { return nil }
            let image = VectorImage(source: .file(url))
            return image.isAvailable ? image : nil
        }
    }

    func isAvailable(_ kind: CharmKind) -> Bool {
        vectorImage(for: kind) != nil
    }

    /// The charms among `kinds` that have no artwork in this source.
    func missingAssets(among kinds: [CharmKind]) -> [CharmKind] {
        kinds.filter { !isAvailable($0) }
    }
}
