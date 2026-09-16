//
//  FollowPromptPresenter.swift
//  Hangly
//
//  Deciding when, and how rarely, to ask.
//

import Observation
import SwiftUI

/// How the follow card was answered.
enum FollowPromptAnswer: Equatable, Sendable {
    /// Opened Instagram. Never asked again.
    case followed

    /// Said later, which is the only answer that gets asked twice.
    case later

    /// Said no, or closed it. Never asked again.
    case declined
}

/// Owns whether the follow card is on screen, and what an answer means.
///
/// The decision is a pure read of `AppMilestones`, so "after five launches, once,
/// and again only if somebody said later" is a property of the settings rather than
/// of this object's mood. Closing the card counts as declining: a card that only
/// counts as answered when you press the right button comes back for everybody who
/// closed it, which is the behaviour this exists to avoid.
@MainActor
@Observable
final class FollowPromptPresenter {
    private(set) var isPresented = false

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored let analytics: AnalyticsManager?

    init(settingsStore: SettingsStore, analytics: AnalyticsManager? = nil) {
        self.settingsStore = settingsStore
        self.analytics = analytics
    }

    /// Shows the card if this launch is the one. Called once, after bootstrap.
    func offerIfDue() {
        guard settingsStore.settings.milestones.shouldOfferFollowPrompt else { return }
        settingsStore.update { settings in
            settings.milestones.followPromptShownAtLaunch = settings.milestones.launchCount
        }
        analytics?.track(.followPopupShown)
        isPresented = true
    }

    /// Records the answer and closes the card.
    func answer(_ answer: FollowPromptAnswer) {
        guard isPresented else { return }
        isPresented = false

        switch answer {
        case .followed:
            analytics?.track(.followPopupFollowClicked)
            silence()
        case .later:
            analytics?.track(.followPopupMaybeLater)
        case .declined:
            analytics?.track(.followPopupDismissed)
            silence()
        }
    }

    private func silence() {
        settingsStore.update { $0.milestones.isFollowPromptSilenced = true }
    }
}
