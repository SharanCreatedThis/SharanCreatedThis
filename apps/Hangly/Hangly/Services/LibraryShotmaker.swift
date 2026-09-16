//
//  LibraryShotmaker.swift
//  Hangly
//
//  Renders the Library offscreen, so a change to it can be looked at.
//

#if !HANGLY_PRODUCTION

import AppKit
import OSLog
import SwiftUI
import UniformTypeIdentifiers

/// Draws the Library to PNG at a given width, without putting it on screen.
///
/// The obvious way to get a picture of a window is to screenshot it, and that needs
/// Screen Recording permission — which a build machine, a CI runner and this
/// project's own audit environment all lack, and where it is missing
/// `screencapture` quietly returns the desktop picture with no windows in it. A
/// verification step that silently photographs the wallpaper is worse than none.
///
/// So this renders the view instead. The pixels are the real ones: the real
/// `CharmLibraryView`, the real view models, the real artwork, laid out by the real
/// layout engine at a real width. What it does *not* capture is the window frame
/// and anything the compositor does behind the window, which is exactly the part a
/// layout review does not need.
///
/// Compiled out of the Production configuration with the rest of the development
/// surfaces.
@MainActor
enum LibraryShotmaker {
    /// The widths the Library is reviewed at.
    ///
    /// Not arbitrary: the detail column is fixed at `CustomizeView.sidebarWidth`, so
    /// these are what the *window* would be, and the grid gets what is left.
    static let widths: [Double] = [760, 960, 1280]

    /// Where the shots go. Set `HANGLY_SHOTS_DIR` to put them somewhere else.
    static var outputDirectory: URL {
        if let path = ProcessInfo.processInfo.environment["HANGLY_SHOTS_DIR"], !path.isEmpty {
            return URL(fileURLWithPath: path)
        }
        return FileManager.default.temporaryDirectory.appending(path: "hangly-shots")
    }

    /// Renders every collection at every width, plus the rope shots.
    static func writeAll(environment: AppEnvironment) {
        let directory = outputDirectory
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)

        for collection in CharmCollection.allCases {
            for width in widths {
                let model = environment.makeCharmLibraryViewModel()
                model.filter = .collection(collection)
                write(
                    library: model,
                    width: width,
                    to: directory.appending(path: "library-\(collection.rawValue)-\(Int(width)).png")
                )
            }
        }

        // The unfiltered Library, which is where the hero cards live.
        for width in widths {
            write(
                library: environment.makeCharmLibraryViewModel(),
                width: width,
                to: directory.appending(path: "library-all-\(Int(width)).png")
            )
        }

        for style in [RopeStyle.spiderThread, .midnightCord, .templeThread, .silverCord] {
            writeRope(style: style, charm: charm(for: style), to: directory)
        }

        NSWorkspace.shared.open(directory)
    }

    /// The charm each new cord was drawn beside.
    private static func charm(for style: RopeStyle) -> CharmKind {
        switch style {
        case .spiderThread: .spiderMan
        case .midnightCord: .batmanSymbol
        case .templeThread: .vel
        case .silverCord: .btsMemberOne
        default: .nazar
        }
    }

    // MARK: - Rendering

    static func write(library: CharmLibraryViewModel, width: Double, to url: URL) {
        let height = CustomizeView.contentSize.height
        let view = CharmLibraryView(viewModel: library)
            .frame(width: width - CustomizeView.sidebarWidth, height: height)
        render(view, size: CGSize(width: width - CustomizeView.sidebarWidth, height: height), to: url)
    }

    /// One rope, settled, on a ground that shows a pale cord as clearly as a dark one.
    static func writeRope(style: RopeStyle, charm kind: CharmKind, to directory: URL) {
        let size = CGSize(width: 340, height: 420)
        let driver = PreviewRopeDriver()
        driver.configure(
            size: size,
            charm: BuiltInCharms.charm(for: kind),
            reducesMotion: true,
            charmSize: 1.5,
            settlesEarly: true
        )
        let view = RopeCanvasView(
            snapshot: driver.snapshot,
            charmSlots: [driver.layers],
            ropeAppearance: style.appearance,
            ropeStyleLayers: [RopeStyleLayer(style: style, opacity: 1)]
        )
        .frame(width: size.width, height: size.height)

        for (name, background) in [("dark", Color(white: 0.11)), ("light", Color(white: 0.96))] {
            let framed = ZStack {
                background
                view
            }
            .frame(width: size.width, height: size.height)
            render(framed, size: size, to: directory.appending(path: "rope-\(style.rawValue)-\(name).png"))
        }
    }

    /// Hosts a view in an offscreen window and captures its layer.
    ///
    /// The window matters. A hosting view with no window resolves none of the
    /// materials, vibrancy or accent colour the Library is built from, and renders
    /// as a grey rectangle with text on it. An ordered-out window resolves all of
    /// them and never appears.
    private static func render(_ view: some View, size: CGSize, to url: URL) {
        let hosting = NSHostingView(rootView: view)
        hosting.frame = CGRect(origin: .zero, size: size)

        let window = NSWindow(
            contentRect: hosting.frame,
            styleMask: [.borderless],
            backing: .buffered,
            defer: false
        )
        window.contentView = hosting
        window.isOpaque = false
        window.backgroundColor = .clear
        // Ordered out, so nothing is ever shown to anybody, but realised enough for
        // the appearance to resolve.
        window.orderBack(nil)
        window.displayIfNeeded()
        hosting.layoutSubtreeIfNeeded()
        window.displayIfNeeded()
        RunLoop.current.run(until: Date().addingTimeInterval(0.35))

        guard let rep = hosting.bitmapImageRepForCachingDisplay(in: hosting.bounds) else { return }
        rep.size = size
        hosting.cacheDisplay(in: hosting.bounds, to: rep)
        window.orderOut(nil)

        guard let data = rep.representation(using: .png, properties: [:]) else { return }
        try? data.write(to: url)
        Logger.app.diagnostic("Wrote \(url.lastPathComponent) at \(Int(size.width))×\(Int(size.height)).")
    }
}

#endif
