//
//  CharmLibraryViewModel+Rope.swift
//  Hangly
//
//  Composing the rope, which the Library owns and nothing else does.
//

import Foundation

/// What hangs, in what order, and how big.
///
/// There is no count anywhere in here, and that is the point. A rope with two
/// charms on it is a rope where two places are filled; asking for "two charms" as a
/// number, and then separately asking which two, made people set a count and then
/// wonder why nothing had changed.
@MainActor
extension CharmLibraryViewModel {
    /// The places currently on the rope, from the anchor down.
    var ropeSlots: [RopeSlot] {
        let stack = charmManager.stack
        return stack.places.enumerated().map { index, place in
            RopeSlot(
                id: index,
                charm: place.charm,
                name: charmManager.charm(for: place.charm).displayName,
                size: place.size
            )
        }
    }

    /// Whether there is room to hang another.
    var canAddSlot: Bool {
        charmManager.stack.count < CharmStack.maximumCount
    }

    /// Whether the rope can spare one. The last charm stays: a bare rope is not
    /// something this app can draw, and removing the only charm would be a way to
    /// break the ornament from inside its own settings.
    var canRemoveSlot: Bool {
        charmManager.stack.count > 1
    }

    func isOnRope(_ id: CharmID) -> Bool {
        charmManager.isOnRope(id)
    }

    /// Which place is being dressed. The bottom one by default, because that is the
    /// charm every part of the app that predates places means by "the charm".
    var dressedSlot: Int {
        guard let activeSlot, activeSlot < charmManager.stack.count else {
            return charmManager.stack.count - 1
        }
        return activeSlot
    }

    // MARK: - Choosing

    /// A charm was clicked in the grid.
    ///
    /// One click changes the rope, as it always has: the overlay is the preview, and
    /// a Library that needed a second click to show you anything would be a form.
    /// What the click means depends only on whether a new place is waiting — filling
    /// that, or re-dressing the place already being worked on.
    func choose(_ id: CharmID) {
        selection = id
        if isAddingSlot, canAddSlot {
            charmManager.addToRope(id)
            isAddingSlot = false
            activeSlot = charmManager.stack.count - 1
        } else {
            charmManager.place(id, at: dressedSlot)
        }
    }

    /// A place on the rope was clicked: work on that one, and describe what is in it.
    func focus(slot: Int) {
        isAddingSlot = false
        activeSlot = slot
        if let charm = ropeSlots.first(where: { $0.slot == slot })?.charm {
            selection = charm
        }
    }

    /// The empty place was clicked. Nothing hangs there yet; the next charm chosen
    /// from the grid is what fills it.
    func beginAddingSlot() {
        guard canAddSlot else { return }
        isAddingSlot = true
        activeSlot = nil
    }

    func cancelAddingSlot() {
        isAddingSlot = false
        activeSlot = charmManager.stack.count - 1
    }

    /// Hangs the charm being described, for the button in the detail panel.
    func addSelectionToRope() {
        guard canAddSlot else { return }
        charmManager.addToRope(selection)
        isAddingSlot = false
        activeSlot = charmManager.stack.count - 1
    }

    // MARK: - Arranging

    func remove(slot: Int) {
        guard canRemoveSlot else { return }
        charmManager.removeFromRope(at: slot)
        activeSlot = min(dressedSlot, charmManager.stack.count - 1)
    }

    func move(from source: Int, to destination: Int) {
        charmManager.moveOnRope(from: source, to: destination)
        activeSlot = min(destination, charmManager.stack.count - 1)
    }

    /// How large one place is drawn. Touches that place and nothing else — not the
    /// rope's length, not the other charms, not the master size in Appearance.
    func size(at slot: Int) -> Double {
        charmManager.stack.size(at: slot)
    }

    func setSize(_ size: Double, at slot: Int) {
        charmManager.setSize(size, at: slot)
    }
}

/// The rope styles, which the Library owns in exactly the way it owns the charms.
@MainActor
extension CharmLibraryViewModel {
    var ropeItems: [RopeItem] {
        let query = searchText.searchFolded
        return RopeStyle.allCases
            .map(RopeItem.init)
            .filter { item in
                guard filter != .favorites || isFavoriteRope(item.id) else { return false }
                return query.isEmpty || item.searchText.contains(query)
            }
    }

    /// The cord currently on the rope.
    var currentRope: RopeStyle {
        charmManager.ropeStyle
    }

    func isFavoriteRope(_ style: RopeStyle) -> Bool {
        charmManager.isFavoriteRope(style)
    }

    func toggleFavoriteRope(_ style: RopeStyle) {
        charmManager.toggleFavoriteRope(style)
    }

    /// One click, like a charm: the rope changes mid-swing and keeps swinging.
    func chooseRope(_ style: RopeStyle) {
        selectedRope = style
        charmManager.setRopeStyle(style)
    }
}
