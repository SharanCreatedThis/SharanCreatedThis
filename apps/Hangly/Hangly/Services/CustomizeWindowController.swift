//
//  CustomizeWindowController.swift
//  Hangly
//
//  Hosts Customize in a window that is actually destroyed when it closes.
//

import AppKit
import SwiftUI

/// Owns the single Customize window.
///
/// It used to be a SwiftUI `Window` scene, and that is what the RC1 audit found
/// holding 45 MB behind a closed window. A `Window` scene does not close: it hides,
/// and keeps its view tree, its hosting view and its backing store alive for the
/// next time it is asked for. For a document-based app that is the right trade. For
/// a menu bar ornament that idles at 23 MB it means somebody who once looked at the
/// Library pays three times the app's resting cost until they quit it.
///
/// So Customize is now an `NSWindow` around an `NSHostingController`, like the
/// Studio, the welcome card and the follow prompt already were — and like them it
/// drops its content view controller on close. The view tree, the two view models,
/// SwiftUI's render graph and the window's backing store all go with it, and
/// `ArtworkMemory` gives back the bitmaps the pages rasterised on their way past.
///
/// Reopening rebuilds all of it — the same work the first open did, and no more.
@MainActor
final class CustomizeWindowController: NSObject, NSWindowDelegate {
    static let frameAutosaveName = "Customize"

    /// Set once, at startup, by the composition root. Not an initialiser parameter
    /// because the environment builds this controller as part of building itself.
    var environment: AppEnvironment?

    /// The page the window is on. Outlives the window, so opening on the Library
    /// works whether or not there is a window yet, and observable, so pointing an
    /// open window at another page switches it.
    let navigation = CustomizeNavigation()

    private var window: NSWindow?

    /// Opens Customize on a page, or brings it forward and switches to that page.
    func present(_ section: CustomizeSection) {
        navigation.section = section

        // `activate()`, not `activate(ignoringOtherApps:)`: the latter is deprecated
        // on macOS 14 and up, and the rest of the app's window controllers already
        // use this one.
        NSApp.activate()
        let window = ensureWindow()
        window.makeKeyAndOrderFront(nil)
        window.orderFrontRegardless()
    }

    /// Closes the window if it is open. Everything a close does — releasing the
    /// view tree and reclaiming the artwork — happens in `windowWillClose`, so
    /// this and the red button take exactly the same path.
    func close() {
        window?.performClose(nil)
    }

    var isVisible: Bool {
        window?.isVisible ?? false
    }

    // MARK: - The window

    private func ensureWindow() -> NSWindow {
        if let window {
            if window.contentViewController == nil {
                window.contentViewController = makeHostingController()
            }
            return window
        }

        let window = NSWindow(contentViewController: makeHostingController())
        window.title = "Customize Hangly"
        // No `.resizable`: every page is composed against exactly one size, which is
        // what the SwiftUI scene expressed as `.windowResizability(.contentSize)`.
        // The split between sidebar and detail is still draggable inside it.
        window.styleMask = [.titled, .closable, .miniaturizable]
        window.setFrameAutosaveName(Self.frameAutosaveName)
        // Where it was last time, or the middle of the screen the first time. The
        // scene remembered its position across launches and this has to as well;
        // the size is fixed, so only the origin is ever restored.
        if !window.setFrameUsingName(Self.frameAutosaveName) {
            window.center()
        }
        window.isReleasedWhenClosed = false
        window.delegate = self
        self.window = window
        return window
    }

    private func makeHostingController() -> NSViewController {
        guard let environment else {
            // Unreachable in the app: the composition root sets this before anything
            // can ask for a window. An empty controller rather than a crash, because
            // a menu bar app losing a window is not worth losing the rope over.
            return NSHostingController(rootView: EmptyView())
        }
        let controller = NSHostingController(
            rootView: CustomizeView(navigation: navigation, environment: environment)
        )
        controller.sizingOptions = [.preferredContentSize]
        return controller
    }

    func windowWillClose(_ notification: Notification) {
        // The whole point. Dropping the content view controller releases the view
        // tree, both page view models and the window's backing store; the artwork
        // those pages rasterised is held elsewhere, so it is asked for separately.
        window?.contentViewController = nil

        guard let environment else { return }
        ArtworkMemory(
            charms: environment.charmManager,
            customCharms: environment.customCharmStore,
            studio: environment.charmStudioViewModel
        ).reclaim()
    }
}
