//
//  LibraryCompositionTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// The Library owns rope composition, and this is the behaviour that claim means.
///
/// The old arrangement had a count control in one window and charm pickers in
/// another, and the two could disagree. There is no count here at all: the tests
/// below never set one, and the number of charms is only ever read back as a
/// consequence of filling or emptying places.
@Suite("Library composition")
@MainActor
struct LibraryCompositionTests {
    private struct Fixture {
        let viewModel: CharmLibraryViewModel
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

    /// - Parameter charms: What the rope starts with. Stated by every test rather
    ///   than inherited from the shipped default, because what these tests are about
    ///   is what composing *does* — a suite that breaks when the app changes which
    ///   charms it ships with was testing the wrong thing.
    private func makeFixture(startingWith charms: [CharmID] = [.builtIn(.daruma)]) throws -> Fixture {
        let suiteName = "com.hangly.tests.\(UUID().uuidString)"
        let defaults = try #require(UserDefaults(suiteName: suiteName))
        let directory = try TestImages.temporaryDirectory()
        let store = SettingsStore(defaults: defaults, storageKey: "settings")
        store.update { $0.overlay.stack = CharmStack(charms) }
        let manager = CharmManager(
            settingsStore: store,
            customStore: CustomCharmStore(directory: directory)
        )
        let studio = CharmStudioWindowController(
            viewModel: CharmStudioViewModel(charmManager: manager, accessibility: AccessibilityPreferences())
        )
        let viewModel = CharmLibraryViewModel(
            library: .bundled(),
            charmManager: manager,
            importCoordinator: CharmImportCoordinator(charmManager: manager, dialogs: CharmDialogs(), studio: studio)
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

    @Test("A rope with one charm on it can be added to but not emptied")
    func aRopeIsNeverBare() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        #expect(fixture.viewModel.ropeSlots.count == 1)
        #expect(fixture.viewModel.canAddSlot)
        // The one charm on the rope cannot be taken off, because a bare rope is not
        // something the app can draw.
        #expect(fixture.viewModel.canRemoveSlot == false)
    }

    @Test("Every place on the rope is its own place, even holding the same charm")
    func placesAreDistinct() throws {
        let charm = CharmID.builtIn(.nazar)
        let fixture = try makeFixture(startingWith: [charm, charm, charm])
        defer { fixture.tearDown() }

        // The identity of a place is where it hangs. It was the charm hanging there,
        // which for the app's own shipped rope meant three identical identities in
        // one `ForEach` — and three size sliders that could not tell each other
        // apart. Nothing downstream can be right if this is not.
        let slots = fixture.viewModel.ropeSlots
        #expect(slots.map(\.id) == [0, 1, 2])
        #expect(Set(slots.map(\.id)).count == slots.count)
        #expect(slots.allSatisfy { $0.charm == charm })
    }

    @Test("Three places holding one charm are sized one at a time")
    func sizingThreeOfTheSameCharm() throws {
        let charm = CharmID.builtIn(.nazar)
        let fixture = try makeFixture(startingWith: [charm, charm, charm])
        defer { fixture.tearDown() }

        fixture.viewModel.setSize(1.4, at: 0)
        #expect(fixture.viewModel.ropeSlots.map(\.size) == [1.4, 1, 1])

        fixture.viewModel.setSize(0.7, at: 1)
        #expect(fixture.viewModel.ropeSlots.map(\.size) == [1.4, 0.7, 1])

        fixture.viewModel.setSize(1.2, at: 2)
        #expect(fixture.viewModel.ropeSlots.map(\.size) == [1.4, 0.7, 1.2])

        // And moving one back leaves the other two where they were.
        fixture.viewModel.setSize(1, at: 1)
        #expect(fixture.viewModel.ropeSlots.map(\.size) == [1.4, 1, 1.2])
    }

    @Test("Sizing a place changes neither the rope nor the master size")
    func sizingTouchesNothingElse() throws {
        let charm = CharmID.builtIn(.nazar)
        let fixture = try makeFixture(startingWith: [charm, charm, charm])
        defer { fixture.tearDown() }

        let before = fixture.store.settings.overlay
        fixture.viewModel.setSize(1.6, at: 1)
        let after = fixture.store.settings.overlay

        #expect(after.ropeLength == before.ropeLength)
        #expect(after.charmSize == before.charmSize)
        #expect(after.stack.charms == before.stack.charms)
        #expect(after.anchor == before.anchor)
    }

    @Test("A first run hangs the rope the app ships with")
    func shippedRope() {
        let shipped = OverlaySettings()

        // Stated in one place so that changing what ships is a deliberate edit to a
        // test that says what ships, rather than something noticed later on somebody
        // else's machine.
        #expect(shipped.stack.charms == [.builtIn(.nazar)])
        #expect(shipped.stack.sizes == [1])
        #expect(shipped.ropeStyle == .thread)
        #expect(shipped.anchor == .topTrailing)
        #expect(shipped.charmSize == 0.96)
        #expect(shipped.ropeLength == 0.78)
        #expect(shipped.opacity == 1)
        #expect(shipped.horizontalOffset == 192)
        #expect(shipped.verticalOffset == -12)
        #expect(shipped.isEnabled)

        // The places not in use start as copies, so growing the rope gives more of
        // what is already on it.
        #expect(shipped.stack.storedSlots.map(\.charm) == Array(repeating: .builtIn(.nazar), count: 3))
    }

    @Test("Adding a place and choosing a charm fills it, and the count follows")
    func addingAPlace() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.beginAddingSlot()
        #expect(fixture.viewModel.isAddingSlot)
        // Nothing has changed on the rope yet: an empty place is a thing in the
        // interface, not a thing in the stack.
        #expect(fixture.viewModel.ropeSlots.count == 1)

        fixture.viewModel.choose(.builtIn(.hamsa))
        #expect(fixture.viewModel.isAddingSlot == false)
        #expect(fixture.viewModel.ropeSlots.map(\.charm).last == .builtIn(.hamsa))
        #expect(fixture.viewModel.ropeSlots.count == 2)

        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.scarab))
        #expect(fixture.viewModel.ropeSlots.count == 3)
        #expect(fixture.viewModel.canAddSlot == false)
    }

    @Test("Choosing a charm dresses the place being worked on, not always the last")
    func choosingDressesTheActivePlace() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.hamsa))
        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.scarab))

        fixture.viewModel.focus(slot: 1)
        fixture.viewModel.choose(.builtIn(.horseshoe))

        #expect(fixture.viewModel.ropeSlots.map(\.charm) == [
            .builtIn(.daruma), .builtIn(.horseshoe), .builtIn(.scarab)
        ])
        // Still three: dressing a place is not adding one.
        #expect(fixture.viewModel.ropeSlots.count == 3)
    }

    @Test("A place keeps its size when the charm in it is swapped")
    func swappingPreservesTheComposition() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.hamsa))

        fixture.viewModel.setSize(1.4, at: 0)
        fixture.viewModel.setSize(0.7, at: 1)

        fixture.viewModel.focus(slot: 0)
        fixture.viewModel.choose(.builtIn(.nazar))

        #expect(fixture.viewModel.ropeSlots.map(\.charm) == [.builtIn(.nazar), .builtIn(.hamsa)])
        #expect(fixture.viewModel.ropeSlots.map(\.size) == [1.4, 0.7])
    }

    @Test("Sizing one place leaves every other place alone")
    func sizingIsLocal() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.hamsa))
        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.scarab))

        fixture.viewModel.setSize(1.5, at: 1)

        #expect(fixture.viewModel.ropeSlots.map(\.size) == [1, 1.5, 1])
        // And it is not the master size, which lives in Appearance and is untouched.
        #expect(fixture.viewModel.ropeSlots.map(\.charm).count == 3)
    }

    @Test("Reordering moves a place and its size together")
    func reorderingCarriesTheSize() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.hamsa))
        fixture.viewModel.setSize(1.3, at: 0)

        fixture.viewModel.move(from: 0, to: 1)

        #expect(fixture.viewModel.ropeSlots.map(\.charm) == [.builtIn(.hamsa), .builtIn(.daruma)])
        #expect(fixture.viewModel.ropeSlots.map(\.size) == [1, 1.3])
    }

    @Test("Removing a place empties it and nothing else")
    func removing() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.hamsa))
        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.scarab))

        fixture.viewModel.remove(slot: 1)
        #expect(fixture.viewModel.ropeSlots.map(\.charm) == [.builtIn(.daruma), .builtIn(.scarab)])

        fixture.viewModel.remove(slot: 0)
        #expect(fixture.viewModel.ropeSlots.map(\.charm) == [.builtIn(.scarab)])

        // And then it stops, rather than leaving the rope bare.
        fixture.viewModel.remove(slot: 0)
        #expect(fixture.viewModel.ropeSlots.count == 1)
    }

    @Test("Reading about a charm is not the same as hanging it")
    func selectionAndRopeAreSeparate() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.selection = .builtIn(.himmeli)

        #expect(fixture.viewModel.selectedItem?.name == "Himmeli")
        #expect(fixture.viewModel.isOnRope(.builtIn(.himmeli)) == false)
        #expect(fixture.viewModel.ropeSlots.map(\.charm) == [.builtIn(.daruma)])

        fixture.viewModel.addSelectionToRope()
        #expect(fixture.viewModel.isOnRope(.builtIn(.himmeli)))
    }

    @Test("The composition survives a relaunch")
    func compositionPersists() throws {
        let fixture = try makeFixture()
        defer { fixture.tearDown() }

        fixture.viewModel.beginAddingSlot()
        fixture.viewModel.choose(.builtIn(.hamsa))
        fixture.viewModel.setSize(1.45, at: 0)
        fixture.viewModel.setSize(0.65, at: 1)

        let reloaded = SettingsStore(defaults: fixture.defaults, storageKey: "settings")
        let stack = reloaded.settings.overlay.stack
        #expect(stack.charms == [.builtIn(.daruma), .builtIn(.hamsa)])
        #expect(stack.sizes == [1.45, 0.65])
    }
}
