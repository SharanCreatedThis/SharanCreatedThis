//
//  ReleaseNotesManager.swift
//  Vision
//
//  Detects version upgrades, loads release notes, and presents What's New.
//

import AppKit
import SwiftUI

@MainActor
public final class ReleaseNotesManager {
    public static let shared = ReleaseNotesManager()

    private var window: NSWindow?

    public struct VersionNotes: Codable {
        public let version: String
        public let title: String
        public let notes: [String]
    }

    private init() {}

    public var currentVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.1"
    }

    /// Check if the app was just upgraded to a new version.
    public func checkForUpdatePresentation() {
        let current = currentVersion
        let lastVersion = VisionSettings.shared.lastAppVersion

        guard let last = lastVersion else {
            // Fresh install — record current version without showing release notes
            VisionSettings.shared.lastAppVersion = current
            return
        }

        if last != current {
            VisionSettings.shared.lastAppVersion = current

            // Only present if user is already onboarded so as not to interrupt fresh setup
            guard VisionSettings.shared.hasCompletedOnboarding else { return }

            Task {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                presentReleaseNotes(for: current)
            }
        }
    }

    public func presentReleaseNotes(for version: String) {
        guard window == nil else { return }

        let items = loadReleaseNotes(for: version)
        VisionAnalytics.shared.track(.releaseNotesViewed, properties: ["version": version])

        let releaseNotesView = ReleaseNotesView(
            version: version,
            items: items,
            onDismiss: { [weak self] in
                self?.close()
            }
        )

        let hostingView = NSHostingView(rootView: releaseNotesView)
        hostingView.frame = NSRect(x: 0, y: 0, width: 380, height: 420)

        let win = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 380, height: 420),
            styleMask: [.titled, .fullSizeContentView, .closable],
            backing: .buffered,
            defer: false
        )
        win.title = "Vision updated to \(version)"
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

    private func loadReleaseNotes(for version: String) -> [String] {
        if let url = Bundle.main.url(forResource: "ReleaseNotes", withExtension: "json"),
           let data = try? Data(contentsOf: url),
           let all = try? JSONDecoder().decode([String: VersionNotes].self, from: data),
           let entry = all[version] {
            return entry.notes
        }

        // Fallback notes if JSON resource is unavailable
        return [
            "Enhanced Face Recognition pipeline with neural ArcFace embeddings",
            "Vision Guard & Vision Vault security platforms",
            "Refined notch animation modes and instant lock screen wake",
            "Optimized battery and thermal efficiency"
        ]
    }
}
