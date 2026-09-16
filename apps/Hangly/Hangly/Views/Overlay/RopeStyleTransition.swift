//
//  RopeStyleTransition.swift
//  Hangly
//
//  The quarter-second in which one cord becomes another.
//

import Foundation

/// Carries the cord's *look* from one style to the next.
///
/// Only the look. A style's physics are handed to the solver the instant the user
/// picks it and are never eased, because someone dragging down the Rope menu is
/// comparing how the styles feel and a cord that took a quarter of a second to
/// answer would be answering a question they had stopped asking. What eases is the
/// drawing, so that a gold chain does not appear out of a thread between two frames.
///
/// A value type with no dependencies, so the interpolation can be tested directly
/// rather than inferred from what the overlay happens to look like.
struct RopeStyleTransition: Equatable {
    /// Long enough to read as a deliberate change, short enough to feel immediate.
    static let duration: TimeInterval = 0.25

    private(set) var style: RopeStyle
    private var outgoing: RopeStyle?
    private var progress: Double = 1

    init(style: RopeStyle) {
        self.style = style
    }

    /// Whether a change is still in flight. Checked before advancing, because the
    /// view model holds this in an observable property and a mutation it did not
    /// need would invalidate the overlay on a frame with nothing to show.
    var isRunning: Bool {
        progress < 1
    }

    /// The cord's blended look this frame.
    var appearance: RopeAppearance {
        guard let outgoing, isRunning else { return style.appearance }
        return .interpolate(from: outgoing.appearance, to: style.appearance, progress: eased)
    }

    /// The style or styles whose texture and beads are drawn this frame: one at
    /// rest, two while a change is in flight.
    var layers: [RopeStyleLayer] {
        guard let outgoing, isRunning else {
            return [RopeStyleLayer(style: style, opacity: 1)]
        }
        return [
            RopeStyleLayer(style: outgoing, opacity: 1 - eased),
            RopeStyleLayer(style: style, opacity: eased)
        ]
    }

    /// Starts a change.
    /// - Parameter immediately: Skip the cross-fade, for Reduce Motion. The new cord
    ///   is simply there.
    mutating func begin(_ newStyle: RopeStyle, immediately: Bool = false) {
        guard newStyle != style else { return }
        // Interrupting a change starts from whichever style was on its way out, not
        // from the blend on screen, because a blend is not a style and there is
        // nothing to interpolate from halfway.
        outgoing = immediately ? nil : style
        style = newStyle
        progress = immediately ? 1 : 0
    }

    mutating func advance(by deltaTime: TimeInterval) {
        guard isRunning else { return }
        progress = min(1, progress + (deltaTime / Self.duration))
        if progress >= 1 {
            outgoing = nil
        }
    }

    /// Ease in and out, so the change starts and finishes gently.
    private var eased: Double {
        let clamped = progress.clamped(to: 0...1)
        return clamped * clamped * (3 - (2 * clamped))
    }
}
