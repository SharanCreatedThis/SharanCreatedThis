//
//  FullscreenVideoWatcher.swift
//  Hangly
//
//  Noticing when someone is watching something.
//

import AppKit
import IOKit.pwr_mgt
import Observation
import OSLog

/// One window on the active Space, reduced to the two facts that decide this.
struct ScreenWindow: Equatable, Sendable {
    var owner: String
    var frame: CGRect
}

/// Whether a film is on.
///
/// Two signals, because neither is enough alone and together they are exact.
///
/// **Full screen.** macOS reports a full-screen window and a merely maximised one
/// identically — same level, same origin, same size, because both are the screen's
/// visible frame. Measured, not assumed. What *does* differ is that a full-screen
/// window gets a Space of its own, so every ordinary window on the active Space
/// belongs to one application.
///
/// **Playing.** Anything showing video takes a display-sleep power assertion, which
/// is how the screen does not dim during a film. `IOPMCopyAssertionsByProcess` is
/// public, needs no permission, and is what `pmset -g assertions` reads.
///
/// Either on its own is wrong: a single maximised window is not a film, and a video
/// in a small window is not something to hide from. Both together is a film.
@MainActor
@Observable
final class FullscreenVideoWatcher {
    private(set) var isActive = false

    @ObservationIgnored private var observers: [any NSObjectProtocol] = []
    @ObservationIgnored private var pollTask: Task<Void, Never>?
    @ObservationIgnored private let readWindows: () -> [ScreenWindow]
    @ObservationIgnored private let readAssertionHolders: () -> Set<String>

    /// How often the screen is re-read while the feature is switched on.
    ///
    /// A constant poll, which is not the first choice and is the right one. Two of
    /// the things being watched announce themselves — going full screen the system's
    /// way changes Space, and applications activate — but the two that matter most
    /// do not: pressing play inside a window that is already full screen, and VLC's
    /// own full screen, which never gets a Space and so fires nothing at all.
    ///
    /// It costs a window-list read and a power-assertion read, both microseconds,
    /// and it only runs at all when somebody has switched the feature on.
    private static let pollInterval: Duration = .seconds(2)

    init(
        windows: @escaping () -> [ScreenWindow] = FullscreenVideoWatcher.activeSpaceWindows,
        assertionHolders: @escaping () -> Set<String> = FullscreenVideoWatcher.displayAssertionHolders
    ) {
        readWindows = windows
        readAssertionHolders = assertionHolders
    }

    func start() {
        guard observers.isEmpty else { return }
        let center = NSWorkspace.shared.notificationCenter
        let names: [Notification.Name] = [
            NSWorkspace.activeSpaceDidChangeNotification,
            NSWorkspace.didActivateApplicationNotification
        ]
        observers = names.map { name in
            center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
                MainActor.assumeIsolated { self?.evaluate() }
            }
        }
        startPolling()
        evaluate()
    }

    func stop() {
        let center = NSWorkspace.shared.notificationCenter
        observers.forEach(center.removeObserver)
        observers.removeAll()
        pollTask?.cancel()
        pollTask = nil
        isActive = false
    }

    private func evaluate() {
        let windows = readWindows()
        let screens = NSScreen.screens.map(\.frame)
        let isImmersive = Self.isImmersive(windows: windows, screens: screens, appName: AppConstants.appName)

        // The assertion is only worth reading when the Space already looks like a
        // film could be playing on it.
        let next = isImmersive && !Self.othersHoldingDisplayAssertion(readAssertionHolders()).isEmpty

        guard next != isActive else { return }
        isActive = next
        Logger.overlay.diagnostic("Fullscreen video \(next ? "began" : "ended").")
    }

    private func startPolling() {
        guard pollTask == nil else { return }
        pollTask = Task { @MainActor [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: Self.pollInterval)
                guard !Task.isCancelled, let self else { return }
                self.evaluate()
            }
        }
    }

    // MARK: - The rule

    /// Whether the screen has been taken over, by either of the two ways it happens.
    nonisolated static func isImmersive(windows: [ScreenWindow], screens: [CGRect], appName: String) -> Bool {
        isFullScreenSpace(owners: Set(windows.map(\.owner)), appName: appName)
            || coversWholeScreen(windows: windows, screens: screens, appName: appName)
    }

    /// Whether the active Space belongs to one application, which is what macOS's
    /// own full screen looks like from outside it. QuickTime, Apple TV, and a
    /// browser playing Netflix or YouTube full screen all land here.
    nonisolated static func isFullScreenSpace(owners: Set<String>, appName: String) -> Bool {
        owners.subtracting([appName]).count == 1
    }

    /// Whether a window covers the entire display, menu bar included.
    ///
    /// The other kind of full screen, and the reason one rule was not enough: VLC
    /// does not use the system's, it simply draws a window over everything, and so
    /// never gets a Space of its own. Measured — VLC full screen is `(0,0)` by
    /// `1710×1107` where a merely maximised window is `(0,34)` by `1710×1073`, so
    /// the menu bar strip is exactly what tells them apart.
    nonisolated static func coversWholeScreen(
        windows: [ScreenWindow],
        screens: [CGRect],
        appName: String,
        tolerance: CGFloat = 2
    ) -> Bool {
        windows.contains { window in
            guard window.owner != appName else { return false }
            return screens.contains { screen in
                abs(window.frame.width - screen.width) <= tolerance
                    && abs(window.frame.height - screen.height) <= tolerance
            }
        }
    }

    /// Whoever is keeping the display awake, other than us.
    nonisolated static func othersHoldingDisplayAssertion(_ holders: Set<String>) -> Set<String> {
        holders.subtracting([AppConstants.appName])
    }

    // MARK: - Reading the system

    /// The ordinary windows on the active Space.
    nonisolated static func activeSpaceWindows() -> [ScreenWindow] {
        let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
        guard let raw = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] else {
            return []
        }
        return raw.compactMap { entry in
            guard (entry[kCGWindowLayer as String] as? Int ?? 0) == 0,
                  let bounds = entry[kCGWindowBounds as String] as? [String: CGFloat],
                  let frame = CGRect(dictionaryRepresentation: bounds as CFDictionary) else { return nil }
            return ScreenWindow(owner: entry[kCGWindowOwnerName as String] as? String ?? "", frame: frame)
        }
    }

    /// The two assertion types an application takes while showing video.
    ///
    /// Matched exactly rather than by substring, which was a real bug and a quiet
    /// one: `powerd` holds `InternalPreventDisplaySleep` as routine housekeeping,
    /// a substring match caught it, and the ornament vanished the moment anything
    /// went full screen whether or not a film was playing.
    nonisolated static let playbackAssertionTypes: Set<String> = [
        "PreventUserIdleDisplaySleep",
        "NoDisplaySleepAssertion"
    ]

    /// Never evidence of a film, whatever they assert.
    nonisolated static let systemProcesses: Set<String> = [
        "powerd", "WindowServer", "coreaudiod", "sharingd", "bluetoothd"
    ]

    /// Processes currently preventing the display from sleeping.
    nonisolated static func displayAssertionHolders() -> Set<String> {
        var dictionary: Unmanaged<CFDictionary>?
        guard IOPMCopyAssertionsByProcess(&dictionary) == kIOReturnSuccess,
              let byProcess = dictionary?.takeRetainedValue() as? [NSNumber: [[String: Any]]] else {
            return []
        }
        var holders: Set<String> = []
        for assertions in byProcess.values {
            for assertion in assertions {
                let type = assertion["AssertType"] as? String ?? ""
                guard Self.playbackAssertionTypes.contains(type) else { continue }
                let process = assertion["Process Name"] as? String ?? ""
                guard !Self.systemProcesses.contains(process) else { continue }
                holders.insert(process)
            }
        }
        return holders
    }
}
