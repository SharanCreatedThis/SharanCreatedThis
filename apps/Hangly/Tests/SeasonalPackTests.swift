//
//  SeasonalPackTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// The packs, when they come round, and what they do to the rope when they do.
@Suite("Seasonal packs")
@MainActor
struct SeasonalPackTests {
    private func makeStore() -> SettingsStore {
        SettingsStore(
            defaults: UserDefaults(suiteName: "com.hangly.seasonal.tests.\(UUID().uuidString)") ?? .standard,
            storageKey: "com.hangly.tests.\(UUID().uuidString)"
        )
    }

    private func date(_ month: Int, _ day: Int) -> Date {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC") ?? .current
        return calendar.date(from: DateComponents(year: 2026, month: month, day: day, hour: 12)) ?? Date()
    }

    private func makeCoordinator(_ store: SettingsStore, on day: Date) -> SeasonalCoordinator {
        SeasonalCoordinator(settingsStore: store, now: { day })
    }

    // MARK: - The charms themselves

    @Test("Every pack's charms exist, are unique to it, and carry artwork")
    func packsAreWellFormed() {
        var seen: Set<CharmKind> = []
        for pack in SeasonalPack.allCases {
            #expect(!pack.charms.isEmpty)
            #expect(!pack.displayName.isEmpty)
            for kind in pack.charms {
                #expect(seen.insert(kind).inserted, "\(kind) is in two packs")
                #expect(SeasonalPack.containing(kind) == pack)
                // Same catalogue, same rules: a seasonal charm is a charm.
                #expect(CollectionCharmCatalog.entry(for: kind) != nil, "\(kind) is not in the catalogue")
            }
        }
        #expect(seen.count == 11)
    }

    @Test("The hand-drawn collection belongs to no season")
    func collectionCharmsAreNotSeasonal() {
        for kind in [CharmKind.nazar, .daruma, .himmeli, .circle, .star] {
            #expect(SeasonalPack.containing(kind) == nil)
        }
    }

    // MARK: - The calendar

    @Test("Each season claims its own days, and no day is claimed twice")
    func seasonsDoNotOverlap() {
        let diwali = SeasonalPack.defaultDiwaliWindow

        #expect(SeasonalPack.active(on: date(10, 1), diwali: diwali) == .halloween)
        #expect(SeasonalPack.active(on: date(10, 31), diwali: diwali) == .halloween)
        #expect(SeasonalPack.active(on: date(11, 7), diwali: diwali) == .diwali)
        #expect(SeasonalPack.active(on: date(12, 1), diwali: diwali) == .christmas)
        #expect(SeasonalPack.active(on: date(12, 25), diwali: diwali) == .christmas)
        // Boxing Day is the last of Christmas; New Year takes the next morning.
        #expect(SeasonalPack.active(on: date(12, 26), diwali: diwali) == .christmas)
        #expect(SeasonalPack.active(on: date(12, 27), diwali: diwali) == .newYear)
        #expect(SeasonalPack.active(on: date(1, 6), diwali: diwali) == .newYear)

        // And most of the year belongs to nobody.
        for month in [2, 3, 4, 5, 6, 7, 8, 9] {
            #expect(SeasonalPack.active(on: date(month, 15), diwali: diwali) == nil, "month \(month)")
        }
        #expect(SeasonalPack.active(on: date(1, 20), diwali: diwali) == nil)
    }

    @Test("A window that runs past New Year's Eve wraps rather than emptying")
    func windowsWrapAroundTheYear() {
        let window = SeasonWindow(MonthDay(12, 27), MonthDay(1, 6))

        #expect(window.contains(MonthDay(12, 31)))
        #expect(window.contains(MonthDay(1, 1)))
        #expect(window.contains(MonthDay(1, 6)))
        #expect(!window.contains(MonthDay(1, 7)))
        #expect(!window.contains(MonthDay(12, 26)))
        #expect(!window.contains(MonthDay(7, 1)))
    }

    @Test("Diwali is where the user says it is, and outranks a fixed window")
    func diwaliIsConfigurable() {
        // It moves with the lunar calendar, so a year where it lands in late October
        // has to be expressible — and has to win, because it was set by hand.
        let october = SeasonWindow(MonthDay(10, 20), MonthDay(10, 26))
        #expect(SeasonalPack.active(on: date(10, 22), diwali: october) == .diwali)
        #expect(SeasonalPack.active(on: date(10, 28), diwali: october) == .halloween)
    }

    // MARK: - Dressing the rope

    @Test("A season dresses the rope and gives it back afterwards")
    func seasonsDressAndUndress() {
        let store = makeStore()
        store.update { $0.overlay.stack = CharmStack([.builtIn(.nazar), .builtIn(.daruma)]) }
        let chosen = store.settings.overlay.stack.charms

        makeCoordinator(store, on: date(10, 5)).refresh()
        #expect(store.settings.overlay.stack.charms == SeasonalPack.halloween.charms.map(CharmID.builtIn))
        #expect(store.settings.seasonal.dressedAs == .halloween)

        // November: the season is over, and the rope is exactly as it was found.
        makeCoordinator(store, on: date(11, 20)).refresh()
        #expect(store.settings.overlay.stack.charms == chosen)
        #expect(store.settings.seasonal.dressedAs == nil)
        #expect(store.settings.seasonal.restore == nil)
    }

    @Test("One season handing over to the next does not lose what came before")
    func handoverKeepsTheOriginal() {
        let store = makeStore()
        store.update { $0.overlay.stack = CharmStack(.builtIn(.scarab)) }

        makeCoordinator(store, on: date(12, 10)).refresh()
        #expect(store.settings.seasonal.dressedAs == .christmas)

        // Christmas gives way to New Year, and must not record the Christmas charms
        // as the thing to put back in January.
        makeCoordinator(store, on: date(12, 30)).refresh()
        #expect(store.settings.seasonal.dressedAs == .newYear)
        #expect(store.settings.seasonal.restore == [.builtIn(.scarab)])

        makeCoordinator(store, on: date(2, 1)).refresh()
        #expect(store.settings.overlay.stack.charms == [.builtIn(.scarab)])
    }

    @Test("A charm chosen by hand ends the season's claim on the rope")
    func manualChoiceWins() {
        let store = makeStore()
        store.update { $0.overlay.stack = CharmStack(.builtIn(.nazar)) }
        let coordinator = makeCoordinator(store, on: date(10, 5))
        coordinator.refresh()
        #expect(coordinator.isDressed)

        // The user picks something themselves mid-season.
        store.update { $0.overlay.stack = CharmStack(.builtIn(.himmeli)) }
        coordinator.noteManualChoice()
        #expect(!coordinator.isDressed)

        // Which must survive both the rest of the season and the end of it.
        coordinator.refresh()
        #expect(store.settings.overlay.stack.charms == [.builtIn(.himmeli)])
        makeCoordinator(store, on: date(11, 20)).refresh()
        #expect(store.settings.overlay.stack.charms == [.builtIn(.himmeli)])
    }

    @Test("With automatic off, the calendar is ignored entirely")
    func automaticCanBeTurnedOff() {
        let store = makeStore()
        store.update {
            $0.seasonal.isAutomatic = false
            $0.overlay.stack = CharmStack(.builtIn(.nazar))
        }

        let coordinator = makeCoordinator(store, on: date(10, 5))
        #expect(coordinator.activePack == nil)
        coordinator.refresh()
        #expect(store.settings.overlay.stack.charms == [.builtIn(.nazar)])
    }

    @Test("A pack chosen by hand is worn out of season, and given back when unpinned")
    func pinningOverridesTheCalendar() {
        let store = makeStore()
        store.update { $0.overlay.stack = CharmStack(.builtIn(.daruma)) }

        store.update { $0.seasonal.pinned = .diwali }
        let july = makeCoordinator(store, on: date(7, 4))
        #expect(july.activePack == .diwali)
        july.refresh()
        #expect(store.settings.overlay.stack.charms == SeasonalPack.diwali.charms.map(CharmID.builtIn))

        store.update { $0.seasonal.pinned = nil }
        makeCoordinator(store, on: date(7, 4)).refresh()
        #expect(store.settings.overlay.stack.charms == [.builtIn(.daruma)])
    }

    @Test("Refreshing twice in one season changes nothing the second time")
    func refreshIsIdempotent() {
        let store = makeStore()
        store.update { $0.overlay.stack = CharmStack(.builtIn(.nazar)) }
        let coordinator = makeCoordinator(store, on: date(12, 5))

        coordinator.refresh()
        let dressed = store.settings.overlay.stack.charms
        coordinator.refresh()
        coordinator.refresh()

        #expect(store.settings.overlay.stack.charms == dressed)
        #expect(store.settings.seasonal.restore == [.builtIn(.nazar)])
    }

    // MARK: - Persistence

    @Test("Seasonal settings round-trip, including what is owed back")
    func settingsPersist() throws {
        var settings = AppSettings()
        settings.seasonal = SeasonalSettings(
            isAutomatic: false,
            pinned: .christmas,
            diwaliWindow: SeasonWindow(MonthDay(10, 20), MonthDay(10, 26)),
            restore: [.builtIn(.nazar), .builtIn(.daruma)],
            dressedAs: .christmas
        )
        let restored = try JSONDecoder().decode(AppSettings.self, from: JSONEncoder().encode(settings))

        #expect(restored.seasonal == settings.seasonal)
        // What is owed back has to survive a relaunch, or automatic dressing becomes
        // a feature that quietly eats the charm you chose.
        #expect(restored.seasonal.restore == [.builtIn(.nazar), .builtIn(.daruma)])
    }

    @Test("Settings from every earlier build still open, and default to dressing up")
    func olderSettingsMigrate() throws {
        #expect(AppSettings().seasonal.isAutomatic)
        #expect(AppSettings().seasonal.pinned == nil)
        #expect(AppSettings().seasonal.diwaliWindow == SeasonalPack.defaultDiwaliWindow)

        // A document from before any of this, and one from a build with weather but
        // no seasons: both open, keep what they said, and take the defaults here.
        for json in [
            #"{"schemaVersion":1,"soundVolume":0.2}"#,
            #"{"schemaVersion":1,"weather":{"isEnabled":true},"soundVolume":0.3}"#
        ] {
            let settings = try JSONDecoder().decode(AppSettings.self, from: Data(json.utf8))
            #expect(settings.seasonal == SeasonalSettings())
        }

        // And a pack this build cannot read follows the calendar rather than
        // discarding the rest of the document.
        let newer = #"{"seasonal":{"isAutomatic":false,"pinned":"midsummer"}}"#
        let settings = try JSONDecoder().decode(AppSettings.self, from: Data(newer.utf8))
        #expect(settings.seasonal.pinned == nil)
        #expect(!settings.seasonal.isAutomatic)
    }

    // MARK: - The Library

    @Test("Every seasonal charm is in the Library, searchable and favouritable")
    func libraryCarriesTheSeasonalCharms() throws {
        let library = CharmLibrary.bundled()
        let byID = Dictionary(uniqueKeysWithValues: library.entries.map { ($0.id, $0) })

        for pack in SeasonalPack.allCases {
            for kind in pack.charms {
                let entry = try #require(byID[kind.rawValue], "\(kind) is missing from the Library")
                #expect(entry.name == kind.displayName, "\(kind) is named differently in the Library")
                #expect(!entry.description.isEmpty)
                #expect(!entry.tags.isEmpty, "\(kind) has nothing to search for")
                #expect(entry.category == "seasonal")
            }
        }

        // Searchable by the name of the season as well as the charm.
        let tags = Set(library.entries.flatMap(\.tags).map { $0.lowercased() })
        for term in ["halloween", "diwali", "christmas", "new year"] {
            #expect(tags.contains(term), "nothing is findable by \(term)")
        }
    }
}
