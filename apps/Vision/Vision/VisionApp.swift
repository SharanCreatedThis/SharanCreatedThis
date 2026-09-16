//
//  VisionApp.swift
//  Vision
//

import SwiftUI

@main
struct VisionApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    /// Only reliable way to reopen a `Window` scene once its `NSWindow` has fully closed.
    @Environment(\.openWindow) private var openWindow

    var body: some Scene {
        settingsWindow
    }

    /// Suppressed so Settings doesn't appear on launch/restore. `openWindow` is captured here, not in `onAppear`, since the
    /// window may never have appeared before the menu bar needs to open it.
    private var settingsWindow: some Scene {
        let open = openWindow
        let delegate = appDelegate
        DispatchQueue.main.async {
            delegate.bindOpenWindowAction { open(id: "settings") }
        }
        return Window("Vision Settings", id: "settings") {
            SettingsWindowView(environment: appDelegate.environment)
                .onAppear {
                    delegate.bindOpenWindowAction { open(id: "settings") }
                }
        }
        .defaultSize(SettingsMetrics.windowSize)
        .windowStyle(.hiddenTitleBar)
        .defaultPosition(.center)
        .defaultLaunchBehavior(.suppressed)
        .restorationBehavior(.disabled)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, NSMenuDelegate {
    let environment = AppEnvironment()

    private var statusItem: NSStatusItem?
    private var sessionMenuItem: NSMenuItem?
    var openSettingsWindowAction: (() -> Void)?

    func bindOpenWindowAction(_ action: @escaping () -> Void) {
        openSettingsWindowAction = action
    }

    private var hasStartedUpdater = false

    func applicationWillFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        if let icnsPath = Bundle.main.path(forResource: "AppIcon", ofType: "icns"),
           let appIcon = NSImage(contentsOfFile: icnsPath) {
            NSApp.applicationIconImage = appIcon
        }

        // Run background migration from Vision -> Vision before reading settings/credentials
        BrandMigrationManager.runAllMigrationsIfNeeded()

        // Ensure launch at login is enabled by default on initial run
        LaunchAtLogin.ensureDefaultLaunchAtLogin()

        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let icon = NSImage(named: "MenuBarIcon") {
            icon.isTemplate = true
            let targetHeight: CGFloat = 19.0
            if icon.size.height > 0 {
                let targetWidth = targetHeight * icon.size.width / icon.size.height
                icon.size = NSSize(width: targetWidth, height: targetHeight)
                icon.alignmentRect = NSRect(x: 0, y: -3, width: targetWidth, height: targetHeight)
            }
            item.button?.image = icon
        }

        let menu = NSMenu()
        menu.delegate = self

        let sessionItem = NSMenuItem(title: "", action: #selector(toggleSession), keyEquivalent: "")
        sessionItem.target = self
        menu.addItem(sessionItem)
        sessionMenuItem = sessionItem

        let settingsItem = NSMenuItem(title: "Settings", action: #selector(openSettingsWindow), keyEquivalent: ",")
        settingsItem.target = self
        settingsItem.image = NSImage(systemSymbolName: "gearshape.fill", accessibilityDescription: nil)
        menu.addItem(settingsItem)

        let quitItem = NSMenuItem(title: "Quit", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        quitItem.image = NSImage(systemSymbolName: "xmark.circle.fill", accessibilityDescription: nil)
        menu.addItem(quitItem)

        item.menu = menu
        statusItem = item

        updateSessionMenuItem()

        // Initialize platform managers
        VisionVaultManager.shared.isEnabled = VisionSettings.shared.isVaultEnabled
        VisionGuardManager.shared.isEnabled = VisionSettings.shared.isGuardEnabled

        // Increment launch counter & record app_launched event
        VisionAnalytics.shared.recordLaunch()

        // Start listening for first unlock celebration
        FirstUnlockCelebrationController.shared.startObserving()

        // Check for version upgrade release notes
        ReleaseNotesManager.shared.checkForUpdatePresentation()

        NSApp.setActivationPolicy(.accessory)

        NotificationCenter.default.addObserver(
            self, selector: #selector(windowWillClose(_:)),
            name: NSWindow.willCloseNotification, object: nil
        )

        if VisionSettings.shared.hasCompletedOnboarding {
            // Evaluate 5th launch milestone (only triggers after onboarding)
            MilestonePopupController.shared.evaluateTrigger()

            if VisionSettings.shared.hasAcknowledgedSecurityNotice {
                startUpdaterIfNeeded()
            } else {
                presentPostUpdateSecurityNotice()
            }
        } else {
            if !VisionSettings.shared.hasSeenWelcome {
                presentWelcomeWindow()
            } else {
                presentOnboardingGate()
            }
        }
    }

    /// Presents first launch welcome window.
    private func presentWelcomeWindow() {
        NSApp.setActivationPolicy(.regular)
        WelcomeWindowController.shared.present { [weak self] in
            self?.presentOnboardingGate()
        }
    }

    /// First-run gate: onboarding lives entirely in the notch, so this stays accessory. Called once at launch if onboarding
    /// isn't done, and again from `revealSettingsWindow()` if the user reaches Settings mid-flow. Closing any main window here
    /// is defense in depth against SwiftUI's `.suppressed` scene timing not being guaranteed.
    private func presentOnboardingGate() {
        for window in NSApp.windows where window.canBecomeMain {
            window.close()
        }
        NSApp.setActivationPolicy(.accessory)
        OnboardingController.startFlow(
            resumingAt: VisionSettings.shared.onboardingResumeStep,
            onFirstRunComplete: { [weak self] in
                // First time Settings should appear, which also brings the Dock icon back.
                self?.revealSettingsWindow()
                self?.startUpdaterIfNeeded()
                MilestonePopupController.shared.evaluateTrigger()
            }
        )
    }

    /// One-time catch-up for users who completed onboarding before the security-notice step
    /// existed — same accessory/window-closing treatment as `presentOnboardingGate()`, but
    /// resumes straight into the updater afterward instead of revealing Settings, since setup
    /// itself is already done.
    private func presentPostUpdateSecurityNotice() {
        for window in NSApp.windows where window.canBecomeMain {
            window.close()
        }
        NSApp.setActivationPolicy(.accessory)
        // Reachable repeatedly — every gated menu action re-enters here while unacknowledged.
        // A fresh `startPostUpdateNotice()` would just replace the one already on screen.
        guard NotchOverlayController.shared.phase != .onboarding else { return }
        OnboardingController.startPostUpdateNotice { [weak self] in
            self?.startUpdaterIfNeeded()
        }
    }

    /// Reachable from launch (onboarding already done) or from first-run completion — `hasStartedUpdater` collapses both into "exactly once."
    private func startUpdaterIfNeeded() {
        guard !hasStartedUpdater else { return }
        hasStartedUpdater = true
        environment.updater.start()
    }

    /// Hides the Dock icon once no `canBecomeMain` window is left (`revealSettingsWindow()` brings it back) — excludes non-main
    /// windows like the lock-screen notch overlay, and backs off while Sparkle's update window is showing.
    @objc private func windowWillClose(_ notification: Notification) {
        guard let closingWindow = notification.object as? NSWindow, closingWindow.canBecomeMain else { return }
        guard !environment.updater.isPresentingUpdateUI else { return }
        let stillOpen = NSApp.windows.contains { $0 !== closingWindow && $0.canBecomeMain && $0.isVisible }
        guard !stillOpen else { return }
        NSApp.setActivationPolicy(.accessory)
    }

    /// Fires right before the menu opens — simpler than keeping an `NSMenuItem` reactively bound to `isSessionUnlocked`.
    func menuNeedsUpdate(_ menu: NSMenu) {
        updateSessionMenuItem()
    }

    private func updateSessionMenuItem() {
        guard let sessionMenuItem else { return }
        let isUnlocked = environment.pocController.isSessionUnlocked
        sessionMenuItem.title = isUnlocked ? "Session Unlocked" : "Session Locked"
        sessionMenuItem.image = NSImage(
            systemSymbolName: isUnlocked ? "lock.open.fill" : "lock.fill",
            accessibilityDescription: nil
        )
    }

    /// Locking is immediate; unlocking prompts Touch ID, so this can't be a plain synchronous action for that branch.
    @objc private func toggleSession() {
        guard !isBlockedByPostUpdateNotice else {
            presentPostUpdateSecurityNotice()
            return
        }
        if environment.pocController.isSessionUnlocked {
            environment.pocController.lockSession()
        } else {
            Task { await environment.pocController.unlockSession() }
        }
    }

    /// Keeps the process alive after the window closes so it can still react to the screen locking (e.g. for face unlock).
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false
    }

    /// A Dock click must not create the Settings window — that produced a duplicate Recents icon. If already open, the default
    /// reopen behavior just brings it forward.
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        return flag
    }

    /// Menu bar "Settings" — the only user-facing way to open the window after onboarding.
    @objc private func openSettingsWindow() {
        revealSettingsWindow()
        NSApp.activate(ignoringOtherApps: true)
    }

    /// True whenever an updated user hasn't acknowledged the post-update security notice yet.
    /// Checked by every menu-bar action that would otherwise let them use the app — Settings,
    /// locking/unlocking — before the notice has been seen.
    private var isBlockedByPostUpdateNotice: Bool {
        VisionSettings.shared.hasCompletedOnboarding && !VisionSettings.shared.hasAcknowledgedSecurityNotice
    }

    /// Restores the Dock icon before bringing the window forward — doing it after the window is already key can leave the icon
    /// out of sync. During onboarding this only ensures the notch flow is up; it doesn't open Settings or show a Dock icon.
    private func revealSettingsWindow() {
        if isBlockedByPostUpdateNotice {
            presentPostUpdateSecurityNotice()
            NSApp.activate(ignoringOtherApps: true)
            return
        }
        guard VisionSettings.shared.hasCompletedOnboarding else {
            // Re-present rather than restart: a fresh startFlow() would throw away the in-session step already navigated to,
            // since it only knows the last step written to disk.
            if NotchOverlayController.shared.phase != .onboarding {
                presentOnboardingGate()
            }
            NSApp.activate(ignoringOtherApps: true)
            return
        }
        if let icnsPath = Bundle.main.path(forResource: "AppIcon", ofType: "icns"),
           let appIcon = NSImage(contentsOfFile: icnsPath) {
            NSApp.applicationIconImage = appIcon
        }
        NSApp.setActivationPolicy(.regular)
        if let openSettingsWindowAction {
            openSettingsWindowAction()
        } else {
            // `body` hasn't run yet somehow — falls back to a direct walk, which only works if a window instance still exists.
            for window in NSApp.windows where window.canBecomeMain {
                window.makeKeyAndOrderFront(nil)
            }
        }
        // Coming from `.accessory` there's no user gesture to activate the app, so without this Settings appears inactive and
        // won't take focus until the user Cmd-Tabs away and back.
        makeSettingsKeyAndActive()
    }

    /// Two runloop hops: `openWindow(id:)` hasn't created the `NSWindow` on this turn, and `WindowConfiguringView` configures it
    /// on the next — waiting one extra cycle orders front after the window actually exists.
    private func makeSettingsKeyAndActive() {
        NSApp.activate(ignoringOtherApps: true)
        DispatchQueue.main.async { [weak self] in
            self?.orderSettingsFront()
            DispatchQueue.main.async {
                self?.orderSettingsFront()
            }
        }
    }

    private func orderSettingsFront() {
        NSApp.activate(ignoringOtherApps: true)
        if let window = NSApp.windows.first(where: { $0.canBecomeMain }) {
            window.makeKeyAndOrderFront(nil)
        }
    }
}
