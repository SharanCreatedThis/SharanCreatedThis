//
//  RopeLibraryGrid.swift
//  Hangly
//
//  The rope shelf.
//

import SwiftUI

/// The five cords, drawn rather than described.
struct RopeLibraryGrid: View {
    let viewModel: CharmLibraryViewModel

    private let columns = [GridItem(.adaptive(minimum: 160, maximum: 210), spacing: 18)]

    var body: some View {
        let items = viewModel.ropeItems

        if items.isEmpty {
            ContentUnavailableView.search(text: viewModel.searchText)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 18) {
                    ForEach(items) { item in
                        RopeCard(
                            item: item,
                            isSelected: viewModel.selectedRope == item.id,
                            isOnRope: viewModel.currentRope == item.id,
                            isFavorite: viewModel.isFavoriteRope(item.id),
                            onSelect: { viewModel.chooseRope(item.id) },
                            onToggleFavorite: { viewModel.toggleFavoriteRope(item.id) }
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

/// One cord, hanging in its card. Click to put the charm on it.
struct RopeCard: View {
    let item: RopeItem
    let isSelected: Bool
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
        .help(item.summary)
        .accessibilityLabel(item.name)
        .accessibilityValue(isOnRope ? "On the rope" : "")
        .accessibilityHint("Hangs the charm on this cord")
    }

    private func cardBody(isHovering: Bool) -> some View {
        VStack(spacing: 10) {
            ZStack(alignment: .topTrailing) {
                // The cord runs the full height of its own space with nothing under
                // it, so what is being compared is the texture rather than the
                // frame it is in.
                RopeSwatch(style: item.id)
                    .frame(height: 104)
                    .frame(maxWidth: .infinity)

                star(isHovering: isHovering)
            }

            Text(item.name)
                .font(.system(.subheadline, design: .rounded).weight(.semibold))
                .lineLimit(1)
        }
        .padding(.top, 14)
        .padding(.bottom, 13)
        .padding(.horizontal, 10)
        .frame(maxWidth: .infinity)
        .overlay(alignment: .topLeading) { ropeBadge }
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
        .accessibilityLabel(
            isFavorite ? "Remove \(item.name) from favorites" : "Add \(item.name) to favorites"
        )
    }

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
