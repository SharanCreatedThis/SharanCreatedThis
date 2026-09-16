//
//  AboutPageTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// What the About page counts, and the one true thing it knows about a charm.
///
/// The page itself is a layout and is not worth a test; the numbers on it are
/// persisted state and the fact is a lookup, and both of those can be wrong.
@Suite("About page")
@MainActor
struct AboutPageTests {
    /// Never registers anything. The About page has no business with login items,
    /// but the view model is built with one.
    private final class StubLoginItems: LaunchAtLoginManaging {
        var isEnabled = false
        func setEnabled(_ enabled: Bool) throws { isEnabled = enabled }
    }

    private struct Fixture {
        let viewModel: SettingsViewModel
        let manager: CharmManager
        let store: SettingsStore
        let defaults: UserDefaults
        let suiteName: String
        let directory: URL

        func tearDown() {
            defaults.removePersistentDomain(forName: suiteName)
            try? FileManager.default.removeItem(at: directory)
        }
    }

    private func makeFixture() throws -> Fixture {
        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        let directory = try TestImages.temporaryDirectory()
        let store = SettingsStore(defaults: defaults, storageKey: "settings")
        let manager = CharmManager(
            settingsStore: store,
            customStore: CustomCharmStore(directory: directory)
        )
        let viewModel = SettingsViewModel(
            settingsStore: store,
            launchAtLogin: StubLoginItems(),
            charmManager: manager,
            weather: WeatherService(settingsStore: store),
            library: .bundled()
        )
        return Fixture(
            viewModel: viewModel,
            manager: manager,
            store: store,
            defaults: defaults,
            suiteName: suiteName,
            directory: directory
        )
    }

    @Test("The counters are the stored ones, and they persist")
    func counters() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        #expect(fixture.viewModel.secretsFound == 0)
        #expect(fixture.viewModel.charmPushes == 0)

        // Each ask reports which one it is, because the creator notes are due on
        // exact counts and the page has to know it has reached one.
        #expect(fixture.viewModel.recordSecretFound() == 1)
        #expect(fixture.viewModel.recordSecretFound() == 2)
        fixture.viewModel.recordCharmPush()
        fixture.viewModel.recordCharmPush()
        fixture.viewModel.recordCharmPush()

        #expect(fixture.viewModel.secretsFound == 2)
        #expect(fixture.viewModel.charmPushes == 3)

        // Written through, not held in the page: closing the window must not
        // forget them.
        #expect(fixture.store.settings.milestones.secretsFound == 2)
        #expect(fixture.store.settings.milestones.charmPushes == 3)
    }

    @Test("Launches and the size of the collection are read straight through")
    func collection() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.store.update { $0.milestones.launchCount = 12 }
        #expect(fixture.viewModel.launchCount == 12)

        // Every built-in, and every import, with nothing counted twice.
        #expect(fixture.viewModel.charmCount == fixture.manager.menuItems.count)
        #expect(fixture.viewModel.charmCount >= CharmKind.allCases.count)
    }

    @Test("Pushing a built-in charm has something true to say about it")
    func factForABuiltIn() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.manager.selection = .builtIn(.nazar)
        let fact = try #require(fixture.viewModel.currentCharmFact)

        // The same words the Library shows, because they are written once.
        let entry = try #require(CharmLibrary.bundled().entry(for: .nazar))
        #expect(fact.contains(entry.name))
        #expect(fact.contains(entry.region))
        #expect(fact.contains(entry.description))
    }

    @Test("An imported charm has no fact, because it is not ours to tell")
    func noFactForAnImport() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        let image = try #require(TestImages.discOnClear(side: 32))
        let processed = ProcessedCharmImage(
            pngData: try CharmImageProcessor.encodePNG(image),
            pixelSide: 32,
            metrics: CharmMetrics(mass: 3, radiusRatio: 0.12, knotInset: 0.9),
            palette: .derived(from: CharmColor(0.9, 0.2, 0.2))
        )
        let entry = try fixture.manager.saveImport(processed, name: "Mine", select: true)
        #expect(fixture.manager.selection == .custom(entry.id))
        #expect(fixture.viewModel.currentCharmFact == nil)
    }
}
