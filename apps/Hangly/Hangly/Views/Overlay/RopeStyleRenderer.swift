//
//  RopeStyleRenderer.swift
//  Hangly
//
//  Drawing a cord in the style the user picked.
//

import SwiftUI

/// One frame's cord, as geometry: the line to stroke and everything measured off it.
///
/// Gathered into a value because every part of the drawing needs the same four
/// numbers, and because it is the honest description of what a cord is here — a path
/// with a thickness, running from the anchor to the charm.
struct Cord {
    /// The curve, already cut where the charm's artwork takes over.
    var path: Path

    /// Drawn width in points.
    var width: Double

    /// Where the cord leaves the menu bar.
    var anchor: CGPoint

    /// Where it meets the charm. With ``anchor``, the axis of the body gradient.
    var end: CGPoint
}

/// Draws the cord.
///
/// A cord is built in three parts, and they are separate because a style change has
/// to blend them differently. The **body** — the shadow under it, the gradient along
/// it and the highlight on its lit edge — is one continuous shape, so it takes a
/// blended appearance and is drawn once. The **texture** is a dash pattern, and two
/// dash patterns cannot be averaged into a third, so each style draws its own and
/// they cross-fade. The **glow** belongs to neon alone and fades with it.
///
/// Deliberately no filters anywhere. A blur or a shadow filter rasterises an
/// offscreen layer on every frame it is drawn, which at 120 Hz costs tens of
/// megabytes and a good share of a core; every effect here is an ordinary stroke of
/// a path the canvas already has, and the canvas anti-aliases all of them for free.
enum RopeStyleRenderer {
    /// The cord's drawn width for a charm of this radius.
    static func width(for appearance: RopeAppearance, charmRadius: Double) -> Double {
        max(appearance.minimumWidth, charmRadius * appearance.widthScale)
    }

    // MARK: - Glow

    /// A halo, faked with three progressively wider and fainter strokes of the cord's
    /// own path. Neon only, and nothing at all when the style has no glow — the three
    /// strokes are skipped rather than drawn at zero alpha.
    static func drawGlow(_ cord: Cord, in context: inout GraphicsContext, appearance: RopeAppearance) {
        let strength = appearance.glowStrength
        guard strength > 0.001 else { return }

        let halo = appearance.palette.primary
        for (multiple, alpha) in [(5.0, 0.09), (3.1, 0.15), (1.9, 0.24)] {
            context.stroke(
                cord.path,
                with: .color(halo.withAlpha(alpha * strength).swiftUIColor),
                style: StrokeStyle(lineWidth: cord.width * multiple, lineCap: .round, lineJoin: .round)
            )
        }
    }

    // MARK: - Body

    /// The cord itself: two soft offset passes for the shadow it casts, then the
    /// gradient along its length.
    static func drawBody(_ cord: Cord, in context: inout GraphicsContext, appearance: RopeAppearance) {
        let palette = appearance.palette
        let width = cord.width

        // A lit filament does not cast a dark line under itself, so the contact
        // shadow fades out as the glow comes up.
        let shadowStrength = 1 - appearance.glowStrength.clamped(to: 0...1)
        if shadowStrength > 0.001 {
            let shadowPath = cord.path.applying(CGAffineTransform(translationX: 0, y: width * 0.8))
            context.stroke(
                shadowPath,
                with: .color(.black.opacity(0.10 * shadowStrength)),
                style: StrokeStyle(lineWidth: width * 2.6, lineCap: .round, lineJoin: .round)
            )
            context.stroke(
                shadowPath,
                with: .color(.black.opacity(0.14 * shadowStrength)),
                style: StrokeStyle(lineWidth: width * 1.5, lineCap: .round, lineJoin: .round)
            )
        }

        context.stroke(
            cord.path,
            with: .linearGradient(
                Gradient(colors: [
                    palette.secondary.withAlpha(0.55).swiftUIColor,
                    palette.primary.swiftUIColor
                ]),
                startPoint: cord.anchor,
                endPoint: cord.end
            ),
            style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round)
        )
    }

    /// The lit edge, drawn after the texture so a chain's links do not bury it.
    static func drawHighlight(_ cord: Cord, in context: inout GraphicsContext, appearance: RopeAppearance) {
        let width = cord.width

        // Neon is lit from within rather than from above: its highlight is a bright
        // core down the middle of the cord, not an offset edge.
        if appearance.glowStrength > 0.001 {
            context.stroke(
                cord.path,
                with: .color(appearance.palette.light.withAlpha(0.92).swiftUIColor),
                style: StrokeStyle(lineWidth: max(0.8, width * 0.36), lineCap: .round, lineJoin: .round)
            )
            return
        }

        context.stroke(
            cord.path.applying(CGAffineTransform(translationX: -width * 0.18, y: -width * 0.18)),
            with: .color(appearance.palette.light.withAlpha(0.38).swiftUIColor),
            style: StrokeStyle(lineWidth: max(0.75, width * 0.3), lineCap: .round, lineJoin: .round)
        )
    }

    // MARK: - Texture

    /// Everything one texture pass needs: the cord's own measurements, resolved into
    /// points, plus how strongly to draw it.
    private struct TextureRun {
        var cord: Cord
        var palette: CharmPalette
        var opacity: Double

        /// Length of one repeat along the cord.
        var pitch: Double

        /// How far the lit and shaded passes are offset across the cord.
        var across: Double = 0

        /// Width of a link's lit rim, as a fraction of the cord's width.
        var thickness: Double = 0

        var width: Double { cord.width }
        var path: Path { cord.path }
    }

    /// Whatever runs along the cord: a twist, a braid, or links.
    ///
    /// Every case is a dashed stroke of the path the cord already has. Dashes are
    /// measured along the path, so the pattern follows every bend and stays evenly
    /// spaced as the rope swings, for the cost of a stroke and no offscreen work.
    static func drawTexture(
        _ cord: Cord,
        in context: inout GraphicsContext,
        appearance: RopeAppearance,
        opacity: Double
    ) {
        guard opacity > 0.001, cord.width > 1.4 else { return }
        let palette = appearance.palette

        switch appearance.texture {
        case .twist(let pitch, let offset):
            drawTwist(in: &context, run: TextureRun(
                cord: cord,
                palette: palette,
                opacity: opacity,
                pitch: cord.width * pitch,
                across: cord.width * offset
            ))
        case .braid(let pitch, let offset):
            drawBraid(in: &context, run: TextureRun(
                cord: cord,
                palette: palette,
                opacity: opacity,
                pitch: cord.width * pitch,
                across: cord.width * offset
            ))
        case .links(let pitch, let thickness):
            drawLinks(in: &context, run: TextureRun(
                cord: cord,
                palette: palette,
                opacity: opacity,
                pitch: cord.width * pitch,
                thickness: thickness
            ))
        case .smooth:
            break
        }
    }

    /// Short bands running along the cord, lit on one side and shaded on the other,
    /// offset across it so they read as a spiral rather than as rungs.
    private static func drawTwist(in context: inout GraphicsContext, run: TextureRun) {
        let pitch = run.pitch
        let across = run.across

        context.stroke(
            run.path.applying(CGAffineTransform(translationX: -across, y: -across)),
            with: .color(run.palette.light.withAlpha(0.30 * run.opacity).swiftUIColor),
            style: StrokeStyle(lineWidth: run.width * 0.55, lineCap: .butt, dash: [pitch * 0.42, pitch * 0.58])
        )
        context.stroke(
            run.path.applying(CGAffineTransform(translationX: across, y: across)),
            with: .color(run.palette.deep.withAlpha(0.45 * run.opacity).swiftUIColor),
            style: StrokeStyle(
                lineWidth: run.width * 0.45,
                lineCap: .butt,
                dash: [pitch * 0.34, pitch * 0.66],
                dashPhase: pitch * 0.5
            )
        )
    }

    /// Wider, flatter bands than a twist, and matte: a braided cord catches much less
    /// light than a spun one, so the lit side is softened and the shaded side deepened.
    private static func drawBraid(in context: inout GraphicsContext, run: TextureRun) {
        let pitch = run.pitch
        let across = run.across

        context.stroke(
            run.path.applying(CGAffineTransform(translationX: -across, y: -across * 0.6)),
            with: .color(run.palette.light.withAlpha(0.22 * run.opacity).swiftUIColor),
            style: StrokeStyle(lineWidth: run.width * 0.7, lineCap: .butt, dash: [pitch * 0.5, pitch * 0.5])
        )
        context.stroke(
            run.path.applying(CGAffineTransform(translationX: across, y: across * 0.6)),
            with: .color(run.palette.deep.withAlpha(0.52 * run.opacity).swiftUIColor),
            style: StrokeStyle(
                lineWidth: run.width * 0.62,
                lineCap: .butt,
                dash: [pitch * 0.46, pitch * 0.54],
                dashPhase: pitch * 0.5
            )
        )
        // The seam where the two halves of the braid meet.
        context.stroke(
            run.path,
            with: .color(run.palette.deep.withAlpha(0.28 * run.opacity).swiftUIColor),
            style: StrokeStyle(
                lineWidth: max(0.6, run.width * 0.12),
                lineCap: .butt,
                dash: [pitch * 0.3, pitch * 0.7]
            )
        )
    }

    /// A chain: a dark notch where one link meets the next, a finer notch set half a
    /// pitch along so the links alternate the way a real chain's do, and a lit rim
    /// inside each link.
    private static func drawLinks(in context: inout GraphicsContext, run: TextureRun) {
        let pitch = run.pitch

        context.stroke(
            run.path,
            with: .color(run.palette.deep.withAlpha(0.88 * run.opacity).swiftUIColor),
            style: StrokeStyle(lineWidth: run.width * 1.04, lineCap: .butt, dash: [pitch * 0.16, pitch * 0.84])
        )
        context.stroke(
            run.path,
            with: .color(run.palette.secondary.withAlpha(0.70 * run.opacity).swiftUIColor),
            style: StrokeStyle(
                lineWidth: run.width * 0.9,
                lineCap: .butt,
                dash: [pitch * 0.1, pitch * 0.9],
                dashPhase: pitch * 0.5
            )
        )
        context.stroke(
            run.path.applying(CGAffineTransform(translationX: -run.width * 0.16, y: -run.width * 0.16)),
            with: .color(run.palette.light.withAlpha(0.72 * run.opacity).swiftUIColor),
            style: StrokeStyle(
                lineWidth: run.width * run.thickness * 0.5,
                lineCap: .butt,
                dash: [pitch * 0.44, pitch * 0.56],
                dashPhase: pitch * 0.3
            )
        )
    }
}
