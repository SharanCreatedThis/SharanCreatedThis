//
//  LibraryDetailPanel.swift
//  Hangly
//
//  What one thing in the collection is, in the sidebar.
//

import SwiftUI

/// The selected charm or cord, described under the navigation.
///
/// This has now been in all three places it could go. A right-hand column took a
/// third of the window from the grid; a bar along the bottom took a hundred points
/// of height from it and turned the page into three stacked strips. The sidebar was
/// already paying for that space and getting four rows of text for it — the rest of
/// the column was empty on every page, on every window size, always.
///
/// So it lives where the room already is, and it uses the room. A column is the one
/// shape this content has always wanted: the artwork gets a portrait rather than a
/// thumbnail, the description gets its own measure instead of two clipped lines, and
/// the actions sit at the foot of the panel where a decision belongs.
struct LibraryDetailPanel: View {
    @Bindable var viewModel: CharmLibraryViewModel

    /// How wide the row is. Stated rather than inherited: a `List` row is offered
    /// an unspecified width, and prose given no width to fit does not wrap — it
    /// lays out on one line and is cropped by the column it is in.
    ///
    /// This is the selection capsule's width, and the panel is pulled out to the
    /// capsule's edge below — so every edge in here lines up with the navigation
    /// above rather than with the row's inner content inset.
    let width: Double

    /// The artwork's stage. Large enough that a charm is a thing being looked at
    /// rather than an icon beside a label.
    private static let mountHeight = 158.0

    var body: some View {
        VStack(spacing: 0) {
            // Inside the inset, so the rule ends where the artwork does rather
            // than running out past it to the column's edge.
            Divider()

            Group {
                switch viewModel.collection {
                case .charms: charm
                case .ropes: rope
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(.vertical, 14)
        }
        .frame(width: width, alignment: .leading)
        // Pulled left onto the capsule's line, and given the same amount back on
        // the right so the panel keeps the capsule's width rather than growing
        // past the column. See `CustomizeView.sidebarRowContentInset`.
        .padding(.leading, -CustomizeView.sidebarRowContentInset)
        .padding(.trailing, CustomizeView.sidebarRowContentInset)
    }

    // MARK: - A charm

    @ViewBuilder private var charm: some View {
        if let item = viewModel.selectedItem {
            VStack(alignment: .leading, spacing: 12) {
                mount {
                    CharmView(charm: viewModel.charm(for: item.id), inset: 0.84)
                }

                heading(item.name, badge: item.region)

                // Room for the whole entry now. The bottom bar showed two lines of
                // it and an ellipsis, which is the shape of a tooltip rather than
                // of a description.
                Text(item.description)
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .lineSpacing(1.5)
                    // Explicitly unlimited. A sidebar list hands its rows a
                    // one-line limit — right for a row of navigation, wrong for
                    // the only prose in the column, which was being cropped after
                    // six words with the rest of the panel standing empty.
                    .lineLimit(nil)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)

                TagCloud(tags: Array(item.tags.prefix(4)))

                Spacer(minLength: 12)

                actions(Actions(
                    isFavorite: viewModel.isFavorite(item.id),
                    isOnRope: viewModel.isOnRope(item.id),
                    canAdd: viewModel.canAddSlot,
                    deleteTitle: viewModel.canDelete(item.id) ? "Delete Charm…" : nil,
                    toggleFavorite: { viewModel.toggleFavorite(item.id) },
                    add: { viewModel.addSelectionToRope() },
                    delete: { viewModel.delete(item.id) }
                ))
            }
            .id(item.id)
            .transition(.opacity)
            .animation(Motion.settle, value: item.id)
        } else {
            placeholder("Nothing selected")
        }
    }

    // MARK: - A cord

    private var rope: some View {
        let style = viewModel.selectedRope
        return VStack(alignment: .leading, spacing: 12) {
            mount {
                // The swatch's own reference radius, the same one the rope cards
                // use. At a smaller one every style is a hairline, and the texture
                // is the entire thing being chosen between.
                RopeSwatch(style: style)
                    .frame(width: 56)
            }

            heading(style.displayName, badge: nil)

            Text(style.summary)
                .font(.callout)
                .foregroundStyle(.secondary)
                .lineSpacing(1.5)
                .lineLimit(nil)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 12)

            actions(Actions(
                isFavorite: viewModel.isFavoriteRope(style),
                isOnRope: viewModel.currentRope == style,
                canAdd: true,
                addTitle: "Use This Rope",
                toggleFavorite: { viewModel.toggleFavoriteRope(style) },
                add: { viewModel.chooseRope(style) }
            ))
        }
        .id(style)
        .animation(Motion.settle, value: style)
    }

    // MARK: - Shared

    /// The plate the described thing stands on, with a pool of light under it —
    /// the same mount the grid cards use, at the size a portrait wants.
    private func mount(@ViewBuilder content: () -> some View) -> some View {
        ZStack {
            RadialGradient(
                colors: [Color.primary.opacity(0.1), Color.primary.opacity(0)],
                center: .center,
                startRadius: 2,
                endRadius: 86
            )
            content()
                .padding(.vertical, 16)
        }
        .frame(height: Self.mountHeight)
        .frame(maxWidth: .infinity)
        .background {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(.quaternary.opacity(0.4))
        }
        .overlay {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(Color.primary.opacity(0.08), lineWidth: 1)
        }
    }

    private func heading(_ name: String, badge: String?) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(name)
                .font(.system(.title3, design: .rounded).weight(.semibold))
                .lineLimit(2, reservesSpace: false)
                .fixedSize(horizontal: false, vertical: true)

            if let badge {
                Text(badge)
                    .font(.caption2.weight(.medium))
                    .tracking(0.6)
                    .textCase(.uppercase)
                    .foregroundStyle(.tertiary)
                    .lineLimit(nil)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    /// What can be done to the thing being described.
    struct Actions {
        var isFavorite: Bool
        var isOnRope: Bool
        var canAdd: Bool
        var addTitle = "Add to Rope"
        var deleteTitle: String?
        var toggleFavorite: () -> Void
        var add: () -> Void
        var delete: () -> Void = {}
    }

    /// The one decision, full width at the foot of the panel, and the two small
    /// ones under it.
    private func actions(_ model: Actions) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Divider()

            primaryAction(model)

            HStack(spacing: 0) {
                Button(action: model.toggleFavorite) {
                    Label(
                        model.isFavorite ? "Favorited" : "Favorite",
                        systemImage: model.isFavorite ? "star.fill" : "star"
                    )
                    .font(.caption)
                    .foregroundStyle(model.isFavorite ? Color.yellow : Color.secondary)
                    .contentTransition(.symbolEffect(.replace))
                }
                .buttonStyle(.plain)
                .help(model.isFavorite ? "Remove from Favorites" : "Add to Favorites")

                Spacer(minLength: 8)

                if let deleteTitle = model.deleteTitle {
                    Button(role: .destructive, action: model.delete) {
                        Image(systemName: "trash")
                            .font(.caption)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.secondary)
                    .help(deleteTitle)
                    .accessibilityLabel(deleteTitle)
                }
            }
        }
    }

    /// One button, one badge, or one explanation — never two of them at once.
    @ViewBuilder
    private func primaryAction(_ model: Actions) -> some View {
        if model.isOnRope {
            Label("On the rope", systemImage: "checkmark.circle.fill")
                .font(.callout.weight(.medium))
                .foregroundStyle(Color.accentColor)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.vertical, 3)
        } else if model.canAdd {
            Button(action: model.add) {
                Text(model.addTitle)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        } else {
            Text("The rope is full")
                .font(.caption)
                .foregroundStyle(.tertiary)
                .padding(.vertical, 3)
        }
    }

    private func placeholder(_ text: String) -> some View {
        Text(text)
            .font(.callout)
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}
