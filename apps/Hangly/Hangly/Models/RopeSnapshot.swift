//
//  RopeSnapshot.swift
//  Hangly
//
//  Immutable per-frame state handed to the renderer.
//

import CoreGraphics
import Foundation

/// One bead as it should be drawn this frame.
struct BeadPlacement: Equatable, Sendable {
    /// Centre of the bead, on the cord.
    var position: CGPoint

    /// Direction of the cord where it sits, in radians. The bead's artwork is drawn
    /// turned to match, so a bead lies along the cord rather than across it.
    var angle: Double

    /// Drawn size in points.
    var size: CGSize

    /// Which charm on the rope the bead belongs to, counted from the anchor. The
    /// renderer needs it to take the bead's artwork from the right charm.
    var owner: Int = 0
}

/// One charm as it should be drawn this frame.
struct CharmPlacement: Equatable, Sendable {
    /// Centre of the charm, which sits on the rope node it hangs from.
    var center: CGPoint

    /// Drawn radius in points, after the stack's scaling and spacing limits.
    var radius: Double

    /// How the charm hangs: the direction from its knot to its centre, in radians.
    var angle: Double

    /// Where the cord meets it, as a fraction of the radius.
    var knotInset: Double

    /// Distance along the cord where the charm's artwork takes over.
    var cordEntry: Double

    /// Distance along the cord where it comes back out below the charm. The same as
    /// ``cordEntry`` for the charm on the end of the rope, which the cord never
    /// leaves.
    var cordExit: Double

    /// Where the cord disappears behind the artwork.
    var knotRadius: Double { radius * knotInset }
}

/// Everything the renderer needs for one frame, and nothing it can mutate.
///
/// The solver owns live particle state; the view gets a flat value copy. That split
/// means the render pass cannot perturb the simulation, and it keeps the view
/// testable against hand-written snapshots with no physics running.
struct RopeSnapshot: Equatable, Sendable {
    /// Node positions from the anchor at index zero to the charm at the last index.
    var points: [CGPoint]

    /// The charms on the rope, from the anchor down. Never empty while the rope has
    /// nodes; the last hangs on the end.
    var charms: [CharmPlacement]

    /// The beads threaded on the cord, nearest the anchor first. Each carries the
    /// charm it belongs to in ``BeadPlacement/owner``.
    var beads: [BeadPlacement]

    /// Longest link as a multiple of its rest length. One means no stretch.
    var maximumStretch: Double

    /// Whether the charm is currently held.
    var isDragging: Bool

    static let empty = RopeSnapshot(
        points: [],
        charms: [],
        beads: [],
        maximumStretch: 1,
        isDragging: false
    )

    /// The charm on the end of the rope. Everything written before stacks means
    /// this one, and these four are what it used to be called.
    var bottomCharm: CharmPlacement? { charms.last }

    var charmRadius: Double { bottomCharm?.radius ?? 0 }
    var charmAngle: Double { bottomCharm?.angle ?? (.pi / 2) }
    var charmKnotInset: Double { bottomCharm?.knotInset ?? 0.9 }

    /// Position of the charm, which hangs off the final node.
    var charmCenter: CGPoint {
        bottomCharm?.center ?? points.last ?? .zero
    }

    /// Where the drawn cord stops, which is the knot at the top of the charm.
    var cordEnd: CGPoint {
        let direction = CGPoint(x: cos(charmAngle), y: sin(charmAngle))
        return charmCenter - (direction * (charmRadius * charmKnotInset))
    }

    var anchor: CGPoint {
        points.first ?? .zero
    }
}
