//
//  CharmLibraryViewModel.swift
//  Hangly
//
//  Presentation state for the Library page.
//

import Foundation
import Observation

/// One row of the Library: a built-in from the metadata document, or an import.
struct CharmLibraryItem: Identifiable, Hashable, Sendable {
    let id: CharmID
    let name: String
    let region: String
    let description: String
    let tags: [String]
    let categoryID: String

    var isCustom: Bool { id.isCustom }

    /// The words search looks through, folded once so filtering is cheap.
    var searchText: String {
        ([name, region, description] + tags).joined(separator: " ").searchFolded
    }
}

/// One place on the rope, as the Library draws it.
///
/// Identified by *where it hangs*, not by what is hanging there. Two places can
/// hold the same charm — three of them routinely do — and when they did, the row
/// was a `ForEach` over three identical identities. SwiftUI cannot tell such views
/// apart, so the per-place size sliders shared and swapped their state: dragging
/// one moved another, or snapped back.
struct RopeSlot: Identifiable, Sendable {
    /// Position on the rope, from the anchor down.
    let id: Int

    /// What is hanging here.
    let charm: CharmID

    let name: String
    let size: Double

    /// The same number as ``id``, read where "which place" is the question being
    /// asked rather than "which view".
    var slot: Int { id }
}

/// Backs the Library page.
///
/// The Library is the only place rope composition happens. It owns which charms
/// hang, in what order, and how large each is — there is no count control anywhere,
/// because the number of charms is a consequence of how many places are filled and
/// never a thing to be set on its own.
///
/// Built-ins come from `CharmLibrary`; imports come from the charm manager and are
/// given a synthetic "Yours" category. Search folds case and diacritics so
/// "pancha" finds "Pánchángjié".
@MainActor
@Observable
final class CharmLibraryViewModel {
    /// The chips across the top. There is no second sidebar: a category is a filter,
    /// and a filter is one tap that leaves the charms where they are.
    enum Filter: Hashable {
        case all
        case favorites
        case category(String)

        /// One of the four themed sets. Separate from ``category`` even though the
        /// Library document gives those charms a category of the same name: a
        /// collection is also a hero card and a default cord, and neither of those
        /// is anything a category does.
        case collection(CharmCollection)

        case yours
    }

    /// Identifier used for imports.
    static let yoursCategoryID = "yours"

    var searchText = ""
    var filter: Filter = .all

    /// Which shelf is open. Search and the chips apply to whichever it is.
    var collection: LibraryCollection = .charms

    /// The rope the detail panel is describing, which like a charm need not be the
    /// one currently hanging.
    var selectedRope: RopeStyle

    /// What the detail panel is describing. Not the same as what is on the rope:
    /// you can read about a charm without hanging it.
    var selection: CharmID

    /// The place on the rope the grid is dressing. Nil while a new place is being
    /// added and has nothing in it yet.
    var activeSlot: Int?

    /// Whether the strip is showing an empty place waiting for a charm.
    var isAddingSlot = false

    @ObservationIgnored private let library: CharmLibrary
    @ObservationIgnored let charmManager: CharmManager
    @ObservationIgnored private let importCoordinator: CharmImportCoordinator

    /// How many imports there were last time this was asked; see
    /// ``adoptNewImports()``.
    @ObservationIgnored private var knownImportCount: Int

    init(library: CharmLibrary, charmManager: CharmManager, importCoordinator: CharmImportCoordinator) {
        self.library = library
        self.charmManager = charmManager
        self.importCoordinator = importCoordinator
        self.selection = charmManager.selection
        self.selectedRope = charmManager.ropeStyle
        self.activeSlot = charmManager.stack.count - 1
        self.knownImportCount = charmManager.customEntries.count
    }

    // MARK: - Catalogue

    /// The categories that get a chip of their own.
    ///
    /// Not every category in the document. The four collections have one each in
    /// there so that their charms are categorised like everything else, but they are
    /// offered as collection chips instead — a chip *and* a hero card for the same
    /// set would be the same tap in two places.
    var categories: [CharmCategory] {
        let collections = Set(CharmCollection.allCases.map(\.rawValue))
        return library.categories.filter { !collections.contains($0.id) }
    }

    /// The four collections, in the order they are offered.
    ///
    /// Not `collections`: `collection` on this view model already means which shelf
    /// is open, and two properties one letter apart meaning unrelated things is how
    /// somebody reads the wrong one.
    var charmCollections: [CharmCollection] { CharmCollection.allCases }

    /// How many charms a collection holds, for its chip and its hero card.
    func charmCount(in collection: CharmCollection) -> Int {
        collection.charms.count
    }

    func isShowing(_ collection: CharmCollection) -> Bool {
        filter == .collection(collection)
    }

    /// Points the Library at one collection, and says so.
    ///
    /// The one place `collection_opened` is reported from, so that both routes in —
    /// a hero card and a chip — count once and count the same.
    func open(_ collection: CharmCollection) {
        guard filter != .collection(collection) else { return }
        filter = .collection(collection)
        charmManager.noteCollectionOpened(collection)
    }

    /// Every charm the Library knows about, built-ins in document order then imports.
    var allItems: [CharmLibraryItem] {
        let builtIns = library.entries.map { entry in
            CharmLibraryItem(
                id: .builtIn(entry.kind ?? .circle),
                name: entry.name,
                region: entry.region,
                description: entry.description,
                tags: entry.tags,
                categoryID: entry.category
            )
        }
        let customs = charmManager.customEntries.map { entry in
            CharmLibraryItem(
                id: .custom(entry.id),
                name: entry.name,
                region: "Yours",
                description: "Imported from your own image.",
                tags: ["imported", "custom"],
                categoryID: Self.yoursCategoryID
            )
        }
        return builtIns + customs
    }

    /// `allItems` after the chips and the search field.
    var items: [CharmLibraryItem] {
        let query = searchText.searchFolded
        return allItems.filter { item in
            matches(filter: filter, item: item) && (query.isEmpty || item.searchText.contains(query))
        }
    }

    var hasCustomCharms: Bool {
        !charmManager.customEntries.isEmpty
    }

    var favoriteCount: Int {
        charmManager.favoriteCount
    }

    private func matches(filter: Filter, item: CharmLibraryItem) -> Bool {
        switch filter {
        case .all: true
        case .favorites: charmManager.isFavorite(item.id)
        case .category(let id): item.categoryID == id
        case .collection(let collection): CharmCollection.containing(item.id) == collection
        case .yours: item.isCustom
        }
    }

    // MARK: - Selection

    var selectedItem: CharmLibraryItem? {
        allItems.first { $0.id == selection }
    }

    func isSelected(_ id: CharmID) -> Bool {
        id == selection
    }

    func charm(for id: CharmID) -> any Charm {
        charmManager.charm(for: id)
    }

    // MARK: - Favourites

    func isFavorite(_ id: CharmID) -> Bool {
        charmManager.isFavorite(id)
    }

    func toggleFavorite(_ id: CharmID) {
        charmManager.toggleFavorite(id)
    }

    // MARK: - Imports

    var isImporting: Bool {
        charmManager.isImporting
    }

    /// How many imports exist. Watched by the view so that a charm arriving is
    /// noticed; the number itself is of no interest.
    var importCount: Int {
        charmManager.customEntries.count
    }

    /// Describes a charm that has just been imported.
    ///
    /// An import is put on the rope by the charm manager, and the person who just
    /// made it is looking for it — so the detail panel should already be showing it
    /// rather than whatever was being read about a moment ago. Driven by the view
    /// rather than by a getter, because deciding what to describe is a change, and
    /// changes do not belong inside the property that reports them.
    func adoptNewImports() {
        let count = importCount
        defer { knownImportCount = count }
        guard count > knownImportCount, let newest = charmManager.customEntries.last else { return }
        selection = .custom(newest.id)
    }

    func canDelete(_ id: CharmID) -> Bool {
        id.isCustom
    }

    func importImage() {
        importCoordinator.importFromOpenPanel()
    }

    func delete(_ id: CharmID) {
        guard case .custom = id else { return }
        importCoordinator.deleteCharm(id)
    }
}

extension String {
    /// Lowercased with diacritics stripped, for search.
    var searchFolded: String {
        folding(options: [.caseInsensitive, .diacriticInsensitive, .widthInsensitive], locale: nil)
    }
}
