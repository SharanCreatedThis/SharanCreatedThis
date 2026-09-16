//
//  WelcomeWindowController.swift
//  Hangly
//
//  The panel the welcome card lives in.
//

import AppKit
import SwiftUI

/// Shows the welcome card on the first launch, in a panel of its own.
///
/// A panel for the same reason the follow card is one: there is no main window to
/// sheet from, and opening one in order to explain the app would be explaining it
/// with the wrong thing. Escape, the close button and "Keep Hanging" all do the
/// same thing, and none of them brings it back.
@MainActor
final class WelcomeWindowController: NSObject, NSWindowDelegate {
    private let presenter: WelcomePresenter

    /// What is hanging right now, asked for when the card is built rather than
    /// stored — so the card introduces the app with the copy of it the person has,
    /// even on a launch where the season has just dressed the rope.
    private let charm: () -> any Charm

    private var window: NSWindow?

    init(presenter: WelcomePresenter, charm: @escaping () -> any Charm) {
        self.presenter = presenter
        self.charm = charm
        super.init()
    }

    /// Shows the card if this launch is the first one.
    func offerIfDue() {
        presenter.offerIfDue()
        guard presenter.isPresented else { return }
        present()
    }

    private func present() {
        NSApp.activate()
        let panel = ensureWindow()
        panel.center()
        panel.makeKeyAndOrderFront(nil)
        panel.orderFrontRegardless()
    }

    private func ensureWindow() -> NSWindow {
        if let window { return window }

        let content = WelcomeCard(
            charm: charm(),
            onExplore: { [weak self] in
                // Closed first, so the window that arrives is the one in front.
                self?.window?.close()
                self?.presenter.exploreLibrary()
            },
            onDismiss: { [weak self] in self?.window?.close() }
        )
        let panel = NSPanel(contentViewController: NSHostingController(rootView: content))
        panel.styleMask = [.titled, .closable, .fullSizeContentView]
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true
        panel.isFloatingPanel = true
        panel.hidesOnDeactivate = false
        panel.isReleasedWhenClosed = false
        panel.delegate = self
        window = panel
        return panel
    }

    /// Closing the card is the same as keeping the charm: it has been shown, which
    /// is the only thing that was ever recorded about it.
    func windowWillClose(_ notification: Notification) {
        presenter.dismiss()
    }
}
