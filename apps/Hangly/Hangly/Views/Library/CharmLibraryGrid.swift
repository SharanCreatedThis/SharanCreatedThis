//
//  CharmLibraryGrid.swift
//  Hangly
//
//  The card grid and a single card.
//

import SwiftUI

/// A responsive grid of charm cards, or a friendly empty state.
struct CharmLibraryGrid: View {
    let viewModel: CharmLibraryViewModel

    /// Wider cards, further apart, than the grid had. The charms are the reason
    /// anybody opens this window, and they were being shown at the density of a
    /// file list — close-packed, small, nothing between them. Fewer per row is the
    /// trade, and it is worth making.
    private let columns = [GridItem(.adaptive(minimum: 152, maximum: 188), spacing: 18)]

    var body: some View {
        let items = viewModel.items

        if items.isEmpty {
            ContentUnavailableView.search(text: viewModel.searchText)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                // Above the charms rather than beside them: the brief asked for no
                // new navigation, and inside the scroll view rather than pinned
                // above it because the window is a fixed height and a permanent
                // band of cards is a permanent band fewer charms.
                if viewModel.collection == .charms, viewModel.searchText.isEmpty {
                    CollectionHeroCards(viewModel: viewModel)
                        .padding(.horizontal, Space.page)
                        .padding(.top, Space.regular)
                }

                LazyVGrid(columns: columns, spacing: 18) {
                    ForEach(items) { item in
                        CharmCard(
                            item: item,
                            charm: viewModel.charm(for: item.id),
                            isSelected: viewModel.isSelected(item.id),
                            isOnRope: viewModel.isOnRope(item.id),
                            isFavorite: viewModel.isFavorite(item.id),
                            onSelect: { viewModel.choose(item.id) },
                            onToggleFavorite: { viewModel.toggleFavorite(item.id) }
                        )
                    }
                }
                .padding(.horizontal, Space.page)
                .padding(.vertical, Space.regular)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

/// One charm, live-rendered, with its name and region. Click to put it on the rope.
///
/// The card is a real `Button`, so it is reachable with Tab, activates with Space
/// or Return, and reads to VoiceOver as one control with the name, the region and
/// whether it is on the rope. The favourite star is a second, nested control.
struct CharmCard: View {
    let item: CharmLibraryItem
    let charm: any Charm

    /// Being described in the detail panel.
    let isSelected: Bool

    /// Hanging on the rope, in any place.
    let isOnRope: Bool

    let isFavorite: Bool
    let onSelect: () -> Void
    let onToggleFavorite: () -> Void

    var body: some View {
        Button(action: onSelect) {
            CollectiblePlate(isSelected: isSelected) { isHovering in
                cardBody(isHovering: isHovering)
            }
        }
        .buttonStyle(.plain)
        .help(item.description)
        .accessibilityLabel("\(item.name), \(item.region)")
        .accessibilityValue(isOnRope ? "On the rope" : "")
        .accessibilityHint("Puts this charm on the rope")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }

    private func cardBody(isHovering: Bool) -> some View {
        VStack(spacing: 10) {
            ZStack(alignment: .topTrailing) {
                mount
                star(isHovering: isHovering)
            }

            caption
        }
        .padding(.top, 14)
        .padding(.bottom, 13)
        .padding(.horizontal, 10)
        .frame(maxWidth: .infinity)
        .overlay(alignment: .topLeading) { ropeBadge }
    }

    /// A soft pool of light under the charm.
    ///
    /// The cards used to be flat fills with artwork dropped on them, which left a
    /// hard silhouette floating in a rectangle. This is what makes each one read as
    /// an object standing on something rather than a sticker.
    private var mount: some View {
        ZStack {
            RadialGradient(
                colors: [Color.primary.opacity(0.09), Color.primary.opacity(0)],
                center: .center,
                startRadius: 2,
                endRadius: 62
            )
            CharmView(charm: charm, inset: 0.78)
                .frame(width: 106, height: 106)
        }
        .frame(height: 106)
        .frame(maxWidth: .infinity)
    }

    private func star(isHovering: Bool) -> some View {
        Button(action: onToggleFavorite) {
            Image(systemName: isFavorite ? "star.fill" : "star")
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(isFavorite ? Color.yellow : Color.secondary)
                .padding(6)
                .background(.thinMaterial, in: Circle())
        }
        .buttonStyle(.plain)
        .opacity(isFavorite || isHovering ? 1 : 0)
        .animation(Motion.hover, value: isHovering)
        .help(isFavorite ? "Remove from Favorites" : "Add to Favorites")
        .accessibilityLabel(isFavorite ? "Remove \(item.name) from favorites" : "Add \(item.name) to favorites")
    }

    /// Name, then where it comes from — set small, tracked and quiet, so a grid of
    /// cards reads as artwork with labels rather than two lines of text each.
    private var caption: some View {
        VStack(spacing: 3) {
            Text(item.name)
                .font(.system(.subheadline, design: .rounded).weight(.semibold))
                .lineLimit(1)
            Text(item.region)
                .font(.caption2)
                .tracking(0.5)
                .textCase(.uppercase)
                .foregroundStyle(.tertiary)
                .lineLimit(1)
        }
    }

    /// Top-leading, opposite the star, so neither badge sits on the caption. The
    /// ring says which charm is being read about; this says which are hanging, and
    /// they are often not the same card.
    @ViewBuilder private var ropeBadge: some View {
        if isOnRope {
            Image(systemName: "checkmark")
                .font(.system(size: 8, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 15, height: 15)
                .background(Color.accentColor, in: Circle())
                .padding(9)
                .transition(.scale.combined(with: .opacity))
                .accessibilityLabel("On the rope")
        }
    }
}
