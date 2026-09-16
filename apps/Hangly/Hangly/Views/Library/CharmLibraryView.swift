//
//  CharmLibraryView.swift
//  Hangly
//
//  The Library page: everything the rope is made of.
//

import OSLog
import SwiftUI

/// What is on the rope, what there is, and what one of them is.
///
/// Two bands and a grid, in the order the decisions happen in: what is on the rope,
/// how to find something, and everything there is.
///
/// Ropes are here too, on their own shelf. A rope style was a menu item, which made
/// it a setting; it is a thing you own, and this is where the things you own are.
///
/// What one thing *is* used to be a third band along the bottom. It is in the
/// sidebar now — see ``LibraryDetailPanel`` — which gives the grid back the hundred
/// points it was renting and puts the description in the column that was empty
/// anyway.
struct CharmLibraryView: View {
    @Bindable var viewModel: CharmLibraryViewModel

    init(viewModel: CharmLibraryViewModel) {
        self.viewModel = viewModel
    }

    var body: some View {
        VStack(spacing: 0) {
            CurrentRopeStrip(viewModel: viewModel)
                .padding(.horizontal, Space.page)
                .padding(.top, 16)
                .padding(.bottom, 14)
                .background(Self.bandTint)

            Divider()
            controls
            Divider()

            grid
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .onChange(of: viewModel.importCount) { _, _ in viewModel.adoptNewImports() }
        .onAppear { Logger.app.diagnostic("Library opened.") }
    }

    /// A light source at the top of each framing band, rather than a flat grey.
    static let bandTint = LinearGradient(
        colors: [Color.primary.opacity(0.05), Color.primary.opacity(0.02)],
        startPoint: .top,
        endPoint: .bottom
    )

    // MARK: - Finding things

    private var controls: some View {
        VStack(spacing: 12) {
            HStack(spacing: Space.regular) {
                Picker("Collection", selection: $viewModel.collection) {
                    ForEach(LibraryCollection.allCases) { shelf in
                        Text(shelf.title).tag(shelf)
                    }
                }
                .pickerStyle(.segmented)
                .labelsHidden()
                .frame(width: 190)
                .accessibilityLabel("Which collection to browse")

                SearchField(text: $viewModel.searchText, prompt: searchPrompt, resultCount: resultCount)
            }

            if viewModel.collection == .charms {
                CharmFilterChips(viewModel: viewModel)
            }
        }
        .padding(.horizontal, Space.page)
        .padding(.vertical, 14)
        .animation(Motion.settle, value: viewModel.collection)
    }

    private var searchPrompt: String {
        switch viewModel.collection {
        case .charms: "Search charms"
        case .ropes: "Search ropes"
        }
    }

    /// How many things the search found, or `nil` when nothing is being searched
    /// for — a count of everything is not news.
    private var resultCount: Int? {
        guard !viewModel.searchText.isEmpty else { return nil }
        return switch viewModel.collection {
        case .charms: viewModel.items.count
        case .ropes: viewModel.ropeItems.count
        }
    }

    @ViewBuilder private var grid: some View {
        switch viewModel.collection {
        case .charms: CharmLibraryGrid(viewModel: viewModel)
        case .ropes: RopeLibraryGrid(viewModel: viewModel)
        }
    }
}

/// A plain search field, in the content rather than the toolbar.
///
/// `.searchable` puts the field in the window's toolbar, which is shared by every
/// page — so the Library's search box appeared above Appearance and About too, with
/// nothing to search.
struct SearchField: View {
    @Binding var text: String

    var prompt = "Search"

    /// Shown while there is something to search for. Typing into a gallery and
    /// having nothing acknowledge it is the part of search that feels unfinished.
    var resultCount: Int?

    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 7) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(isFocused ? AnyShapeStyle(.tint) : AnyShapeStyle(.secondary))

            TextField(prompt, text: $text)
                .textFieldStyle(.plain)
                .focused($isFocused)

            if let resultCount {
                Text("\(resultCount)")
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.tertiary)
                    .transition(.opacity)
                    .accessibilityLabel("\(resultCount) results")
            }

            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Clear search")
            }
        }
        .padding(.horizontal, 11)
        .padding(.vertical, 8)
        .background {
            RoundedRectangle(cornerRadius: 9, style: .continuous)
                .fill(Color.primary.opacity(isFocused ? 0.08 : 0.05))
        }
        .overlay {
            RoundedRectangle(cornerRadius: 9, style: .continuous)
                .strokeBorder(Color.accentColor.opacity(isFocused ? 0.7 : 0), lineWidth: 1.5)
        }
        .animation(Motion.hover, value: isFocused)
        .animation(Motion.hover, value: resultCount)
    }
}
