//
//  WelcomeWindowController.swift
//  Vision
//
//  Manages the first launch welcome window.
//

import AppKit
import SwiftUI

@MainActor
public final class WelcomeWindowController {
    public static let shared = WelcomeWindowController()

    private var window: NSWindow?
    private var onContinueAction: (() -> Void)?

    private init() {}

    public func present(onContinue: @escaping () -> Void) {
        if let window, window.isVisible {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        self.onContinueAction = onContinue

        let welcomeView = WelcomeView(
            onSetUp: { [weak self] in
                self?.handleSetUp()
            },
            onLearnMore: { [weak self] in
                self?.handleLearnMore()
            }
        )

        let hostingView = NSHostingView(rootView: welcomeView)
        hostingView.frame = NSRect(x: 0, y: 0, width: 420, height: 440)

        let win = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 420, height: 440),
            styleMask: [.titled, .fullSizeContentView, .closable],
            backing: .buffered,
            defer: false
        )
        win.title = "Welcome to Vision"
        win.titleVisibility = .hidden
        win.titlebarAppearsTransparent = true
        win.isMovableByWindowBackground = true
        win.isReleasedWhenClosed = false
        win.contentView = hostingView
        win.center()
        win.backgroundColor = .clear
        win.hasShadow = true
        win.level = .floating

        self.window = win
        win.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        // Track welcome shown
        VisionAnalytics.shared.track(.welcomeShown)
    }

    public func close() {
        window?.close()
        window = nil
    }

    private func handleSetUp() {
        VisionAnalytics.shared.track(.welcomeContinue)
        VisionSettings.shared.hasSeenWelcome = true
        close()
        onContinueAction?()
    }

    private func handleLearnMore() {
        if let url = URL(string: "https://tryvision.app") {
            NSWorkspace.shared.open(url)
        }
    }
}
