//
//  CharmStackPresenter.swift
//  Hangly
//
//  The charms on the rope, and the changes they are part-way through.
//

import Foundation

/// Keeps the drawn charms in step with the chosen ones.
///
/// One place on the rope changes at a time far more often than all of them do, so
/// this is built per slot: swapping the middle charm of three cross-fades that one
/// and leaves the other two entirely alone, artwork and all. That matters beyond
/// tidiness — resolving a vector charm's artwork means measuring its asset, and
/// doing it for three charms on every frame of every change would undo the work
/// that put artwork resolution behind a charm change in the first place.
///
/// Owned by `OverlayViewModel` rather than being observable itself. The view model
/// publishes one array per frame; this decides what goes in it.
@MainActor
final class CharmStackPresenter {
    /// One place on the rope, and whatever change it is part-way through.
    ///
    /// `fileprivate` rather than `private` only so that the behaviour below can live
    /// in its own extension instead of inside the class.
    fileprivate struct Slot {
        var charm: any Charm
        var artwork: CharmArtwork

        /// How large this place is drawn, relative to the charm's own artwork.
        var size: Double

        var target: CharmMetrics

        /// Where this slot's metrics were when the current change began.
        var start: CharmMetrics

        /// Zero to one. One means settled.
        var progress: Double

        var outgoing: (charm: any Charm, artwork: CharmArtwork)?
    }

    /// Long enough to read as a deliberate change, short enough not to feel slow.
    nonisolated static let transitionDuration: TimeInterval = 0.28

    private var slots: [Slot]

    init(charms: [any Charm], sizes: [Double] = []) {
        slots = Self.settled(charms, sizes: sizes)
    }

    private static func settled(_ charms: [any Charm], sizes: [Double]) -> [Slot] {
        charms.enumerated().map { index, charm in
            Slot(settled: charm, size: sizes.indices.contains(index) ? sizes[index] : 1)
        }
    }

    // MARK: - What the rest of the app reads

    /// The identities currently on the rope, from the anchor down.
    var ids: [CharmID] { slots.map(\.charm.id) }

    /// The charms currently on the rope.
    var charms: [any Charm] { slots.map(\.charm) }

    /// How large each place is drawn, in the same order.
    var sizes: [Double] { slots.map(\.size) }

    /// What to draw: one entry per place on the rope, holding one layer at rest and
    /// two while that place is being changed.
    var layers: [[CharmLayer]] { slots.map(\.drawnLayers) }

    /// What the solver should hang, with any change part-way through it applied, so
    /// the rope grows into a heavier charm rather than jumping to it.
    var metrics: [CharmMetrics] { slots.map(\.currentMetrics) }

    /// What each charm threads onto the cord above it.
    ///
    /// The incoming charm's beads take over the cord at once and fade in with it;
    /// the outgoing charm's artwork is drawn on them until it is gone.
    var beads: [[CharmBead]] { slots.map(\.charm.beads) }

    var isTransitioning: Bool {
        slots.contains { $0.progress < 1 }
    }

    // MARK: - Changes

    /// Brings the stack in line with a new set of charms.
    ///
    /// - Parameter immediately: Skip the cross-fade, for Reduce Motion.
    /// - Returns: The charms that arrived, so the caller can announce them. Empty
    ///   when nothing changed, which is every frame but a handful.
    @discardableResult
    func apply(_ charms: [any Charm], sizes: [Double] = [], immediately: Bool) -> [any Charm] {
        guard !charms.isEmpty else { return [] }

        // A change in the *number* of charms moves every attachment on the rope, so
        // there is nothing for the old slots to cross-fade into: the rope is being
        // re-strung rather than one charm swapped.
        guard charms.count == slots.count else {
            slots = Self.settled(charms, sizes: sizes)
            return charms
        }

        var arrived: [any Charm] = []
        for index in slots.indices {
            let size = sizes.indices.contains(index) ? sizes[index] : 1
            if slots[index].charm.id != charms[index].id {
                slots[index].begin(charms[index], size: size, immediately: immediately)
                arrived.append(charms[index])
            } else if slots[index].size != size {
                // Only the metrics move, so this grows or shrinks where it hangs
                // rather than cross-fading with a copy of itself.
                slots[index].resize(to: size, immediately: immediately)
            }
        }
        return arrived
    }

    /// - Returns: Whether anything moved, so a settled rope is not asked to redraw.
    @discardableResult
    func advance(by deltaTime: TimeInterval) -> Bool {
        var moved = false
        for index in slots.indices where slots[index].progress < 1 {
            slots[index].advance(by: deltaTime)
            moved = true
        }
        return moved
    }
}

private extension CharmStackPresenter.Slot {
    init(settled charm: any Charm, size: Double = 1) {
        let metrics = charm.metrics.scaled(by: size)
        self.init(
            charm: charm,
            artwork: charm.hangingArtwork(),
            size: size,
            target: metrics,
            start: metrics,
            progress: 1,
            outgoing: nil
        )
    }

    /// Mass and radius move with the artwork, so the grab region and the swing
    /// weight always match what is on screen.
    var currentMetrics: CharmMetrics {
        guard progress < 1 else { return target }
        return .interpolate(from: start, to: target, progress: eased)
    }

    var drawnLayers: [CharmLayer] {
        var layers: [CharmLayer] = []
        if let outgoing, progress < 1 {
            // Shrinking as it leaves keeps the dissolve readable; two shapes at the
            // same size and half opacity just look like one muddled shape.
            layers.append(CharmLayer(
                charm: outgoing.charm,
                artwork: outgoing.artwork,
                opacity: 1 - eased,
                scale: 1 - (0.12 * eased)
            ))
        }
        layers.append(CharmLayer(
            charm: charm,
            artwork: artwork,
            opacity: progress < 1 ? eased : 1,
            scale: progress < 1 ? 0.92 + (0.08 * eased) : 1
        ))
        return layers
    }

    mutating func begin(_ incoming: any Charm, size newSize: Double, immediately: Bool) {
        // Start from where this slot actually is, not from the outgoing charm's
        // nominal size, so interrupting a change mid-way still looks continuous.
        start = currentMetrics
        outgoing = immediately ? nil : (charm, artwork)
        charm = incoming
        artwork = incoming.hangingArtwork()
        size = newSize
        target = incoming.metrics.scaled(by: newSize)
        progress = immediately ? 1 : 0
    }

    /// Changes how large this place is drawn, keeping the charm that is in it.
    ///
    /// Deliberately not a cross-fade. Nothing is arriving or leaving, so there is
    /// no second layer: the same artwork is drawn at a radius that eases from the
    /// old size to the new one, which is what makes dragging the slider look like
    /// the charm growing rather than like a slideshow of charms.
    mutating func resize(to newSize: Double, immediately: Bool) {
        start = currentMetrics
        size = newSize
        target = charm.metrics.scaled(by: newSize)
        outgoing = nil
        progress = immediately ? 1 : 0
    }

    mutating func advance(by deltaTime: TimeInterval) {
        progress = min(1, progress + (deltaTime / CharmStackPresenter.transitionDuration))
        if progress >= 1 {
            outgoing = nil
        }
    }

    /// Ease in and out, so the change starts and finishes gently.
    var eased: Double {
        let clamped = progress.clamped(to: 0...1)
        return clamped * clamped * (3 - (2 * clamped))
    }
}
