//
//  AnalyticsTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// A provider that keeps what it was given, so a test can read back exactly what
/// would have left the machine.
@MainActor
final class RecordingAnalyticsProvider: AnalyticsProvider {
    private(set) var events: [AnalyticsEvent] = []
    private(set) var distinctID: String?
    private(set) var superProperties: [String: AnalyticsValue] = [:]
    private(set) var isEnabled = true
    private(set) var flushCount = 0
    private(set) var startCount = 0

    var names: [String] { events.map(\.name) }

    func start(distinctID: String, superProperties: [String: AnalyticsValue]) {
        startCount += 1
        self.distinctID = distinctID
        self.superProperties = superProperties
    }

    func capture(_ event: AnalyticsEvent) {
        events.append(event)
    }

    func setEnabled(_ isEnabled: Bool) {
        self.isEnabled = isEnabled
    }

    func flush() {
        flushCount += 1
    }
}

@Suite("Analytics")
@MainActor
struct AnalyticsTests {
    private struct Fixture {
        let store: SettingsStore
        let provider: RecordingAnalyticsProvider
        let manager: AnalyticsManager
        let defaults: UserDefaults
        let suiteName: String

        func tearDown() {
            defaults.removePersistentDomain(forName: suiteName)
        }
    }

    private func makeFixture(analyticsEnabled: Bool = true) throws -> Fixture {
        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        let store = SettingsStore(defaults: defaults, storageKey: "settings")
        store.update { $0.privacy.analyticsEnabled = analyticsEnabled }
        let provider = RecordingAnalyticsProvider()
        return Fixture(
            store: store,
            provider: provider,
            manager: AnalyticsManager(settingsStore: store, provider: provider),
            defaults: defaults,
            suiteName: suiteName
        )
    }

    // MARK: - The installation identifier

    @Test("No identifier exists until something is actually sent")
    func identifierIsMintedLazily() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        #expect(fixture.store.settings.privacy.anonymousID == nil)

        fixture.manager.start()
        #expect(fixture.store.settings.privacy.anonymousID != nil)
        #expect(fixture.provider.distinctID == fixture.store.settings.privacy.anonymousID?.uuidString)
    }

    @Test("The identifier survives a relaunch")
    func identifierPersists() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.start()
        let first = try #require(fixture.store.settings.privacy.anonymousID)

        // A second store over the same defaults is what a relaunch looks like.
        let reopened = SettingsStore(defaults: fixture.defaults, storageKey: "settings")
        let second = RecordingAnalyticsProvider()
        AnalyticsManager(settingsStore: reopened, provider: second).start()

        #expect(reopened.settings.privacy.anonymousID == first)
        #expect(second.distinctID == first.uuidString)
    }

    @Test("Opting out throws the identifier away, and opting back in makes a new one")
    func identifierIsDiscardedOnOptOut() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.start()
        let first = try #require(fixture.store.settings.privacy.anonymousID)

        fixture.manager.setEnabled(false)
        #expect(fixture.store.settings.privacy.anonymousID == nil)

        fixture.manager.setEnabled(true)
        let second = fixture.store.settings.privacy.anonymousID
        #expect(second != nil)
        #expect(second != first)
    }

    // MARK: - Dispatch

    @Test("A first launch says so; later launches do not")
    func firstLaunchIsReportedOnce() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.start()
        #expect(fixture.provider.names == ["app_first_launch", "app_launch"])

        let second = RecordingAnalyticsProvider()
        let reopened = SettingsStore(defaults: fixture.defaults, storageKey: "settings")
        AnalyticsManager(settingsStore: reopened, provider: second).start()
        #expect(second.names == ["app_launch"])
    }

    @Test("Quitting reports it and hands over whatever is queued")
    func quitFlushes() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.start()
        fixture.manager.stop()

        #expect(fixture.provider.names.last == "app_quit")
        #expect(fixture.provider.flushCount == 1)
    }

    @Test("Every event carries the build, the system and what is on the rope")
    func eventsCarryContext() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.start()
        fixture.manager.track(.charmAdded(.builtIn(.hamsa)))

        let event = try #require(fixture.provider.events.last)
        #expect(event.name == "charm_added")
        #expect(event.properties["charm"] == .string("hamsa"))
        #expect(event.properties["charm_count"] != nil)
        #expect(event.properties["active_charm_ids"] != nil)
        #expect(event.properties["rope_style"] != nil)

        #expect(fixture.provider.superProperties["app_version"] != nil)
        #expect(fixture.provider.superProperties["build_number"] != nil)
        #expect(fixture.provider.superProperties["macos_version"] != nil)
        #expect(fixture.provider.superProperties["analytics_enabled"] == .flag(true))
    }

    @Test("A charm someone made is never named")
    func importsAreAnonymous() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.start()
        let mine = CharmID.custom(UUID())
        fixture.manager.track(.charmSelected(mine))

        let event = try #require(fixture.provider.events.last)
        #expect(event.properties["charm"] == .string("custom"))

        // The identifier of the import appears nowhere in the event at all.
        let rendered = String(describing: event)
        #expect(!rendered.contains(mine.storageValue))
    }

    // MARK: - Consent

    @Test("Nothing is sent, and nothing is started, when sharing is off")
    func offMeansOff() throws {
        let fixture = try makeFixture(analyticsEnabled: false)
        defer { fixture.tearDown() }

        fixture.manager.start()
        fixture.manager.track(.charmSaved)
        fixture.manager.stop()

        #expect(fixture.provider.events.isEmpty)
        #expect(fixture.provider.startCount == 0)
        #expect(fixture.provider.distinctID == nil)
        // And no identifier was minted for an install that never sends.
        #expect(fixture.store.settings.privacy.anonymousID == nil)
    }

    @Test("Switching off stops capture at once, and tells the provider too")
    func offTakesEffectImmediately() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.start()
        let sentBefore = fixture.provider.events.count

        fixture.manager.setEnabled(false)
        fixture.manager.track(.charmSaved)
        fixture.manager.track(.charmImported)

        #expect(fixture.provider.events.count == sentBefore)
        #expect(fixture.provider.isEnabled == false)
    }

    @Test("The launch is counted whether or not anything is shared")
    func launchesAreCountedRegardless() throws {
        let fixture = try makeFixture(analyticsEnabled: false)
        defer { fixture.tearDown() }

        fixture.manager.start()

        // The follow card is scheduled off this number and has nothing to do with
        // analytics, so opting out must not stop it ever appearing.
        #expect(fixture.store.settings.milestones.launchCount == 1)
    }

    @Test("A build with no project token sends nowhere rather than sending badly")
    func noTokenMeansNoProvider() {
        #expect(PostHogProvider(token: "", host: "https://us.i.posthog.com") == nil)
        #expect(PostHogProvider(token: "$(HANGLY_ANALYTICS_TOKEN)", host: "https://us.i.posthog.com") == nil)
        #expect(PostHogProvider(token: "phc_example", host: "") == nil)
        #expect(PostHogProvider(token: "phc_example", host: "https://us.i.posthog.com") != nil)
    }
}
