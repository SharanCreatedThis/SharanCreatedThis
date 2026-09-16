//
//  CollectionHeroCards.swift
//  Hangly
//
//  The four collections, across the top of the Library.
//

import SwiftUI

/// A row of cards, one per collection, above the charms.
///
/// The Library already has chips, and the collections have chips of their own, so a
/// card is not there to make them reachable — it is there to make them *visible*.
/// A chip is four words in a row of eleven; a card shows what is in the set before
/// anybody taps it, which is the only way somebody finds out that a collection they
/// did not know about is worth opening.
///
/// It is a row and not a sidebar, deliberately: the brief asked for no new
/// navigation, and the Library's whole shape is one column of charms with filters
/// above it.
struct CollectionHeroCards: View {
    let viewModel: CharmLibraryViewModel

    /// Wide enough for the longest name — "Tamil Spiritual" — on one line beside its
    /// cover, and narrow enough that four fit at the Library's smallest width.
    private let columns = [GridItem(.adaptive(minimum: 236, maximum: 330), spacing: 12)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(viewModel.charmCollections) { collection in
                CollectionHeroCard(
                    collection: collection,
                    charmCount: viewModel.charmCount(in: collection),
                    isShowing: viewModel.isShowing(collection),
                    charm: { viewModel.charm(for: .builtIn($0)) },
                    onOpen: { viewModel.open(collection) }
                )
            }
        }
    }
}

/// One collection: its cover, its name, how many are in it, and what it is.
struct CollectionHeroCard: View {
    let collection: CharmCollection
    let charmCount: Int
    let isShowing: Bool

    /// Resolves a kind to the charm to draw. Handed in rather than reached for, so
    /// the card can be previewed without an object graph.
    let charm: (CharmKind) -> any Charm

    let onOpen: () -> Void

    var body: some View {
        Button(action: onOpen) {
            CollectiblePlate(isSelected: isShowing, cornerRadius: 14) { _ in
                HStack(spacing: 12) {
                    cover
                    text
                    Spacer(minLength: 0)
                }
                .padding(.vertical, 11)
                .padding(.horizontal, 12)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .buttonStyle(.plain)
        .help(collection.summary)
        .accessibilityLabel("\(collection.displayName), \(charmCount) charms")
        .accessibilityHint("Shows only this collection")
        .accessibilityAddTraits(isShowing ? .isSelected : [])
    }

    /// Three of the collection's charms, overlapped the way a hand of cards is.
    ///
    /// Drawn live from the artwork rather than from a cover image: there is no third
    /// file to keep in step, and replacing a charm's SVG updates the cover for free.
    private var cover: some View {
        ZStack {
            ForEach(Array(collection.coverCharms.enumerated()), id: \.element) { index, kind in
                CharmView(charm: charm(kind), inset: 0.92)
                    .frame(width: 42, height: 42)
                    // Fanned from the back forward, so the first charm in the
                    // collection is the one on top and fully visible.
                    .offset(x: Double(collection.coverCharms.count - 1 - index) * 13)
                    .zIndex(Double(collection.coverCharms.count - index))
            }
        }
        .frame(width: 42 + Double(max(0, collection.coverCharms.count - 1)) * 13, height: 46)
        .accessibilityHidden(true)
    }

    private var text: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(collection.chipName)
                .font(.subheadline.weight(.semibold))
                .lineLimit(1)
            Text("\(charmCount) charms")
                .font(.caption2.weight(.medium))
                .foregroundStyle(.tertiary)
            Text(collection.summary)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
