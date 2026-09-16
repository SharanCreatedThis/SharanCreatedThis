//
//  CharmManager.swift
//  Hangly
//
//  The charm registry and the current selection.
//

import Foundation
import Observation
import OSLog

/// What the menu needs to list a charm: no geometry, no bitmap.
struct CharmMenuItem: Identifiable, Hashable, Sendable {
    let id: CharmID
    let name: String
    let symbolName: String
}

/// Owns which charm is on the rope and the set it can be chosen from.
///
/// The set is the built-ins followed by every import, and it changes at runtime:
/// an import appends, a deletion removes, and because the store is observable the
/// menu follows without being told. The selection lives in `SettingsStore`, so it
/// persists and survives a relaunch. Switching is live either way: the overlay
/// notices on its next frame and cross-fades, with nothing to restart.
@MainActor
@Observable
final class CharmManager {
    /// Set for the duration of an import, so the overlay can show progress and a
    /// second import is refused rather than raced.
    private(set) var isImporting = false

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let customStore: CustomCharmStore

    /// Optional so that every test that builds a manager does not also have to
    /// decide what it thinks about analytics.
    @ObservationIgnored private let analytics: AnalyticsManager?

    init(settingsStore: SettingsStore, customStore: CustomCharmStore, analytics: AnalyticsManager? = nil) {
        self.settingsStore = settingsStore
        self.customStore = customStore
        self.analytics = analytics
        reconcile()
    }

    /// A settings document can outlive the charms it names: the store pruned one,
    /// or its folder was cleared by hand. Rather than leave the rope quietly on a
    /// fallback while the document still points at a ghost, move the selection and
    /// drop the star, once, at launch.
    private func reconcile() {
        let settings = settingsStore.settings
        let ghosts = settings.favoriteCharms.filter { id in
            if case .custom(let uuid) = id { return customStore.entry(for: uuid) == nil }
            return false
        }
        // Any place on the rope can be holding a ghost, not just the end of it.
        let hauntedSlots = settings.overlay.stack.charms.filter { id in
            if case .custom(let uuid) = id { return customStore.entry(for: uuid) == nil }
            return false
        }
        guard !hauntedSlots.isEmpty || !ghosts.isEmpty else { return }

        settingsStore.update { settings in
            settings.favoriteCharms.subtract(ghosts)
            for ghost in hauntedSlots {
                settings.overlay.stack.replace(ghost, with: .builtIn(.circle))
            }
        }
        let detail = hauntedSlots.isEmpty ? "" : ", \(hauntedSlots.count) charm(s) replaced"
        Logger.overlay.warning("Reconciled settings: \(ghosts.count) missing favourite(s)\(detail, privacy: .public).")
    }

    // MARK: - Selection

    /// The selected charm's identity. Setting it persists immediately.
    var selection: CharmID {
        get { settingsStore.settings.overlay.charm }
        set {
            guard newValue != settingsStore.settings.overlay.charm else { return }
            settingsStore.update { $0.overlay.charm = newValue }
            analytics?.track(.charmSelected(newValue))
            Logger.overlay.diagnostic("Charm changed to \(newValue.storageValue).")
        }
    }

    /// The charm currently on the rope.
    var current: any Charm {
        charm(for: selection)
    }

    /// Only imports can be deleted; the built-ins are permanent.
    var canDeleteCurrent: Bool {
        selection.isCustom
    }

    // MARK: - The rope

    /// What hangs on the rope, from the anchor down.
    var stack: CharmStack {
        settingsStore.settings.overlay.stack
    }

    func isOnRope(_ id: CharmID) -> Bool {
        stack.contains(id)
    }

    /// Puts a charm in one place on the rope.
    ///
    /// The place keeps the size it was given: dressing the middle of three in
    /// something else is a change of charm, not a change of composition.
    func place(_ id: CharmID, at slot: Int) {
        guard stack[slot] != id else { return }
        settingsStore.update { $0.overlay.stack[slot] = id }
        analytics?.track(.charmSelected(id))
        noteCollectionCharm(id)
        Logger.overlay.diagnostic("Slot \(slot) changed to \(id.storageValue).")
    }

    /// Hangs another charm below the ones already there, up to three.
    func addToRope(_ id: CharmID) {
        settingsStore.update { $0.overlay.stack.add(id) }
        analytics?.track(.charmAdded(id))
        analytics?.track(.ropeCountChanged(to: stack.count))
        noteCollectionCharm(id)
    }

    // MARK: - Collections

    /// A collection was opened in the Library.
    func noteCollectionOpened(_ collection: CharmCollection) {
        analytics?.track(.collectionOpened(collection))
    }

    /// A charm went on the rope: if it came from a collection, say so, and offer
    /// that collection's cord.
    ///
    /// Called from both places a charm can reach the rope, so the two cannot
    /// disagree about what counts as choosing one.
    private func noteCollectionCharm(_ id: CharmID) {
        guard case .builtIn(let kind) = id,
              let collection = CharmCollection.containing(kind) else { return }
        analytics?.track(.collectionCharmSelected(collection, charm: kind))
        adoptRope(of: collection)
    }

    /// Puts the collection's own cord on, but only over the one the app shipped.
    ///
    /// The rule is narrow on purpose. Somebody who has never touched the rope has no
    /// opinion about it, and a Spider-Man on white silk is the better first sight of
    /// the collection. Somebody who *has* chosen a cord has said what they want, and
    /// a charm is not an argument against it — so anything other than the shipped
    /// default is left exactly alone, including a cord this same rule put there.
    private func adoptRope(of collection: CharmCollection) {
        guard ropeStyle == .shipped, collection.defaultRope != .shipped else { return }
        setRopeStyle(collection.defaultRope)
        Logger.overlay.diagnostic("Adopted \(collection.defaultRope.rawValue) for \(collection.rawValue).")
    }

    func removeFromRope(at slot: Int) {
        let removed = stack.charms.indices.contains(slot) ? stack.charms[slot] : nil
        settingsStore.update { $0.overlay.stack.remove(at: slot) }
        if let removed {
            analytics?.track(.charmRemoved(removed))
        }
        analytics?.track(.ropeCountChanged(to: stack.count))
    }

    func moveOnRope(from source: Int, to destination: Int) {
        settingsStore.update { $0.overlay.stack.move(from: source, to: destination) }
        analytics?.track(.charmReordered(from: source, to: destination))
    }

    func setSize(_ size: Double, at slot: Int) {
        settingsStore.update { $0.overlay.stack.setSize(size, at: slot) }
    }

    // MARK: - The rope's cord

    var ropeStyle: RopeStyle {
        settingsStore.settings.overlay.ropeStyle
    }

    /// Changes the cord. Applied mid-swing by the solver, so nothing stops.
    func setRopeStyle(_ style: RopeStyle) {
        guard style != ropeStyle else { return }
        settingsStore.update { $0.overlay.ropeStyle = style }
        analytics?.track(.ropeStyleChanged(to: style))
        Logger.overlay.diagnostic("Rope changed to \(style.rawValue).")
    }

    func isFavoriteRope(_ style: RopeStyle) -> Bool {
        settingsStore.settings.favoriteRopes.contains(style)
    }

    func toggleFavoriteRope(_ style: RopeStyle) {
        settingsStore.update { settings in
            if settings.favoriteRopes.contains(style) {
                settings.favoriteRopes.remove(style)
            } else {
                settings.favoriteRopes.insert(style)
            }
        }
    }

    // MARK: - Registry

    /// Built-ins first, then imports oldest to newest.
    var menuItems: [CharmMenuItem] {
        let builtIns = BuiltInCharms.all.map {
            CharmMenuItem(id: $0.id, name: $0.displayName, symbolName: $0.symbolName)
        }
        let customs = customStore.entries.map {
            CharmMenuItem(id: .custom($0.id), name: $0.name, symbolName: "photo.fill")
        }
        return builtIns + customs
    }

    var customEntries: [CustomCharmEntry] {
        customStore.entries
    }

    func customEntry(for id: UUID) -> CustomCharmEntry? {
        customStore.entry(for: id)
    }

    /// Resolves any identity to a charm. An import that has been deleted or whose
    /// file has gone falls back to the circle rather than to nothing.
    func charm(for id: CharmID) -> any Charm {
        switch id {
        case .builtIn(let kind):
            return BuiltInCharms.charm(for: kind)
        case .custom(let uuid):
            return customStore.charm(for: uuid) ?? CircleCharm()
        }
    }

    // MARK: - Import and delete

    /// Processes the file off the main actor, stores the result and selects it.
    /// The quick path; the Studio produces the same `ProcessedCharmImage` with the
    /// user watching, then calls `saveImport`.
    func importImage(at url: URL, name: String) async throws {
        guard !isImporting else { return }
        isImporting = true
        defer { isImporting = false }

        let processed = try await CharmImageProcessor.process(fileAt: url)
        // The file is not named, sized or described — only that one arrived.
        analytics?.track(.charmImported)
        try saveImport(processed, name: name, select: true)
    }

    /// Stores a processed image as a charm.
    /// - Parameter select: Whether to put it on the rope straight away.
    @discardableResult
    func saveImport(_ processed: ProcessedCharmImage, name: String, select: Bool) throws -> CustomCharmEntry {
        let entry = try customStore.add(processed, name: name)
        analytics?.track(.charmSaved)
        if select {
            selection = .custom(entry.id)
        }
        return entry
    }

    /// Removes an import. Wherever it was hanging, the circle takes its place — in
    /// every place at once if the same import was on the rope more than once.
    func deleteCharm(id: UUID) throws {
        try customStore.remove(id: id)
        settingsStore.update { settings in
            settings.favoriteCharms.remove(.custom(id))
            settings.overlay.stack.replace(.custom(id), with: .builtIn(.circle))
        }
    }

    // MARK: - Favourites

    func isFavorite(_ id: CharmID) -> Bool {
        settingsStore.settings.favoriteCharms.contains(id)
    }

    func toggleFavorite(_ id: CharmID) {
        settingsStore.update { settings in
            if settings.favoriteCharms.contains(id) {
                settings.favoriteCharms.remove(id)
            } else {
                settings.favoriteCharms.insert(id)
            }
        }
    }

    var favoriteCount: Int {
        settingsStore.settings.favoriteCharms.count
    }
}
