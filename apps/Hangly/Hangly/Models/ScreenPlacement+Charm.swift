//
//  ScreenPlacement+Charm.swift
//  Hangly
//
//  Where the charm hangs, as a point on the screen rather than as an offset.
//

import CoreGraphics

/// Turning "there" into an anchor and an offset, and back.
///
/// The window layer wants an anchor and a nudge in points, because that is what
/// survives a display changing size. A person dragging a charm across a picture of
/// their screen wants none of that: they want the charm where the pointer is. These
/// two functions are the translation, and they are exact inverses — which is the
/// whole of what makes the drag feel direct.
///
/// The previous mapping was not positional at all. The miniature's full width stood
/// for the offset *range* (six hundred points), not for the screen, so dragging from
/// one side to the other moved the charm six hundred points on a display that might
/// be two thousand wide — and crossing between the anchor bands changed what the
/// stored number meant, which is the jump that read as quantisation.
extension ScreenPlacement {
    /// An anchor and the nudge that goes with it.
    struct Placement: Equatable, Sendable {
        var anchor: OverlayAnchor
        var offset: CGPoint
    }

    /// Where the rope is pinned, as a fraction of the screen: `0` is the left edge,
    /// `1` the right, and `y` grows downward from the top.
    static func unitPoint(
        for placement: Placement,
        size: CGSize,
        in bounds: CGRect,
        edgeInset: CGFloat = 0
    ) -> CGPoint {
        guard bounds.width > 0, bounds.height > 0 else { return CGPoint(x: 0.5, y: 0) }

        let column = anchoredOriginX(placement.anchor, size: size, in: bounds, edgeInset: edgeInset)
            + placement.offset.x
            + (size.width / 2)
        return CGPoint(
            x: ((column - bounds.minX) / bounds.width).clamped(to: 0...1),
            y: (((edgeInset + placement.offset.y) / bounds.height)).clamped(to: 0...1)
        )
    }

    /// The anchor and offset that pin the rope at this fraction of the screen.
    ///
    /// The anchor is chosen by which third of the screen the charm is in, so that a
    /// charm near an edge stays near that edge when the display changes and one in
    /// the middle stays in the middle. The offset is then whatever it takes to land
    /// exactly where asked — which is what keeps the two bands from disagreeing at
    /// the boundary between them.
    static func placement(
        forUnit unit: CGPoint,
        size: CGSize,
        in bounds: CGRect,
        edgeInset: CGFloat = 0
    ) -> Placement {
        guard bounds.width > 0, bounds.height > 0 else {
            return Placement(anchor: .topCenter, offset: .zero)
        }

        let x = unit.x.clamped(to: 0...1)
        let anchor: OverlayAnchor = x < bandWidth ? .topLeading : (x > 1 - bandWidth ? .topTrailing : .topCenter)

        let column = bounds.minX + (x * bounds.width)
        let origin = anchoredOriginX(anchor, size: size, in: bounds, edgeInset: edgeInset)
        let horizontal = column - (size.width / 2) - origin
        let vertical = (unit.y.clamped(to: 0...1) * bounds.height) - edgeInset

        return Placement(
            anchor: anchor,
            offset: CGPoint(
                x: Double(horizontal).clamped(to: OverlaySettings.Limits.horizontalOffset),
                y: Double(vertical).clamped(to: OverlaySettings.Limits.verticalOffset)
            )
        )
    }

    /// How much of the screen each edge band claims.
    static let bandWidth = 1.0 / 3.0

    /// The window's left edge for an anchor before any offset — the same three
    /// cases `frame(for:anchor:in:offset:edgeInset:)` uses, stated once so the
    /// forward and reverse mappings cannot drift apart.
    static func anchoredOriginX(
        _ anchor: OverlayAnchor,
        size: CGSize,
        in bounds: CGRect,
        edgeInset: CGFloat
    ) -> CGFloat {
        switch anchor.horizontal {
        case .leading: bounds.minX + edgeInset
        case .center: bounds.midX - (size.width / 2)
        case .trailing: bounds.maxX - size.width - edgeInset
        }
    }
}
