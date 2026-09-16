//
//  VaultAppLockManager.swift
//  Vision
//
//  Interception engine for protected application launches.
//  Monitors NSWorkspace launch notifications, hides target apps, and requires biometric verification.
//

import Foundation
import AppKit

@MainActor
public final class VaultAppLockManager {
    public static let shared = VaultAppLockManager()

    private var observer: NSObjectProtocol?
    public private(set) var lockedBundleIDs: Set<String> = []
    public private(set) var unlockedSessions: Set<String> = []

    private init() {}

    public func startMonitoring(protectedBundleIDs: Set<String>) {
        self.lockedBundleIDs = protectedBundleIDs
        stopMonitoring()

        observer = NSWorkspace.shared.notificationCenter.addObserver(
            forName: NSWorkspace.didActivateApplicationNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let self,
                  let app = notification.userInfo?[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication else { return }

            Task { @MainActor in
                self.handleApplicationActivation(app: app)
            }
        }
    }

    public func stopMonitoring() {
        if let obs = observer {
            NSWorkspace.shared.notificationCenter.removeObserver(obs)
            observer = nil
        }
    }

    private func handleApplicationActivation(app: NSRunningApplication) {
        let bundleID = app.bundleIdentifier ?? ""
        let appName = app.localizedName ?? ""
        let appPath = app.bundleURL?.path ?? ""

        guard !lockedBundleIDs.isEmpty else { return }

        let isMatch = lockedBundleIDs.contains(bundleID) ||
            lockedBundleIDs.contains(appName) ||
            lockedBundleIDs.contains(appPath) ||
            lockedBundleIDs.contains(where: { target in
                !target.isEmpty && (
                    target.caseInsensitiveCompare(bundleID) == .orderedSame ||
                    target.caseInsensitiveCompare(appName) == .orderedSame ||
                    appName.localizedCaseInsensitiveContains(target) ||
                    target.localizedCaseInsensitiveContains(appName)
                )
            })

        guard isMatch else { return }
        guard !unlockedSessions.contains(bundleID) && !unlockedSessions.contains(appName) else { return }

        // Hide app immediately and show full-screen shield overlay
        app.hide()
        VaultShieldWindowController.shared.showShield(for: app, appName: appName.isEmpty ? "Application" : appName)

        // Trigger Biometric Verification Modal / Dynamic Notch Overlay
        NotificationCenter.default.post(
            name: Notification.Name("VisionVaultRequestAppUnlock"),
            object: nil,
            userInfo: ["app": app, "bundleID": bundleID.isEmpty ? appName : bundleID, "appName": appName]
        )
    }

    public func grantUnlock(forBundleID bundleID: String, app: NSRunningApplication?) {
        unlockedSessions.insert(bundleID)
        VaultShieldWindowController.shared.dismissShield()
        app?.unhide()
        app?.activate()
    }

    public func lockAllApps() {
        unlockedSessions.removeAll()
    }
}
