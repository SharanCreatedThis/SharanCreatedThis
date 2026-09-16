//
//  CharmStudioPreviews.swift
//  Hangly
//
//  The one large preview, and the switch between the three things it can show.
//

import CoreGraphics
import SwiftUI

/// The centre of the workspace: a switcher, then one preview as large as the window
/// will allow.
///
/// This is where the charm being made is actually judged, so it gets the room. The
/// panel previously held all three previews stacked in a column and the charm — the
/// thing being made — ended up in a tile a couple of inches across, next to two
/// others competing for the same attention.
struct StudioPreviewPanel: View {
    let viewModel: CharmStudioViewModel

    /// View state, deliberately not on the view model: which preview is open is a
    /// thing about this window, not a thing about the charm.
    @State private var mode: StudioPreviewMode = .charm

    /// Width over height for the rope stage. Derived rather than picked: the rope is
    /// `lengthFraction` of the height, it swings `sin(initialAngle)` of that to
    /// either side, and the charm's halo needs its own radius past that.
    private static let ropeStageAspect = 0.9

    var body: some View {
        VStack(spacing: 10) {
            Picker("Preview", selection: $mode) {
                ForEach(StudioPreviewMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            .labelsHidden()
            .frame(maxWidth: 320)
            .accessibilityLabel("Which preview to show")

            stage
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(.quaternary))

            Text(mode.caption)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(14)
    }

    @ViewBuilder private var stage: some View {
        switch mode {
        case .cutout:
            ZStack {
                CheckerboardView()
                if let isolated = viewModel.isolated {
                    Image(decorative: isolated, scale: 1)
                        .resizable()
                        .scaledToFit()
                        .padding(12)
                        .accessibilityLabel("Cut-out preview")
                }
            }
        case .charm:
            ZStack {
                Color(white: 0.13)
                if let charm = viewModel.previewCharm {
                    // Drawn nearly to the edge. The library's cards use a smaller
                    // inset because they sit in a grid; this one is the only thing
                    // in the middle of the window and its whole job is to be looked
                    // at closely. The margin left is for the charm's own halo.
                    CharmView(charm: charm, inset: 0.9)
                        .padding(10)
                        .accessibilityLabel("Charm preview")
                }
            }
        case .onRope:
            // Held to an aspect the swing fits inside. A rope is fitted to the
            // height of whatever it is given, and it swings through an arc about as
            // wide as it is long — so in a tall narrow stage the charm leaves the
            // frame sideways on the first push. Shaped here rather than by shortening
            // the rope, because the preview is worth nothing if it is not the rope.
            ZStack {
                Color(white: 0.13)
                StudioRopePreview(charm: viewModel.previewCharm, reducesMotion: viewModel.reducesMotion)
                    .aspectRatio(Self.ropeStageAspect, contentMode: .fit)
            }
        }
    }
}

/// The classic transparency grid.
struct CheckerboardView: View {
    var cell = 8.0

    var body: some View {
        Canvas { context, size in
            context.fill(Path(CGRect(origin: .zero, size: size)), with: .color(Color(white: 0.92)))
            var path = Path()
            var row = 0
            var y = 0.0
            while y < size.height {
                var x = row.isMultiple(of: 2) ? 0.0 : cell
                while x < size.width {
                    path.addRect(CGRect(x: x, y: y, width: cell, height: cell))
                    x += cell * 2
                }
                y += cell
                row += 1
            }
            context.fill(path, with: .color(Color(white: 0.80)))
        }
        .accessibilityHidden(true)
    }
}

/// A private rope with the draft charm on it, stepping its own simulation.
///
/// Runs on `TimelineView`, paused whenever the rope has settled, so an idle Studio
/// window costs nothing. Under Reduce Motion the rope hangs still.
struct StudioRopePreview: View {
    let charm: (any Charm)?
    let reducesMotion: Bool

    @State private var driver = PreviewRopeDriver()

    var body: some View {
        GeometryReader { proxy in
            TimelineView(.animation(minimumInterval: 1.0 / 60.0, paused: driver.isPaused)) { context in
                RopeCanvasView(
                    snapshot: driver.snapshot,
                    charmSlots: [driver.layers]
                )
                .onChange(of: context.date) { _, date in
                    driver.tick(at: date)
                }
            }
            .background(Color(white: 0.13))
            .onAppear { driver.configure(size: proxy.size, charm: charm, reducesMotion: reducesMotion) }
            .onChange(of: proxy.size) { _, size in driver.resize(to: size) }
            .onChange(of: charm?.metrics) { _, _ in driver.setCharm(charm) }
            .onChange(of: charm?.id) { _, _ in driver.setCharm(charm) }
            .onChange(of: reducesMotion) { _, value in driver.setReducesMotion(value) }
            .overlay(alignment: .bottomTrailing) {
                Button {
                    driver.swing()
                } label: {
                    Label("Swing", systemImage: "arrow.left.arrow.right")
                }
                .controlSize(.small)
                .padding(8)
                .disabled(charm == nil || reducesMotion)
                .help("Give the rope a push")
            }
        }
        .accessibilityLabel("Rope preview")
    }
}

/// Owns the preview's simulation and turns it into frames.
@MainActor
@Observable
final class PreviewRopeDriver {
    private(set) var snapshot: RopeSnapshot = .empty
    private(set) var layers: [CharmLayer] = []
    private(set) var isPaused = true

    @ObservationIgnored private let simulation = RopeSimulation()
    @ObservationIgnored private var lastDate: Date?
    @ObservationIgnored private var lastSize: CGSize?
    @ObservationIgnored private var reducesMotion = false

    /// Whether this rope is decoration rather than a measurement.
    ///
    /// A rope keeps a visible sway long after it has stopped being interesting, and
    /// every frame of that is a canvas redraw. Measured on the About page: twenty
    /// per cent of a core for the better part of a minute, to show a charm drifting
    /// by a pixel. A decorative rope is allowed to call it still much sooner. The
    /// Studio's preview is not decoration — it exists to show how a weight swings —
    /// so it keeps the real threshold.
    @ObservationIgnored private var settlesEarly = false

    /// How much sooner a decorative rope stops. Applied to the speed below which a
    /// node counts as still, so it changes when the rope gives up rather than how
    /// it moves.
    private static let earlySettleScale = 6.0

    /// - Parameter charmSize: How large the charm is drawn against the rope. Above
    ///   one for a preview that has to read at a glance rather than be inspected.
    func configure(
        size: CGSize,
        charm: (any Charm)?,
        reducesMotion: Bool,
        charmSize: Double = 1,
        settlesEarly: Bool = false
    ) {
        self.reducesMotion = reducesMotion
        self.settlesEarly = settlesEarly
        simulation.charmSize = charmSize
        lastSize = size
        simulation.resize(to: size)
        applyTuning()
        simulation.start()
        setCharm(charm)
        if reducesMotion { simulation.resetToHanging() }
        publish()
    }

    func resize(to size: CGSize) {
        guard size.width > 0, size.height > 0 else { return }
        // A resize wakes the rope, and a view that reports the size it already has
        // therefore keeps it awake forever. `GeometryReader` does report it, often,
        // and the result was a decorative rope holding a fifth of a core for as
        // long as the page was open.
        guard size != lastSize else { return }
        lastSize = size
        simulation.resize(to: size)
        // A re-fit rebuilds the configuration from scratch, so the tuning has to go
        // back on afterwards or it is silently lost the first time the view resizes.
        applyTuning()
        publish()
        isPaused = reducesMotion
    }

    func setCharm(_ charm: (any Charm)?) {
        guard let charm else {
            layers = []
            return
        }
        simulation.setCharmMetrics(charm.metrics)
        layers = [CharmLayer(charm: charm, opacity: 1, scale: 1)]
        publish()
        isPaused = reducesMotion
    }

    func setReducesMotion(_ value: Bool) {
        reducesMotion = value
        if value {
            simulation.resetToHanging()
            publish()
            isPaused = true
        }
    }

    /// A push, so the user can see how the charm's weight moves.
    func swing() {
        guard !reducesMotion else { return }
        simulation.reset()
        lastDate = nil
        publish()
        isPaused = false
    }

    func tick(at date: Date) {
        defer { lastDate = date }
        guard let last = lastDate else { return }
        let delta = date.timeIntervalSince(last)
        guard delta > 0, delta < 0.25 else { return }
        simulation.step(deltaTime: delta)
        publish()
        if simulation.isSleeping {
            isPaused = true
            lastDate = nil
        }
    }

    private func applyTuning() {
        guard settlesEarly else { return }
        simulation.configuration.restSpeed = RopeConfiguration.default.restSpeed * Self.earlySettleScale
    }

    private func publish() {
        snapshot = simulation.snapshot()
    }
}
