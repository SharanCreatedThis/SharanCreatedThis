//
//  AnalyticsManager.swift
//  Hangly
//
//  What is sent, when, and whether it is sent at all.
//

import AppKit
import Foundation
import Observation

/// Decides what leaves the machine.
///
/// Every event in the app goes through here, and here is the only place that reads
/// the privacy setting. Switching analytics off stops capture at this gate *and*
/// tells the provider to stop — belt and braces, because "we filter it later" is how
/// data gets sent by accident.
///
/// Nothing here is allowed to fail visibly. There is no error path to the interface
/// and no `throws`: an event that cannot be sent is a fact nobody needs.
@MainActor
@Observable
final class AnalyticsManager {
    /// What the About page shows. Observed, so the panel follows without polling.
    private(set) var lastEventName: String?
    private(set) var lastEventAt: Date?
    private(set) var sentCount = 0

    /// Whether a destination is configured and running.
    private(set) var connection: ConnectionStatus = .notStarted

    enum ConnectionStatus: Equatable, Sendable {
        /// Nothing has been started, because sharing is off or the app has not
        /// finished launching.
        case notStarted

        /// Running and sending.
        case connected(host: String)

        /// No project token in this build, so there is nowhere to send.
        case noDestination

        var summary: String {
            switch self {
            case .notStarted: "Not started"
            case .connected(let host): "Connected — \(host)"
            case .noDestination: "No destination configured"
            }
        }
    }

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let provider: any AnalyticsProvider
    @ObservationIgnored private var hasStarted = false

    init(settingsStore: SettingsStore, provider: (any AnalyticsProvider)? = nil) {
        self.settingsStore = settingsStore
        self.provider = provider ?? Self.makeProvider()
    }

    /// PostHog when a token is configured, nothing when it is not.
    private static func makeProvider() -> any AnalyticsProvider {
        PostHogProvider(token: AppConstants.Analytics.token, host: AppConstants.Analytics.host)
            ?? NoOpAnalyticsProvider()
    }

    var isEnabled: Bool {
        settingsStore.settings.privacy.analyticsEnabled
    }

    // MARK: - Lifecycle

    /// Counts the launch, starts the provider if allowed, and says hello.
    ///
    /// The launch is counted whether or not analytics is on, because the follow card
    /// is scheduled off the same number and that has nothing to do with analytics.
    func start() {
        guard !hasStarted else { return }
        hasStarted = true

        var isFirstLaunch = false
        settingsStore.update { settings in
            settings.milestones.launchCount += 1
            isFirstLaunch = settings.milestones.isFirstLaunch
        }

        guard isEnabled else { return }

        let identifier = currentIdentifier()
        provider.start(distinctID: identifier, superProperties: superProperties)
        connection = AppConstants.Analytics.token.isEmpty
            ? .noDestination
            : .connected(host: AppConstants.Analytics.host)
        if isFirstLaunch {
            track(.appFirstLaunch)
        }
        track(.appLaunch)
    }

    /// Called as the app goes away, so the queue is not lost with it.
    func stop() {
        guard hasStarted, isEnabled else { return }
        track(.appQuit)
        provider.flush()
    }

    // MARK: - Sending

    func track(_ event: AnalyticsEvent) {
        guard isEnabled else { return }
        provider.capture(AnalyticsEvent(event.name, event.properties.merging(ropeProperties) { current, _ in
            current
        }))
        lastEventName = event.name
        lastEventAt = Date()
        sentCount += 1
    }

    /// The installation identifier with most of it hidden.
    ///
    /// Enough to tell two machines apart when somebody reads it out, and not enough
    /// to be worth writing down. Nil when no identifier exists, which is the normal
    /// state of an install that has never sent anything.
    var maskedIdentifier: String? {
        guard let id = settingsStore.settings.privacy.anonymousID?.uuidString else { return nil }
        let head = id.prefix(8)
        let tail = id.suffix(4)
        return "\(head)-••••-••••-••••-••••••••\(tail)"
    }

    // MARK: - Consent

    /// Turns sharing on or off. Off stops capture on the next line, not later.
    func setEnabled(_ isEnabled: Bool) {
        guard isEnabled != self.isEnabled else { return }
        if !isEnabled {
            provider.setEnabled(false)
            provider.flush()
            connection = .notStarted
            lastEventName = nil
            lastEventAt = nil
            sentCount = 0
        }
        settingsStore.update { $0.privacy.setAnalyticsEnabled(isEnabled) }

        guard isEnabled else { return }
        // Back on means a new identity, because the old one was discarded on the
        // way out and stitching the two would defeat the point of discarding it.
        provider.setEnabled(true)
        provider.start(distinctID: currentIdentifier(), superProperties: superProperties)
        connection = AppConstants.Analytics.token.isEmpty
            ? .noDestination
            : .connected(host: AppConstants.Analytics.host)
        track(.appLaunch)
    }

    // MARK: - What goes with every event

    /// The installation identifier, minted on first use and stored from then on.
    private func currentIdentifier() -> String {
        var identifier = UUID()
        settingsStore.update { identifier = $0.privacy.identifier() }
        return identifier.uuidString
    }

    /// Facts about the build and the machine. No account, no name, no location.
    private var superProperties: [String: AnalyticsValue] {
        [
            "app_version": .string(AppConstants.shortVersion),
            "build_number": .string(AppConstants.buildNumber),
            "macos_version": .string(Self.systemVersion),
            "analytics_enabled": .flag(isEnabled)
        ]
    }

    /// What is on the rope, which is the shape of how the app is used.
    private var ropeProperties: [String: AnalyticsValue] {
        let stack = settingsStore.settings.overlay.stack
        return [
            "charm_count": .integer(stack.count),
            "active_charm_ids": .list(stack.charms.map(\.analyticsName)),
            "rope_style": .string(settingsStore.settings.overlay.ropeStyle.rawValue)
        ]
    }

    private static var systemVersion: String {
        let version = ProcessInfo.processInfo.operatingSystemVersion
        return "\(version.majorVersion).\(version.minorVersion).\(version.patchVersion)"
    }
}
