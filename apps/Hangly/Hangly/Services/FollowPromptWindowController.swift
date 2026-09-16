//
//  FollowPromptWindowController.swift
//  Hangly
//
//  A small panel for the one thing the app ever asks for.
//

import AppKit
import SwiftUI

/// Shows the follow card, once, in a panel of its own.
///
/// A panel rather than a sheet, because a menu bar app has nothing to sheet from:
/// the Customize window may well not be open, and opening it in order to ask a
/// favour would be a worse intrusion than the favour. It closes on Escape, on the
/// button, and on clicking away — all three count as an answer, and none of them
/// brings it back.
@MainActor
final class FollowPromptWindowController: NSObject, NSWindowDelegate {
    private let presenter: FollowPromptPresenter
    private var window: NSWindow?

    init(presenter: FollowPromptPresenter) {
        self.presenter = presenter
        super.init()
    }

    /// Shows the card if this launch is the one it is due on.
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

        let content = FollowPrompt(analytics: presenter.analytics) { [weak self] answer in
            self?.presenter.answer(answer)
            self?.window?.close()
        }
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

    /// Closing the card without choosing is an answer, and the answer is no.
    func windowWillClose(_ notification: Notification) {
        presenter.answer(.declined)
    }
}
