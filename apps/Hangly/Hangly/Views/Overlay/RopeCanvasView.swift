//
//  RopeCanvasView.swift
//  Hangly
//
//  Immediate-mode renderer for the simulated rope and its charm.
//

import SwiftUI

/// Draws the rope, the charm and the optional debug overlay.
///
/// `Canvas` rather than a tree of shape views: at 120 frames per second, rebuilding
/// and diffing twenty-one view identities every frame would dominate the frame
/// budget, whereas a canvas issues drawing commands directly and allocates nothing
/// per node. Everything is vector, drawn at the canvas's own scale, so it stays sharp
/// on Retina displays at any charm size.
///
/// The view is a pure function of its inputs. It never touches the solver, so it
/// renders identically from a hand-written snapshot in a preview or a test.
struct RopeCanvasView: View {
    let snapshot: RopeSnapshot

    /// The charms to draw, one entry per place on the rope, from the anchor down.
    /// Each holds one layer at rest and two while that charm is being changed.
    let charmSlots: [[CharmLayer]]

    /// The cord's blended look this frame: one appearance, already averaged across a
    /// style change.
    var ropeAppearance: RopeAppearance = RopeStyle.default.appearance

    /// The style or styles whose texture and beads are drawn this frame. One at
    /// rest, two for the quarter-second a style change takes.
    var ropeStyleLayers: [RopeStyleLayer] = [RopeStyleLayer(style: .default, opacity: 1)]

    /// What the weather is doing to all of it. `.clear` is the overlay exactly as it
    /// was before weather existed.
    var weather: WeatherMood = .clear
    #if !HANGLY_PRODUCTION
    /// Development only. Set by `OverlayRootView`; absent from production builds.
    var isDebugEnabled = false
    var debugSummary = ""
    #endif

    /// A file is being held over the charm (Studio import).
    var isDropTargeted = false

    /// A file is being held over the charm (AirDrop mode).
    var isAirDropTargeted = false

    /// Which charm slot is targeted for the AirDrop drop.
    var airDropTargetSlot: Int?

    /// Label to draw below the targeted charm during an AirDrop hover.
    var airDropLabel: String?

    /// Angle of the progress arc while an import runs; `nil` when idle.
    var importSpinnerAngle: Double?

    var body: some View {
        Canvas(rendersAsynchronously: false) { context, size in
            guard snapshot.points.count >= 2 else { return }

            drawRope(in: &context)
            drawBeads(in: &context)
            drawGlow(in: &context)
            drawCharms(in: &context)
            drawKnot(in: &context)
            drawActivity(in: &context)
            drawAirDropFeedback(in: &context, size: size)

            #if !HANGLY_PRODUCTION
            if isDebugEnabled {
                drawDebugSkeleton(in: &context)
                drawDebugReadout(in: &context, size: size)
            }
            #endif
        }
    }

    /// The cord's colours come from the style, never from the charm.
    ///
    /// They used to come from the charm — each collection asset was drawn hanging on
    /// its own gold cord, and the rope was tinted to match it. That was the right
    /// answer while the cord had no identity of its own; it is the wrong one now,
    /// because a user choosing Silver Chain is choosing what the rope is made of and
    /// would not expect a charm to overrule them.
    private var cordPalette: CharmPalette {
        weather.applied(to: ropeAppearance.palette)
    }

    /// The cord's drawn width. A real cord is thin next to what hangs on it, and it
    /// is measured against the charm so it survives a rescale — but deliberately not
    /// as a constant fraction of it: each style was tuned at a thickness that reads
    /// right and stayed there when the charms grew.
    private var cordWidth: Double {
        RopeStyleRenderer.width(for: ropeAppearance, charmRadius: snapshot.charmRadius)
    }

    /// Where the drawn cord ends: at the knot, where the charm's own artwork takes
    /// over. Drawing on to the centre would run a second cord under artwork that
    /// already has one.
    private var cordEnd: CGPoint {
        cordCurve.point(atArc: drawnCordLength)
    }

    // MARK: - Rope

    /// The cord, cut where each charm's artwork takes over.
    ///
    /// Quadratic smoothing through the node midpoints turns a twenty-segment chain
    /// into a continuous curve without needing more nodes in the simulation. The
    /// same `RopeCurve` the solver threads its beads on produces it, so a bead sits
    /// exactly on the line that is drawn rather than near it.
    ///
    /// With more than one charm this is several subpaths rather than one: the cord
    /// runs from the anchor to the first charm, out of its underside to the next,
    /// and so on. Drawing the whole length and letting the artwork cover it would be
    /// simpler and wrong — a cord drawn under a charm shows through anything the
    /// artwork leaves transparent, and its texture would run on through the gap in
    /// the middle of a hamsa.
    private var ropePath: Path {
        guard snapshot.points.count > 1 else { return Path() }
        let curve = cordCurve

        var path = Path()
        var start = 0.0
        for charm in snapshot.charms {
            let entry = charm.cordEntry.clamped(to: 0...curve.length)
            if entry > start {
                path.addLines(curve.polyline(from: start, to: entry))
            }
            start = max(start, charm.cordExit)
        }
        // Nothing below the last charm: the cord ends inside it.
        if snapshot.charms.isEmpty {
            path.addLines(curve.polyline(upTo: curve.length))
        }
        return path
    }

    private var cordCurve: RopeCurve {
        RopeCurve(points: snapshot.points, end: snapshot.charmCenter)
    }

    /// Length of cord left once the charm covers its end. Measured exactly as the
    /// solver measures it, from the same curve, so the cord it draws is the cord the
    /// beads were threaded onto.
    private var drawnCordLength: Double {
        cordCurve.arc(
            enteringCircleAround: snapshot.charmCenter,
            radius: snapshot.charmRadius * snapshot.charmKnotInset
        )
    }

    /// The cord, in whatever it is made of this frame.
    ///
    /// Drawn in the order light actually arrives: the halo a neon filament throws,
    /// then the cord's own body and shadow, then the texture running along it, then
    /// the highlight on its lit edge last so a chain's links cannot bury it.
    private func drawRope(in context: inout GraphicsContext) {
        let cord = Cord(
            path: ropePath,
            width: cordWidth,
            anchor: snapshot.anchor,
            end: snapshot.charmCenter
        )

        var weathered = ropeAppearance
        weathered.palette = cordPalette
        RopeStyleRenderer.drawGlow(cord, in: &context, appearance: weathered)
        RopeStyleRenderer.drawBody(cord, in: &context, appearance: weathered)

        // One texture at rest, two cross-fading through a style change.
        for layer in ropeStyleLayers {
            var appearance = weathered
            appearance.texture = layer.style.appearance.texture
            RopeStyleRenderer.drawTexture(
                cord,
                in: &context,
                appearance: appearance,
                opacity: layer.opacity
            )
        }

        RopeStyleRenderer.drawHighlight(cord, in: &context, appearance: weathered)
    }

    /// The beads threaded on the cord, each turned to lie along it.
    ///
    /// Every layer draws its own beads, so a charm change cross-fades the beads with
    /// the charm they belong to instead of swapping them abruptly.
    private func drawBeads(in context: inout GraphicsContext) {
        guard !snapshot.beads.isEmpty else { return }

        // A bead's artwork comes from the charm it hangs above, so the beads are
        // grouped by owner and each group indexed from zero within its own charm.
        var indexWithinOwner: [Int: Int] = [:]
        for placement in snapshot.beads {
            let index = indexWithinOwner[placement.owner, default: 0]
            indexWithinOwner[placement.owner] = index + 1
            guard charmSlots.indices.contains(placement.owner) else { continue }

            for charmLayer in charmSlots[placement.owner] {
                for styleLayer in ropeStyleLayers {
                    let opacity = charmLayer.opacity * styleLayer.opacity
                    guard opacity > 0.001 else { continue }
                    CharmRenderer.drawBead(
                        artwork: charmLayer.artwork,
                        index: index,
                        placement: placement,
                        into: &context,
                        opacity: opacity,
                        tint: VectorTint.make(
                            palette: styleLayer.style.appearance.beadTint,
                            mood: weather
                        )
                    )
                }
            }
        }
    }

    private func drawGlow(in context: inout GraphicsContext) {
        for (slot, placement) in snapshot.charms.enumerated() {
            guard charmSlots.indices.contains(slot), let active = charmSlots[slot].last else { continue }
            CharmRenderer.drawAmbientGlow(
                palette: weather.applied(to: active.charm.palette),
                into: &context,
                center: placement.center,
                radius: placement.radius * active.scale,
                opacity: active.opacity
            )
        }
    }

    // MARK: - Charm

    private func drawCharms(in context: inout GraphicsContext) {
        for (slot, placement) in snapshot.charms.enumerated() {
            guard charmSlots.indices.contains(slot) else { continue }
            // Vector artwork hangs from the cord, so it turns with the cord that
            // meets it; geometry and bitmaps keep their screen-fixed lighting.
            let rotation = placement.angle - (.pi / 2)
            for layer in charmSlots[slot] {
                CharmRenderer.draw(
                    artwork: layer.artwork,
                    palette: layer.charm.palette,
                    into: &context,
                    center: placement.center,
                    radius: placement.radius * layer.scale,
                    opacity: layer.opacity,
                    rotation: layer.artwork.vector != nil ? rotation : 0,
                    // The beads in the artwork hang on the cord instead.
                    bodyOnly: true,
                    mood: weather
                )
            }
        }
    }

    /// The loop where the cord meets the charm, oriented along the final link. Each
    /// charm says how far up its own radius that sits, because a heart meets its cord
    /// higher than a bead does.
    private func drawKnot(in context: inout GraphicsContext) {
        for (slot, placement) in snapshot.charms.enumerated()
        where charmSlots.indices.contains(slot) && placement.radius > 1 {
            // Vector artwork draws its own loop where the cord meets it.
            guard charmSlots[slot].last?.artwork.vector == nil else { continue }
            drawKnot(in: &context, at: placement)
        }
    }

    private func drawKnot(in context: inout GraphicsContext, at placement: CharmPlacement) {
        let radius = placement.radius
        let direction = CGPoint(x: cos(placement.angle), y: sin(placement.angle))
        let centre = placement.center - (direction * placement.knotRadius)
        let ringRadius = radius * 0.2

        let ring = Path(ellipseIn: CGRect(
            x: centre.x - ringRadius,
            y: centre.y - ringRadius,
            width: ringRadius * 2,
            height: ringRadius * 2
        ))

        context.stroke(
            ring,
            with: .color(cordPalette.light.withAlpha(0.9).swiftUIColor),
            lineWidth: max(1, radius * 0.07)
        )
    }

    // MARK: - Import feedback

    /// A ring around the charm: dashed and steady while a file hovers, a turning
    /// arc while the import runs. Both sit outside the charm so the artwork itself
    /// stays readable.
    private func drawActivity(in context: inout GraphicsContext) {
        // AirDrop mode draws its own feedback; don't double up.
        guard !isAirDropTargeted else { return }

        let radius = snapshot.charmRadius * 1.45
        guard radius > 2 else { return }
        let centre = snapshot.charmCenter

        if let angle = importSpinnerAngle {
            var arc = Path()
            arc.addArc(
                center: centre,
                radius: radius,
                startAngle: .radians(angle),
                endAngle: .radians(angle + (.pi * 1.4)),
                clockwise: false
            )
            context.stroke(
                arc,
                with: .color(.white.opacity(0.9)),
                style: StrokeStyle(lineWidth: 3, lineCap: .round)
            )
        } else if isDropTargeted {
            let ring = Path(ellipseIn: CGRect(
                x: centre.x - radius,
                y: centre.y - radius,
                width: radius * 2,
                height: radius * 2
            ))
            context.fill(ring, with: .color(.white.opacity(0.12)))
            context.stroke(
                ring,
                with: .color(.white.opacity(0.85)),
                style: StrokeStyle(lineWidth: 2, dash: [6, 5])
            )
        }
    }

    // MARK: - AirDrop feedback

    /// Visual feedback while a file is held over a charm with AirDrop enabled.
    ///
    /// Three elements, all using the existing design language:
    /// 1. An intensified ambient glow behind the targeted charm.
    /// 2. A solid ring (not dashed, to differentiate from the Studio import ring).
    /// 3. A "Drop to AirDrop" label below the charm.
    private func drawAirDropFeedback(in context: inout GraphicsContext, size: CGSize) {
        guard isAirDropTargeted else { return }

        // Which charm to highlight. Falls back to the bottom charm.
        let slot = airDropTargetSlot ?? (snapshot.charms.count - 1)
        guard snapshot.charms.indices.contains(slot) else { return }
        let placement = snapshot.charms[slot]

        let centre = placement.center
        let baseRadius = placement.radius
        guard baseRadius > 2 else { return }

        // 1. Intensified glow — larger and brighter than the ambient.
        let glowRadius = baseRadius * 2.2
        context.fill(
            Path(ellipseIn: CGRect(
                x: centre.x - glowRadius,
                y: centre.y - glowRadius,
                width: glowRadius * 2,
                height: glowRadius * 2
            )),
            with: .radialGradient(
                Gradient(colors: [
                    .white.opacity(0.18),
                    .white.opacity(0.06),
                    .white.opacity(0)
                ]),
                center: centre,
                startRadius: baseRadius * 0.6,
                endRadius: glowRadius
            )
        )

        // 2. Solid ring — slightly outside the charm, brighter than the Studio ring.
        let ringRadius = baseRadius * 1.45
        let ring = Path(ellipseIn: CGRect(
            x: centre.x - ringRadius,
            y: centre.y - ringRadius,
            width: ringRadius * 2,
            height: ringRadius * 2
        ))
        context.fill(ring, with: .color(.white.opacity(0.08)))
        context.stroke(
            ring,
            with: .color(.white.opacity(0.55)),
            style: StrokeStyle(lineWidth: 1.5)
        )

        // 3. Label — drawn below the ring, small and unobtrusive.
        if let label = airDropLabel {
            let text = Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.white.opacity(0.85))
            let resolved = context.resolve(text)
            let textSize = resolved.measure(in: CGSize(width: size.width, height: 40))
            let textOrigin = CGPoint(
                x: centre.x - textSize.width / 2,
                y: centre.y + ringRadius + 8
            )
            // Subtle shadow behind the text for readability over any background.
            var shadowContext = context
            shadowContext.addFilter(.shadow(color: .black.opacity(0.6), radius: 2, y: 1))
            shadowContext.draw(resolved, at: textOrigin, anchor: .topLeading)
        }
    }
}
