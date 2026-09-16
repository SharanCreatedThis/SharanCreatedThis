//
//  CreatePage.swift
//  Hangly
//

import SwiftUI
import UniformTypeIdentifiers

/// Making a charm.
///
/// This is the old AI Charm Studio, and it is no longer a place you go. It was a
/// separate window reached from a menu item, next to a separate "Import Image…"
/// menu item that did half of what it did — so a person wanting to turn a photo
/// into a charm had to first work out which of the two they wanted.
///
/// There is one way in now: put an image here. Drop it, choose it, or pick something
/// made earlier and change it. Everything after that is the same pipeline that
/// always ran, which is why nothing about importing had to be rewritten to merge it.
struct CreatePage: View {
    let viewModel: CharmStudioViewModel
    let charms: CharmManager

    @State private var isTargeted = false

    var body: some View {
        if viewModel.hasImage {
            // Once there is something to work on, the workspace *is* the page.
            CharmStudioView(viewModel: viewModel)
        } else {
            start
        }
    }

    private var start: some View {
        VStack(spacing: 0) {
            dropTarget
                .padding(26)
            if !recent.isEmpty {
                Divider()
                recentStrip
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - The way in

    private var dropTarget: some View {
        VStack(spacing: 16) {
            Image(systemName: "photo.badge.plus")
                .font(.system(size: 42, weight: .light))
                .foregroundStyle(isTargeted ? AnyShapeStyle(.tint) : AnyShapeStyle(.tertiary))
                .symbolEffect(.bounce, value: isTargeted)

            VStack(spacing: 4) {
                Text("Drop an image to make a charm")
                    .font(.title3.weight(.medium))
                Text("PNG, JPEG, WebP or HEIC. The background is removed for you.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }

            Button("Choose Image…") {
                if let url = CharmDialogs().chooseImage() {
                    Task { await viewModel.open(url: url) }
                }
            }
                .controlSize(.large)
                .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(40)
        .background {
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(.quaternary.opacity(isTargeted ? 0.5 : 0.22))
        }
        .overlay {
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(
                    isTargeted ? AnyShapeStyle(.tint) : AnyShapeStyle(.quaternary),
                    style: StrokeStyle(lineWidth: isTargeted ? 2 : 1, dash: [7, 5])
                )
        }
        .scaleEffect(isTargeted ? 1.012 : 1)
        .animation(Motion.settle, value: isTargeted)
        .dropDestination(for: URL.self) { urls, _ in
            guard let url = urls.first(where: CharmImageProcessor.isSupported) else { return false }
            Task { await viewModel.open(url: url) }
            return true
        } isTargeted: { isTargeted = $0 }
    }

    // MARK: - What was made before

    /// Charms made here already, so coming back to change one is not an expedition
    /// through the Library.
    private var recent: [CustomCharmEntry] {
        Array(charms.customEntries.reversed().prefix(8))
    }

    private var recentStrip: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Made here")
                .font(.headline)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(recent) { entry in
                        RecentCreation(entry: entry, charms: charms)
                    }
                }
                .padding(.bottom, 4)
            }
        }
        .padding(.horizontal, 26)
        .padding(.vertical, 18)
    }
}

/// One charm made earlier: click to put it on the rope.
private struct RecentCreation: View {
    let entry: CustomCharmEntry
    let charms: CharmManager

    @State private var isHovering = false

    var body: some View {
        Button {
            charms.selection = .custom(entry.id)
        } label: {
            VStack(spacing: 6) {
                CharmView(charm: charms.charm(for: .custom(entry.id)))
                    .frame(width: 64, height: 64)
                Text(entry.name)
                    .font(.caption)
                    .lineLimit(1)
                    .frame(maxWidth: 76)
            }
            .padding(8)
            .background {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(.quaternary.opacity(isHovering ? 0.45 : 0))
            }
            .scaleEffect(isHovering ? 1.05 : 1)
        }
        .buttonStyle(.plain)
        .onHover { isHovering = $0 }
        .animation(Motion.hover, value: isHovering)
        .help("Hang \(entry.name) on the rope")
    }
}
