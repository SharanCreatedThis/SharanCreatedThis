//
//  CharmStudioView.swift
//  Hangly
//
//  The AI Charm Studio window: import, cut out, shape, preview, save.
//

import SwiftUI

/// The Studio's root: a header of actions, then either the drop zone or the three
/// working panels. Everything the user changes is undoable from the header.
struct CharmStudioView: View {
    let viewModel: CharmStudioViewModel

    /// The side columns give way before the middle one does.
    ///
    /// Fixed widths were tried and are wrong: at a window narrower than their sum
    /// the row simply overflowed and the controls were cut off by the window edge,
    /// which is a worse failure than a slightly narrow column. These compress to
    /// their minimums first, so the result keeps its share and everything stays on
    /// screen.
    static let sourceWidth: ClosedRange<Double> = 148...200

    /// Enough for a radio group, three sliders and their captions.
    static let controlsWidth: ClosedRange<Double> = 236...286

    /// What the result gets even when everything else has given up what it can.
    static let minimumStageWidth = 300.0

    var body: some View {
        VStack(spacing: 0) {
            StudioHeader(viewModel: viewModel)
            Divider()

            Group {
                if viewModel.hasImage {
                    // Original, result, controls. The middle column takes whatever
                    // the other two do not, and the other two are as narrow as they
                    // can be and still do their jobs — the result is the thing being
                    // judged, so it gets the window.
                    HStack(spacing: 0) {
                        StudioSourcePanel(viewModel: viewModel)
                            .frame(
                                minWidth: Self.sourceWidth.lowerBound,
                                idealWidth: Self.sourceWidth.upperBound,
                                maxWidth: Self.sourceWidth.upperBound
                            )
                        Divider()
                        StudioPreviewPanel(viewModel: viewModel)
                            .frame(minWidth: Self.minimumStageWidth, maxHeight: .infinity)
                            .frame(maxWidth: .infinity)
                            // The middle column is the one that grows, so it takes
                            // the slack rather than sharing it three ways.
                            .layoutPriority(1)
                        Divider()
                        StudioPropertiesPanel(viewModel: viewModel)
                            .frame(
                                minWidth: Self.controlsWidth.lowerBound,
                                idealWidth: Self.controlsWidth.upperBound,
                                maxWidth: Self.controlsWidth.upperBound
                            )
                    }
                } else {
                    StudioDropZone(viewModel: viewModel)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            Divider()
            StudioStatusBar(viewModel: viewModel)
        }
        // Where the result stops being the biggest thing on screen.
        .frame(
            minWidth: Self.sourceWidth.lowerBound + Self.controlsWidth.lowerBound + Self.minimumStageWidth,
            minHeight: 540
        )
        .dropDestination(for: URL.self) { urls, _ in
            guard let url = urls.first(where: CharmImageProcessor.isSupported) else { return false }
            Task { await viewModel.open(url: url) }
            return true
        }
        .overlay {
            if viewModel.stage == .saved {
                StudioSavedOverlay(viewModel: viewModel)
            }
        }
    }
}

/// Open, undo, redo, and save.
struct StudioHeader: View {
    @Bindable var viewModel: CharmStudioViewModel

    var body: some View {
        HStack(spacing: 12) {
            // Not "AI Charm Studio" any more. The Studio stopped being a place you
            // go when Create absorbed it, and a page that announces itself by name
            // inside a window that already names it is just a second title bar.
            Label(viewModel.effectiveName, systemImage: "wand.and.stars")
                .font(.headline)
                .lineLimit(1)
                .truncationMode(.middle)
                // The row is icon-only so the buttons stay narrow; the name is the
                // one thing here that is not a button.
                .labelStyle(.titleAndIcon)

            Spacer()

            // Icons only for the three that have obvious ones, so the row still
            // fits when the window is narrow and the words that remain are the ones
            // that carry a decision.
            Button {
                if let url = CharmDialogs().chooseImage() {
                    Task { await viewModel.open(url: url) }
                }
            } label: {
                Label("Open…", systemImage: "folder")
            }
            .keyboardShortcut("o", modifiers: .command)
            .help("Open another image")

            Button {
                viewModel.undo()
            } label: {
                Label("Undo", systemImage: "arrow.uturn.backward")
            }
            .keyboardShortcut("z", modifiers: .command)
            .disabled(!viewModel.canUndo)
            .help("Undo the last change")

            Button {
                viewModel.redo()
            } label: {
                Label("Redo", systemImage: "arrow.uturn.forward")
            }
            .keyboardShortcut("z", modifiers: [.command, .shift])
            .disabled(!viewModel.canRedo)
            .help("Redo the last undone change")

            Divider().frame(height: 18)

            Toggle("Use on rope", isOn: $viewModel.useOnRopeAfterSave)
                .toggleStyle(.checkbox)
                .disabled(!viewModel.hasImage)
                .help("Hang it as soon as it is saved")

            Button {
                Task { await viewModel.save() }
            } label: {
                Text("Save")
                    .frame(minWidth: 44)
            }
            .keyboardShortcut("s", modifiers: .command)
            .buttonStyle(.borderedProminent)
            .disabled(!viewModel.canSave)
            .help("Save this charm to your library")
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .labelStyle(.iconOnly)
    }
}

/// The empty state: a large target for a file.
struct StudioDropZone: View {
    let viewModel: CharmStudioViewModel

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: "photo.badge.plus")
                .font(.system(size: 44, weight: .light))
                .foregroundStyle(.secondary)
            Text("Drop an image to make a charm")
                .font(.title3.weight(.semibold))
            Text("PNG, JPEG, WebP or HEIC. The background is removed and the subject found for you.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 380)
            Button("Choose Image…") {
                if let url = CharmDialogs().chooseImage() {
                    Task { await viewModel.open(url: url) }
                }
            }
            .padding(.top, 4)

            if viewModel.stage == .loading {
                ProgressView("Reading image…")
                    .padding(.top, 8)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(40)
        .overlay {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8, 6]))
                .foregroundStyle(.quaternary)
                .padding(28)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Drop zone. Drop an image or choose one to make a charm.")
    }
}

/// Subject summary on the left, processing state or error on the right.
struct StudioStatusBar: View {
    let viewModel: CharmStudioViewModel

    var body: some View {
        HStack {
            if viewModel.hasImage {
                Label(viewModel.subjectSummary, systemImage: "viewfinder")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            if let error = viewModel.errorMessage {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(.orange)
                    .lineLimit(1)
                    .accessibilityLabel("Error: \(error)")
            } else if viewModel.isProcessing {
                HStack(spacing: 6) {
                    ProgressView().controlSize(.mini)
                    Text("Updating preview…").font(.caption).foregroundStyle(.secondary)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 6)
        .frame(height: 28)
    }
}

/// Confirmation after a save, with the two sensible next steps.
struct StudioSavedOverlay: View {
    let viewModel: CharmStudioViewModel

    var body: some View {
        ZStack {
            Color.black.opacity(0.35).ignoresSafeArea()
            VStack(spacing: 14) {
                if let charm = viewModel.previewCharm {
                    CharmView(charm: charm, inset: 0.8)
                        .frame(width: 120, height: 120)
                }
                Text("Saved “\(viewModel.savedEntry?.name ?? viewModel.effectiveName)” to your library")
                    .font(.headline)
                if viewModel.useOnRopeAfterSave {
                    Text("It's on the rope now.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
                HStack(spacing: 10) {
                    Button("Make Another") { viewModel.clear() }
                    Button("Done") { viewModel.done() }
                        .buttonStyle(.borderedProminent)
                        .keyboardShortcut(.defaultAction)
                }
                .padding(.top, 4)
            }
            .padding(28)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .accessibilityElement(children: .contain)
        }
    }
}
