//
//  PostHogProvider.swift
//  Hangly
//
//  The one place in Hangly that talks to PostHog.
//

import Foundation
import OSLog
import PostHog

/// Sends events to PostHog.
///
/// Configured deliberately narrowly. The SDK will, left alone, swizzle AppKit to
/// watch screens and lifecycle and push notifications; none of that is wanted here —
/// Hangly has no screens, sends its own launch and quit events, and has no push. So
/// every automatic capture is switched off and swizzling with it, which leaves the
/// SDK doing the one job it was brought in for: batching events, retrying them, and
/// giving up quietly when the network is not there.
///
/// Nothing in here can throw or block. A failed send is the SDK's problem and it
/// already handles it by keeping a bounded queue and dropping the oldest.
@MainActor
final class PostHogProvider: AnalyticsProvider {
    private let token: String
    private let host: String
    private var isStarted = false

    /// - Returns: `nil` when no project token is configured, so a build without one
    ///   runs with no analytics rather than a broken one.
    init?(token: String, host: String) {
        guard !token.isEmpty, token.hasPrefix("phc_"), !host.isEmpty else { return nil }
        self.token = token
        self.host = host
    }

    func start(distinctID: String, superProperties: [String: AnalyticsValue]) {
        guard !isStarted else { return }
        isStarted = true

        let config = PostHogConfig(projectToken: token, host: host)

        // Everything automatic, off. Each of these is a capture Hangly did not ask
        // for and could not describe in its own privacy note.
        config.captureApplicationLifecycleEvents = false
        config.captureScreenViews = false
        config.capturePushNotificationSubscriptions = false
        config.capturePushNotificationOpened = false
        config.enableSwizzling = false
        config.sendFeatureFlagEvent = false
        config.preloadFeatureFlags = false

        // The installation identifier is the identity from the very first event,
        // rather than an SDK-generated one that later gets aliased to ours.
        config.getAnonymousId = { _ in
            UUID(uuidString: distinctID) ?? UUID()
        }

        PostHogSDK.shared.setup(config)
        PostHogSDK.shared.identify(distinctID, userProperties: superProperties.propertyDictionary)
        Logger.app.diagnostic("Analytics started.")
    }

    func capture(_ event: AnalyticsEvent) {
        guard isStarted else { return }
        PostHogSDK.shared.capture(event.name, properties: event.properties.propertyDictionary)
    }

    func setEnabled(_ isEnabled: Bool) {
        guard isStarted else { return }
        if isEnabled {
            PostHogSDK.shared.optIn()
        } else {
            PostHogSDK.shared.optOut()
        }
    }

    func flush() {
        guard isStarted else { return }
        PostHogSDK.shared.flush()
    }
}

extension [String: AnalyticsValue] {
    /// The untyped form the SDK takes, made at the boundary and nowhere else.
    var propertyDictionary: [String: Any] {
        reduce(into: [:]) { result, pair in
            result[pair.key] = pair.value.propertyValue
        }
    }
}
