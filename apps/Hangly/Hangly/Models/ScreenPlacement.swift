//
//  ScreenPlacement.swift
//  Hangly
//
//  Pure geometry for positioning the overlay. Deliberately AppKit-free.
//

import CoreGraphics

/// Computes the overlay's frame inside a screen's usable bounds.
///
/// Kept free of AppKit so the placement rules can be unit-tested on any machine,
/// with no attached display and no window server.
///
/// All rectangles use AppKit's coordinate convention: the origin is bottom-left and
/// `y` grows upward, so the "top" of a rect is `maxY`.
enum ScreenPlacement {
    /// - Parameters:
    ///   - size: Desired overlay size in points.
    ///   - anchor: Which corner/edge to hang from.
    ///   - bounds: The screen region to place within, in global screen coordinates.
    ///   - offset: User nudge. `x` positive moves right, `y` positive moves *down*.
    ///   - edgeInset: Margin kept between the overlay and the screen edges.
    /// - Returns: A frame in global screen coordinates, clamped to `bounds` when it fits.
    static func frame(
        for size: CGSize,
        anchor: OverlayAnchor,
        in bounds: CGRect,
        offset: CGPoint = .zero,
        edgeInset: CGFloat = 0
    ) -> CGRect {
        let originX = anchoredOriginX(anchor, size: size, in: bounds, edgeInset: edgeInset)

        // Top-anchored: the overlay's top edge sits just under the top of `bounds`.
        let originY = bounds.maxY - size.height - edgeInset

        let proposed = CGRect(
            x: originX + offset.x,
            y: originY - offset.y,
            width: size.width,
            height: size.height
        )

        return clampAnchorPoint(proposed, within: bounds)
    }

    /// Keeps the point the charm hangs from on screen, rather than the whole window.
    ///
    /// The overlay is mostly empty: a wide, tall, transparent canvas with a rope
    /// down the middle of it, sized so the charm has room to swing. Insisting that
    /// all of it stay on screen therefore stops the charm about half a window short
    /// of either edge — which is exactly the "cannot reach the left or right edge"
    /// that made the position control feel like it had dead zones. What has to stay
    /// on screen is the rope, and the rope is at the top centre.
    static func clampAnchorPoint(_ rect: CGRect, within bounds: CGRect) -> CGRect {
        guard bounds.width > 0, bounds.height > 0 else { return rect }

        let column = rect.midX.clamped(to: bounds.minX...bounds.maxX)
        let top = rect.maxY.clamped(to: bounds.minY...bounds.maxY)
        return CGRect(
            x: column - (rect.width / 2),
            y: top - rect.height,
            width: rect.width,
            height: rect.height
        )
    }

    /// Keeps `rect` fully inside `bounds` when it is small enough to fit.
    /// Oversized rects are returned untouched so the caller can decide what to do.
    static func clamp(_ rect: CGRect, within bounds: CGRect) -> CGRect {
        guard rect.width <= bounds.width, rect.height <= bounds.height else { return rect }

        let x = min(max(rect.minX, bounds.minX), bounds.maxX - rect.width)
        let y = min(max(rect.minY, bounds.minY), bounds.maxY - rect.height)
        return CGRect(x: x, y: y, width: rect.width, height: rect.height)
    }
}
