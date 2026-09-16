//
//  FollowPromptTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// Asked after five launches, once, and never again however it is dismissed.
@Suite("Follow prompt")
@MainActor
struct FollowPromptTests {
    @Test("The rule is a property of the counter, not of the moment")
    func rule() {
        for count in 0..<AppMilestones.launchesBeforeFollowPrompt {
            #expect(AppMilestones(launchCount: count).shouldOfferFollowPrompt == false)
        }
        #expect(AppMilestones(launchCount: 5).shouldOfferFollowPrompt)
        #expect(AppMilestones(launchCount: 40).shouldOfferFollowPrompt)

        // Silenced is silenced, whatever the count reaches afterwards.
        #expect(AppMilestones(launchCount: 99, isFollowPromptSilenced: true).shouldOfferFollowPrompt == false)
    }

    @Test("Maybe later is the one answer that gets asked twice")
    func maybeLaterComesBack() {
        let shown = AppMilestones(launchCount: 5, followPromptShownAtLaunch: 5)
        #expect(shown.shouldOfferFollowPrompt == false)

        var soon = shown
        soon.launchCount = 5 + AppMilestones.launchesBetweenReminders - 1
        #expect(soon.shouldOfferFollowPrompt == false)

        var later = shown
        later.launchCount = 5 + AppMilestones.launchesBetweenReminders
        #expect(later.shouldOfferFollowPrompt)

        // Unless it was answered for good in the meantime.
        var silenced = later
        silenced.isFollowPromptSilenced = true
        #expect(silenced.shouldOfferFollowPrompt == false)
    }

    @Test("A build from before maybe later existed keeps its answer")
    func migratesFromTheOldFlag() throws {
        let json = #"{"launchCount": 30, "hasSeenFollowPrompt": true}"#
        let migrated = try JSONDecoder().decode(AppMilestones.self, from: Data(json.utf8))

        // Seen used to mean never again, and it still does.
        #expect(migrated.isFollowPromptSilenced)
        #expect(migrated.shouldOfferFollowPrompt == false)
        #expect(migrated.launchCount == 30)
    }

    @Test("Each answer is reported, and only the right ones silence it")
    func answersAreReported() throws {
        for (answer, event, silences) in [
            (FollowPromptAnswer.followed, "follow_popup_follow_clicked", true),
            (FollowPromptAnswer.later, "follow_popup_maybe_later", false),
            (FollowPromptAnswer.declined, "follow_popup_dismissed", true)
        ] {
            let suiteName = "com.hangly.tests.\(UUID().uuidString)"
            let defaults = try #require(UserDefaults(suiteName: suiteName))
            defer { defaults.removePersistentDomain(forName: suiteName) }

            let store = SettingsStore(defaults: defaults, storageKey: "settings")
            store.update { $0.milestones.launchCount = AppMilestones.launchesBeforeFollowPrompt }
            let provider = RecordingAnalyticsProvider()
            let analytics = AnalyticsManager(settingsStore: store, provider: provider)
            analytics.start()
            let presenter = FollowPromptPresenter(settingsStore: store, analytics: analytics)

            presenter.offerIfDue()
            #expect(presenter.isPresented)
            presenter.answer(answer)

            #expect(presenter.isPresented == false)
            #expect(provider.names.contains(event))
            #expect(store.settings.milestones.isFollowPromptSilenced == silences)
        }
    }

    @Test("It appears on the fifth launch and on no other")
    func appearsOnceAtFive() throws {
        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = SettingsStore(defaults: defaults, storageKey: "settings")
        let provider = RecordingAnalyticsProvider()
        let analytics = AnalyticsManager(settingsStore: store, provider: provider)
        let presenter = FollowPromptPresenter(settingsStore: store, analytics: analytics)

        var shown = 0
        for launch in 1...10 {
            // A fresh manager each time, because each launch gets one.
            AnalyticsManager(settingsStore: store, provider: provider).start()
            presenter.offerIfDue()
            if presenter.isPresented {
                shown += 1
                #expect(launch == AppMilestones.launchesBeforeFollowPrompt)
                presenter.answer(.declined)
            }
        }

        #expect(shown == 1)
        #expect(store.settings.milestones.isFollowPromptSilenced)
        #expect(provider.names.filter { $0 == "follow_popup_shown" }.count == 1)
    }

    @Test("Dismissing without following still counts as having been asked")
    func dismissingIsAnAnswer() throws {
        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = SettingsStore(defaults: defaults, storageKey: "settings")
        store.update { $0.milestones.launchCount = AppMilestones.launchesBeforeFollowPrompt }
        let presenter = FollowPromptPresenter(settingsStore: store)

        presenter.offerIfDue()
        #expect(presenter.isPresented)
        presenter.answer(.declined)

        // Closing counts as no, so it is final.
        presenter.offerIfDue()
        #expect(presenter.isPresented == false)
    }

    @Test("Following is reported, and the link is the creator's")
    func followingIsReported() throws {
        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = SettingsStore(defaults: defaults, storageKey: "settings")
        let provider = RecordingAnalyticsProvider()
        let analytics = AnalyticsManager(settingsStore: store, provider: provider)
        analytics.start()
        store.update { $0.milestones.launchCount = AppMilestones.launchesBeforeFollowPrompt }
        let presenter = FollowPromptPresenter(settingsStore: store, analytics: analytics)
        presenter.offerIfDue()
        presenter.answer(.followed)

        #expect(provider.names.contains("follow_popup_follow_clicked"))
        #expect(Creator.instagram?.absoluteString == "https://instagram.com/sharan.created.this")
        #expect(Creator.handle == "@sharan.created.this")
    }
}
