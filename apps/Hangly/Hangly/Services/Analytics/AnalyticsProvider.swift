//
//  AnalyticsProvider.swift
//  Hangly
//
//  Where events go, behind a protocol so that "nowhere" is a valid answer.
//

import Foundation

/// Somewhere to send events.
///
/// A protocol rather than a direct call into a vendor SDK, for three reasons that
/// all turned out to matter: the app has to build and run with no analytics at all,
/// the tests have to be able to read back what would have been sent, and the one
/// place that talks to the network should be small enough to read in a sitting.
@MainActor
protocol AnalyticsProvider: AnyObject {
    /// Called once, when analytics is allowed to begin.
    /// - Parameters:
    ///   - distinctID: The anonymous installation identifier.
    ///   - properties: Facts attached to every event from here on.
    func start(distinctID: String, superProperties: [String: AnalyticsValue])

    func capture(_ event: AnalyticsEvent)

    /// Stops or resumes sending. Off must take effect immediately and must not be
    /// a filter applied later somewhere else.
    func setEnabled(_ isEnabled: Bool)

    /// Sends whatever is queued. Called when the app is going away.
    func flush()
}

/// Sends nothing, anywhere, ever.
///
/// What runs when analytics is switched off, when no project token is configured,
/// and in every test that is not specifically about analytics.
@MainActor
final class NoOpAnalyticsProvider: AnalyticsProvider {
    func start(distinctID: String, superProperties: [String: AnalyticsValue]) {}
    func capture(_ event: AnalyticsEvent) {}
    func setEnabled(_ isEnabled: Bool) {}
    func flush() {}
}
