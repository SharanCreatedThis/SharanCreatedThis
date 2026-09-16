//
//  CharmFilterChips.swift
//  Hangly
//
//  The categories, as a row rather than a column.
//

import SwiftUI

/// One tap each, across the top of the Library.
///
/// This is the whole of what the second sidebar used to be. A column of five
/// categories cost about a fifth of the window's width to say something a row says
/// in one line, and the charms — which are the reason the window exists — were left
/// with about a third of it.
struct CharmFilterChips: View {
    @Bindable var viewModel: CharmLibraryViewModel

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 7) {
                chip("All", filter: .all)
                chip("Favorites", filter: .favorites, count: viewModel.favoriteCount)
                ForEach(viewModel.categories) { category in
                    chip(category.name, filter: .category(category.id))
                }
                if viewModel.hasCustomCharms {
                    chip("Imported", filter: .yours)
                }

                // The collections last, and behind a divider: they are a different
                // kind of thing from the categories to their left — where a charm
                // came from rather than what it is for — and the row reads better
                // for saying so than for pretending they are the same.
                if !viewModel.charmCollections.isEmpty {
                    Divider()
                        .frame(height: 18)
                        .padding(.horizontal, 3)
                }
                ForEach(viewModel.charmCollections) { collection in
                    Chip(
                        title: collection.chipName,
                        badge: viewModel.charmCount(in: collection),
                        isOn: viewModel.isShowing(collection),
                        // Through `open` rather than by setting the filter, so that
                        // a chip and a hero card report the same event.
                        onTap: { viewModel.open(collection) }
                    )
                }
            }
            // Room for the raised state of a chip to be drawn rather than clipped
            // by the scroll view it lives in.
            .padding(.horizontal, 2)
            .padding(.vertical, 3)
        }
        .accessibilityLabel("Filter charms")
    }

    private func chip(_ title: String, filter: CharmLibraryViewModel.Filter, count: Int = 0) -> some View {
        Chip(
            title: title,
            badge: count,
            isOn: viewModel.filter == filter,
            onTap: { viewModel.filter = filter }
        )
    }
}

/// One category, on or off.
struct Chip: View {
    let title: String

    /// A number worth showing beside the name, or zero for none.
    let badge: Int

    let isOn: Bool
    let onTap: () -> Void

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var isHovering = false

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 5) {
                Text(title)
                if badge > 0 {
                    Text("\(badge)")
                        .monospacedDigit()
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(isOn ? Color.white.opacity(0.8) : Color.secondary)
                }
            }
            .font(.subheadline.weight(isOn ? .semibold : .regular))
            .foregroundStyle(isOn ? Color.white : Color.primary)
            .padding(.horizontal, 13)
            .padding(.vertical, 6)
            .background {
                Capsule()
                    .fill(fill)
                    // Only the chosen chip is raised, so a row of them has exactly
                    // one thing standing up in it.
                    .shadow(color: .black.opacity(isOn ? 0.18 : 0), radius: 5, y: 2)
            }
        }
        .buttonStyle(.plain)
        .scaleEffect(isHovering && !isOn && !reduceMotion ? 1.04 : 1)
        .animation(reduceMotion ? nil : Motion.hover, value: isHovering)
        .animation(reduceMotion ? nil : Motion.settle, value: isOn)
        .onHover { isHovering = $0 }
        .accessibilityAddTraits(isOn ? .isSelected : [])
    }

    private var fill: AnyShapeStyle {
        if isOn { return AnyShapeStyle(Color.accentColor) }
        return AnyShapeStyle(Color.primary.opacity(isHovering ? 0.11 : 0.06))
    }
}
