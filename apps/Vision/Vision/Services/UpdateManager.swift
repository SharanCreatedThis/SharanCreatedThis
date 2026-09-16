//
//  UpdateManager.swift
//  Vision
//
//  Production Sparkle 2.9.6 update controller for Vision.
//

import AppKit
import Observation
import Sparkle

@Observable
@MainActor
public final class UpdateManager {
    public static let shared = UpdateManager()

    private var controller: SPUStandardUpdaterController?
    private let presentationDelegate = UpdatePresentationDelegate()
    private let updaterDelegate = SparkleUpdaterDelegate()

    public private(set) var updateStatus: UpdateStatus = .idle
    public private(set) var latestReleaseNotes: String?
    public private(set) var lastUpdateCheckDate: Date?
    public private(set) var canCheckForUpdates = false
    private var canCheckForUpdatesObservation: NSKeyValueObservation?

    public var automaticallyChecksForUpdates: Bool {
        get { controller?.updater.automaticallyChecksForUpdates ?? true }
        set { controller?.updater.automaticallyChecksForUpdates = newValue }
    }

    public var automaticallyDownloadsUpdates: Bool {
        get { controller?.updater.automaticallyDownloadsUpdates ?? true }
        set { controller?.updater.automaticallyDownloadsUpdates = newValue }
    }

    public var isPresentingUpdateUI: Bool { presentationDelegate.isPresentingUpdateUI }

    private init() {}

    public func start() {
        guard controller == nil else { return }

        let standardController = SPUStandardUpdaterController(
            startingUpdater: true,
            updaterDelegate: updaterDelegate,
            userDriverDelegate: presentationDelegate
        )
        self.controller = standardController

        updaterDelegate.onStatusChange = { [weak self] status in
            Task { @MainActor [weak self] in
                self?.updateStatus = status
                if case .updateAvailable(_, let notes) = status {
                    self?.latestReleaseNotes = notes
                }
            }
        }

        canCheckForUpdatesObservation = standardController.updater.observe(
            \.canCheckForUpdates, options: [.initial, .new]
        ) { updater, _ in
            let value = updater.canCheckForUpdates
            Task { @MainActor [weak self] in
                self?.canCheckForUpdates = value
            }
        }
    }

    public func checkForUpdates() {
        lastUpdateCheckDate = Date()
        updateStatus = .checking
        controller?.checkForUpdates(nil)
    }

    public func compareVersion(_ versionA: String, to versionB: String) -> ComparisonResult {
        SUStandardVersionComparator.default.compareVersion(versionA, toVersion: versionB)
    }
}

// MARK: - Delegates

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
