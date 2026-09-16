//
//  UpdaterController.swift
//  vision
//
//  Wrapper around Sparkle's `SPUStandardUpdaterController` providing background updates,
//  release notes extraction, version comparison, and real-time status reporting.
//

import AppKit
import Observation
import Sparkle

public enum UpdateStatus: Equatable, Sendable {
    case idle
    case checking
    case updateAvailable(version: String, notes: String?)
    case downloading(progress: Double?)
    case readyToInstall(version: String)
    case upToDate
    case error(String)

    public var displayText: String {
        switch self {
        case .idle: return "Ready"
        case .checking: return "Checking for updates…"
        case .updateAvailable(let version, _): return "Update available: \(version)"
        case .downloading(let progress):
            if let progress {
                return "Downloading update (\(Int(progress * 100))%)…"
            }
            return "Downloading update…"
        case .readyToInstall(let version): return "Ready to install \(version)"
        case .upToDate: return "Up to date"
        case .error(let message): return "Update check failed: \(message)"
        }
    }
}

@Observable
@MainActor
public final class UpdaterController {
    private let controller: SPUStandardUpdaterController
    private let presentationDelegate = UpdatePresentationDelegate()
    private let updaterDelegate = SparkleUpdaterDelegate()

    /// Live update status reported to UI
    public private(set) var updateStatus: UpdateStatus = .idle

    /// Cached latest release notes from the most recently found update
    public private(set) var latestReleaseNotes: String?

    /// Mirrors `SPUUpdater.canCheckForUpdates` (KVO-only on Sparkle's side).
    public private(set) var canCheckForUpdates = false
    private var canCheckForUpdatesObservation: NSKeyValueObservation?

    /// Automatic update check preference forwarding directly to Sparkle.
    public var automaticallyChecksForUpdates: Bool {
        get { controller.updater.automaticallyChecksForUpdates }
        set { controller.updater.automaticallyChecksForUpdates = newValue }
    }

    /// Background update downloads preference forwarding directly to Sparkle.
    public var automaticallyDownloadsUpdates: Bool {
        get { controller.updater.automaticallyDownloadsUpdates }
        set { controller.updater.automaticallyDownloadsUpdates = newValue }
    }

    /// True while Sparkle is showing anything.
    public var isPresentingUpdateUI: Bool { presentationDelegate.isPresentingUpdateUI }

    public init() {
        controller = SPUStandardUpdaterController(
            startingUpdater: false,
            updaterDelegate: updaterDelegate,
            userDriverDelegate: presentationDelegate
        )

        updaterDelegate.onStatusChange = { [weak self] status in
            Task { @MainActor [weak self] in
                self?.updateStatus = status
                if case .updateAvailable(_, let notes) = status {
                    self?.latestReleaseNotes = notes
                }
            }
        }

        canCheckForUpdatesObservation = controller.updater.observe(
            \.canCheckForUpdates, options: [.initial, .new]
        ) { updater, _ in
            let value = updater.canCheckForUpdates
            Task { @MainActor [weak self] in
                self?.canCheckForUpdates = value
            }
        }
    }

    public func start() {
        controller.startUpdater()
    }

    /// User-initiated "Check for Updates" — shows Sparkle's standard progress UI.
    public func checkForUpdates() {
        updateStatus = .checking
        controller.checkForUpdates(nil)
    }

    /// Compare two semantic version strings using Sparkle's standard version comparator.
    public func compareVersion(_ versionA: String, to versionB: String) -> ComparisonResult {
        SUStandardVersionComparator.default.compareVersion(versionA, toVersion: versionB)
    }
}

/// Receives Sparkle update lifecycle callbacks for live status reporting & release notes.
private final class SparkleUpdaterDelegate: NSObject, SPUUpdaterDelegate, @unchecked Sendable {
    var onStatusChange: (@Sendable (UpdateStatus) -> Void)?

    func updater(_ updater: SPUUpdater, didFindValidUpdate item: SUAppcastItem) {
        let version = item.displayVersionString
        let notes = item.itemDescription
        onStatusChange?(.updateAvailable(version: version, notes: notes))
    }

    func updaterDidNotFindUpdate(_ updater: SPUUpdater, error: (any Error)?) {
        if let error {
            onStatusChange?(.error(error.localizedDescription))
        } else {
            onStatusChange?(.upToDate)
        }
    }

    func updater(_ updater: SPUUpdater, didDownloadUpdate item: SUAppcastItem) {
        onStatusChange?(.readyToInstall(version: item.displayVersionString))
    }

    func updater(_ updater: SPUUpdater, didFinishUpdateCycleFor updateCheck: SPUUpdateCheck, error: (any Error)?) {
        if let error {
            onStatusChange?(.error(error.localizedDescription))
        }
    }
}

/// Receives Sparkle's show/hide callbacks to bring the app forward when needed.
@MainActor
private final class UpdatePresentationDelegate: NSObject, SPUStandardUserDriverDelegate {
    private(set) var isPresentingUpdateUI = false

    func standardUserDriverWillShowModalAlert() {
        beginPresenting()
    }

    func standardUserDriverWillHandleShowingUpdate(
        _ handleShowingUpdate: Bool, forUpdate update: SUAppcastItem, state: SPUUserUpdateState
    ) {
        beginPresenting()
    }

    func standardUserDriverWillFinishUpdateSession() {
        isPresentingUpdateUI = false
    }

    private func beginPresenting() {
        isPresentingUpdateUI = true
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}
