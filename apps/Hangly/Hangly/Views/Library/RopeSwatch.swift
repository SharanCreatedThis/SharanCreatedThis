//
//  RopeSwatch.swift
//  Hangly
//
//  A short length of cord, drawn by the same renderer the overlay uses.
//

import SwiftUI

/// A piece of rope, at the size a card can show it.
///
/// Drawn rather than pictured. Every style is defined by how it is rendered — a
/// twist, a braid, links, a lit filament — so a screenshot of one would go stale the
/// first time the renderer changed, and a rope drawn by anything other than the rope
/// renderer would be a drawing of a different app.
struct RopeSwatch: View {
    let style: RopeStyle

    /// The charm radius the cord's thickness is taken against. Cords are sized in
    /// proportion to what they carry, so a swatch has to name a charm to be a
    /// believable thickness.
    /// Larger than anything that actually hangs. A cord is sized against what it
    /// carries, and at true proportions every style is a hairline a point or two
    /// wide — which is fine on a rope and useless on a card, where the texture is
    /// the entire thing being chosen between.
    var charmRadius = 86.0

    var body: some View {
        Canvas { context, size in
            let appearance = style.appearance
            let x = size.width / 2
            let top = CGPoint(x: x, y: 4)
            let bottom = CGPoint(x: x, y: size.height - 4)

            var path = Path()
            path.move(to: top)
            path.addLine(to: bottom)

            let cord = Cord(
                path: path,
                width: RopeStyleRenderer.width(for: appearance, charmRadius: charmRadius),
                anchor: top,
                end: bottom
            )

            RopeStyleRenderer.drawGlow(cord, in: &context, appearance: appearance)
            RopeStyleRenderer.drawBody(cord, in: &context, appearance: appearance)
            RopeStyleRenderer.drawTexture(cord, in: &context, appearance: appearance, opacity: 1)
            RopeStyleRenderer.drawHighlight(cord, in: &context, appearance: appearance)
        }
        .accessibilityHidden(true)
    }
}
