//
//  WelcomePresenter.swift
//  Hangly
//
//  Saying hello, once.
//

import Observation
import SwiftUI

/// Owns whether the welcome card is on screen, and what its two buttons mean.
///
/// The decision is a pure read of `AppMilestones`, in the same shape as the follow
/// card's, so "the first launch and no other" is a property of the stored counters
/// rather than of this object having been constructed at the right moment.
///
/// It is marked as shown the instant it appears, not when it is answered. A menu bar
/// app can be quit from the menu bar with the card still open, and a greeting that
/// survives that is a greeting that shows up twice.
@MainActor
@Observable
final class WelcomePresenter {
    private(set) var isPresented = false

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let customize: CustomizeWindowController

    init(settingsStore: SettingsStore, customize: CustomizeWindowController) {
        self.settingsStore = settingsStore
        self.customize = customize
    }

    /// Shows the card if this is the first launch. Called once, after bootstrap.
    func offerIfDue() {
        guard settingsStore.settings.milestones.shouldOfferWelcome else { return }
        settingsStore.update { $0.milestones.hasSeenWelcome = true }
        isPresented = true
    }

    /// Closes the card and opens the Library.
    func exploreLibrary() {
        dismiss()
        customize.present(.library)
    }

    /// Closes the card and leaves the charm hanging, which is the whole app.
    func dismiss() {
        isPresented = false
    }
}
