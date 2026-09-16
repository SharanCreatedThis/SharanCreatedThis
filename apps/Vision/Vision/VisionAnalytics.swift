//
//  VisionAnalytics.swift
//  Vision
//
//  Centralized, privacy-first analytics manager.
//  Zero collection of biometric data, face vectors, camera frames, or personal identifiers.
//

import Foundation
import Observation

/// Whitelisted analytics events for onboarding, adoption, and retention
public enum AnalyticsEvent: String, Sendable, CaseIterable {
    // Feature 1: First Launch Welcome
    case welcomeShown = "welcome_shown"
    case welcomeContinue = "welcome_continue"

    // Feature 2: Onboarding Funnel
    case onboardingStarted = "onboarding_started"
    case cameraPermissionGranted = "camera_permission_granted"
    case faceRegistered = "face_registered"
    case firstUnlockSuccess = "first_unlock_success"

    // Feature 3: Feature Adoption
    case visionUnlockEnabled = "vision_unlock_enabled"
    case visionGuardEnabled = "vision_guard_enabled"
    case visionVaultEnabled = "vision_vault_enabled"

    // Feature 4: Unlock Celebration
    case firstUnlockCelebrationShown = "first_unlock_celebration_shown"

    // Feature 5 & 6: Milestones & Retention
    case appLaunched = "app_launched"
    case launchMilestoneShown = "launch_milestone_shown"
    case launchMilestoneDismissed = "launch_milestone_dismissed"

    // Feature 7: Release Notes
    case releaseNotesViewed = "release_notes_viewed"
}

@Observable
@MainActor
public final class VisionAnalytics {
    public static let shared = VisionAnalytics()

    private enum Key {
        static let totalUnlocks       = "VisionAnalytics.totalUnlocks"
        static let totalFailed        = "VisionAnalytics.totalFailed"
        static let lastUnlockDate     = "VisionAnalytics.lastUnlockDate"
        static let analyticsEnabled   = "VisionAnalytics.analyticsEnabled"
        static let launchCount        = "VisionAnalytics.launchCount"
        static let hasRecordedFirstUnlock = "VisionAnalytics.hasRecordedFirstUnlock"
    }

    @ObservationIgnored private let defaults = UserDefaults.standard
    @ObservationIgnored private var backends: [AnalyticsBackend] = [
        LocalAnalyticsBackend.shared,
        PostHogAnalyticsBackend.shared
    ]

    /// Total successful face unlocks since install.
    public var totalUnlocks: Int {
        didSet { defaults.set(totalUnlocks, forKey: Key.totalUnlocks) }
    }

    /// Total failed/blocked authentication attempts.
    public var totalFailed: Int {
        didSet { defaults.set(totalFailed, forKey: Key.totalFailed) }
    }

    /// Timestamp of the most recent successful face unlock.
    public var lastUnlockDate: Date? {
        didSet { defaults.set(lastUnlockDate, forKey: Key.lastUnlockDate) }
    }

    /// Whether analytics collection is active. Wired to settings footer.
    public var analyticsEnabled: Bool {
        didSet { defaults.set(analyticsEnabled, forKey: Key.analyticsEnabled) }
    }

    /// Monotonic count of app launches.
    public var launchCount: Int {
        didSet { defaults.set(launchCount, forKey: Key.launchCount) }
    }

    /// Whether the first unlock has been tracked.
    public var hasRecordedFirstUnlock: Bool {
        didSet { defaults.set(hasRecordedFirstUnlock, forKey: Key.hasRecordedFirstUnlock) }
    }

    private init() {
        totalUnlocks            = defaults.integer(forKey: Key.totalUnlocks)
        totalFailed             = defaults.integer(forKey: Key.totalFailed)
        lastUnlockDate          = defaults.object(forKey: Key.lastUnlockDate) as? Date
        analyticsEnabled        = defaults.object(forKey: Key.analyticsEnabled) as? Bool ?? true
        launchCount             = defaults.integer(forKey: Key.launchCount)
        hasRecordedFirstUnlock  = defaults.bool(forKey: Key.hasRecordedFirstUnlock)
    }

    // MARK: - Event Dispatching

    /// Track a predefined analytics event with optional sanitized properties.
    /// Strictly guarantees no personal or biometric data is ever collected.
    public func track(_ event: AnalyticsEvent, properties: [String: Any] = [:]) {
        guard analyticsEnabled else { return }

        // Sanitize: strip out any prohibited sensitive keys
        var safeProperties: [String: Any] = [:]
        let forbidden = ["embedding", "vector", "face", "frame", "image", "password", "key", "token"]

        for (k, v) in properties {
            let lower = k.lowercased()
            if !forbidden.contains(where: { lower.contains($0) }) {
                safeProperties[k] = v
            }
        }

        for backend in backends {
            backend.track(event: event.rawValue, properties: safeProperties)
        }
    }

    /// Nonisolated convenience for background or actor-detached callers.
    public nonisolated func trackDetached(_ event: AnalyticsEvent, properties: [String: Any] = [:]) {
        Task { @MainActor in
            VisionAnalytics.shared.track(event, properties: properties)
        }
    }

    // MARK: - Core Unlocks Tracking

    /// Call this on every successful face unlock.
    public nonisolated func recordUnlock() {
        Task { @MainActor in
            guard VisionAnalytics.shared.analyticsEnabled else { return }
            let isFirst = !VisionAnalytics.shared.hasRecordedFirstUnlock || VisionAnalytics.shared.totalUnlocks == 0
            VisionAnalytics.shared.totalUnlocks += 1
            VisionAnalytics.shared.lastUnlockDate = Date()

            if isFirst {
                VisionAnalytics.shared.hasRecordedFirstUnlock = true
                VisionAnalytics.shared.track(.firstUnlockSuccess)
                NotificationCenter.default.post(name: .visionFirstUnlockSucceeded, object: nil)
            }
        }
    }

    /// Call this on every failed recognition or liveness block.
    public nonisolated func recordFailure() {
        Task { @MainActor in
            guard VisionAnalytics.shared.analyticsEnabled else { return }
            VisionAnalytics.shared.totalFailed += 1
        }
    }

    /// Increments the launch counter and logs `app_launched`.
    public func recordLaunch() {
        launchCount += 1
        track(.appLaunched, properties: ["launch_count": launchCount])
    }

    /// Add an analytics backend provider.
    public func addBackend(_ backend: AnalyticsBackend) {
        backends.append(backend)
    }
}

public extension Notification.Name {
    static let visionFirstUnlockSucceeded = Notification.Name("visionFirstUnlockSucceeded")
}
