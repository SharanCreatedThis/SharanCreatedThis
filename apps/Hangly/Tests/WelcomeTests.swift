//
//  WelcomeTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// Said on the first launch and on no other, however the card is got rid of.
@Suite("Welcome card")
@MainActor
struct WelcomeTests {
    @Test("Only the first launch is greeted")
    func rule() {
        #expect(AppMilestones(launchCount: 0).shouldOfferWelcome)
        #expect(AppMilestones(launchCount: 1).shouldOfferWelcome)

        for count in 2...12 {
            #expect(AppMilestones(launchCount: count).shouldOfferWelcome == false)
        }

        // Having been shown is final. There is no "later" for a greeting.
        #expect(AppMilestones(launchCount: 1, hasSeenWelcome: true).shouldOfferWelcome == false)
    }

    @Test("An install from before the card existed is left alone")
    func doesNotGreetExistingInstalls() throws {
        let json = #"{"launchCount": 30, "isFollowPromptSilenced": true}"#
        let migrated = try JSONDecoder().decode(AppMilestones.self, from: Data(json.utf8))

        #expect(migrated.hasSeenWelcome == false)
        #expect(migrated.shouldOfferWelcome == false)
        #expect(migrated.secretsFound == 0)
        #expect(migrated.charmPushes == 0)
    }

    @Test("It is marked as shown the moment it appears, not when it is answered")
    func recordsOnShow() throws {
        let (store, cleanup) = try Self.makeStore()
        defer { cleanup() }

        store.update { $0.milestones.launchCount = 1 }
        let presenter = WelcomePresenter(settingsStore: store, customize: CustomizeWindowController())

        presenter.offerIfDue()
        #expect(presenter.isPresented)
        // Written before anybody has pressed anything: quitting from the menu bar
        // with the card open must not bring it back.
        #expect(store.settings.milestones.hasSeenWelcome)

        presenter.dismiss()
        #expect(presenter.isPresented == false)

        // A second launch, and a second ask, changes nothing.
        store.update { $0.milestones.launchCount = 2 }
        presenter.offerIfDue()
        #expect(presenter.isPresented == false)
    }

    @Test("Exploring the Library closes the card")
    func exploreDismisses() throws {
        let (store, cleanup) = try Self.makeStore()
        defer { cleanup() }

        store.update { $0.milestones.launchCount = 1 }
        let presenter = WelcomePresenter(settingsStore: store, customize: CustomizeWindowController())
        presenter.offerIfDue()

        // No window has lent an action in a test, so opening a page is a no-op —
        // what has to hold either way is that the card goes.
        presenter.exploreLibrary()
        #expect(presenter.isPresented == false)
    }

    @Test("The counters survive a round trip")
    func countersPersist() throws {
        let milestones = AppMilestones(
            launchCount: 7,
            hasSeenWelcome: true,
            secretsFound: 23,
            charmPushes: 402
        )
        let data = try JSONEncoder().encode(milestones)
        let restored = try JSONDecoder().decode(AppMilestones.self, from: data)

        #expect(restored == milestones)
    }

    private static func makeStore() throws -> (SettingsStore, () -> Void) {
        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        return (
            SettingsStore(defaults: defaults, storageKey: "settings"),
            { defaults.removePersistentDomain(forName: suiteName) }
        )
    }
}
