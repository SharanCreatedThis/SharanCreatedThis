//
//  MilestonePopupController.swift
//  Vision
//
//  Manages the 5th launch milestone popup window.
//

import AppKit
import SwiftUI

@MainActor
public final class MilestonePopupController {
    public static let shared = MilestonePopupController()

    private var window: NSWindow?
    private var coffeeWindow: NSWindow?

    private init() {}

    /// Evaluates whether the milestone should trigger.
    /// Requirements:
    /// - 5th launch (or >= 5)
    /// - Only show once
    /// - Never interrupt onboarding (hasCompletedOnboarding must be true)
    public func evaluateTrigger() {
        guard VisionAnalytics.shared.launchCount >= 5 else { return }
        guard !VisionSettings.shared.hasShownMilestonePopup else { return }
        guard VisionSettings.shared.hasCompletedOnboarding else { return }

        // Slight delay so the app finishes launching before displaying the modal
        Task {
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            guard !VisionSettings.shared.hasShownMilestonePopup else { return }
            guard VisionSettings.shared.hasCompletedOnboarding else { return }
            present()
        }
    }

    public func present() {
        guard window == nil else { return }

        VisionSettings.shared.hasShownMilestonePopup = true
        VisionAnalytics.shared.track(.launchMilestoneShown, properties: [
            "milestone": 5,
            "launch_count": VisionAnalytics.shared.launchCount
        ])

        let popupView = MilestonePopupView(
            onInstagram: { [weak self] in
                self?.handleInstagram()
            },
            onBuyCoffee: { [weak self] in
                self?.handleBuyCoffee()
            },
            onContinue: { [weak self] in
                self?.handleContinue()
            }
        )

        let hostingView = NSHostingView(rootView: popupView)
        hostingView.frame = NSRect(x: 0, y: 0, width: 360, height: 380)

        let win = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 360, height: 380),
            styleMask: [.titled, .fullSizeContentView, .closable],
            backing: .buffered,
            defer: false
        )
        win.title = "Thanks for using Vision ✨"
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
    }

    public func close() {
        window?.close()
        window = nil
    }

    private func handleContinue() {
        VisionAnalytics.shared.track(.launchMilestoneDismissed, properties: ["action": "continue"])
        close()
    }

    private func handleInstagram() {
        VisionAnalytics.shared.track(.launchMilestoneDismissed, properties: ["action": "instagram"])
        if let url = URL(string: "https://www.instagram.com/sharan.created.this/") {
            NSWorkspace.shared.open(url)
        }
        close()
    }

    private func handleBuyCoffee() {
        VisionAnalytics.shared.track(.launchMilestoneDismissed, properties: ["action": "coffee"])
        close()
        presentCoffeeWindow()
    }

    private func presentCoffeeWindow() {
        let coffeeView = BuyCoffeeSheet()
        let hostingView = NSHostingView(rootView: coffeeView)
        hostingView.frame = NSRect(x: 0, y: 0, width: 340, height: 500)

        let win = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 340, height: 500),
            styleMask: [.titled, .fullSizeContentView, .closable],
            backing: .buffered,
            defer: false
        )
        win.title = "Buy Creator a Coffee"
        win.titleVisibility = .hidden
        win.titlebarAppearsTransparent = true
        win.isMovableByWindowBackground = true
        win.isReleasedWhenClosed = false
        win.contentView = hostingView
        win.center()
        win.backgroundColor = .clear
        win.hasShadow = true
        win.level = .floating

        self.coffeeWindow = win
        win.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
}
