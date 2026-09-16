//
//  HanglyStyle.swift
//  Hangly
//
//  The handful of shared looks and motions the windows are built from.
//

import SwiftUI

/// Spacing, in the few sizes the app actually uses.
///
/// Five numbers rather than a scale with a name for every step. The point is that
/// two things a page apart do not end up fourteen and sixteen points from their
/// neighbours for no reason anybody can reconstruct later.
enum Space {
    /// Between a label and the thing it labels.
    static let tight = 6.0
    /// Between controls in a group.
    static let snug = 10.0
    /// Between groups.
    static let regular = 16.0
    /// Between sections of a page.
    static let section = 26.0
    /// Page margins.
    static let page = 26.0
}

/// How things move when they are touched.
///
/// One spring, used everywhere, because a window where each control has its own
/// idea of how quickly to respond reads as several programs sharing a frame. Quick
/// enough to feel immediate, damped enough not to wobble.
enum Motion {
    static let press = Animation.spring(response: 0.24, dampingFraction: 0.72)
    static let hover = Animation.easeOut(duration: 0.14)
    static let settle = Animation.spring(response: 0.34, dampingFraction: 0.8)
}

/// A quiet button that brightens under the pointer and gives under the click.
///
/// Deliberately a material rather than Liquid Glass: `glassEffect` arrived in
/// macOS 26 and Hangly runs on 14, so the glass here is the material the glass
/// API itself falls back to. The visual goal is the same — something that belongs
/// to the surface behind it rather than sitting on top of it.
struct SoftButtonStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var isHovering = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background {
                Capsule(style: .continuous)
                    .fill(.regularMaterial)
                    .overlay {
                        Capsule(style: .continuous)
                            .fill(.white.opacity(isHovering ? 0.08 : 0))
                    }
                    .overlay {
                        Capsule(style: .continuous)
                            .strokeBorder(.white.opacity(isHovering ? 0.22 : 0.1), lineWidth: 1)
                    }
            }
            .scaleEffect(scale(pressed: configuration.isPressed))
            .animation(reduceMotion ? nil : Motion.press, value: configuration.isPressed)
            .animation(reduceMotion ? nil : Motion.hover, value: isHovering)
            .onHover { isHovering = $0 }
            .contentShape(Capsule(style: .continuous))
    }

    private func scale(pressed: Bool) -> Double {
        guard !reduceMotion else { return 1 }
        if pressed { return 0.96 }
        return isHovering ? 1.02 : 1
    }
}

/// Lifts a view slightly under the pointer.
///
/// For things that are already drawn as a surface — a card, a tile — where a
/// background change would fight the artwork on them.
struct HoverLift: ViewModifier {
    var amount = 1.02

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var isHovering = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(isHovering && !reduceMotion ? amount : 1)
            .animation(reduceMotion ? nil : Motion.hover, value: isHovering)
            .onHover { isHovering = $0 }
    }
}

extension View {
    /// See ``HoverLift``.
    func hoverLift(_ amount: Double = 1.02) -> some View {
        modifier(HoverLift(amount: amount))
    }
}

/// The surface every collectible in the Library sits on.
///
/// One type rather than the same eight modifiers copied onto a charm card, a rope
/// card and a place on the rope. They had drifted — different radii, different
/// resting fills, a ring on one and a tint on another — and a gallery whose frames
/// do not match reads as a list of controls however nice each control is.
///
/// Hover is owned here and handed back to the caller, so a card's own hover-only
/// parts (the favourite star, the remove button) turn on with the surface instead of
/// tracking the pointer a second time and disagreeing about where it is.
struct CollectiblePlate<Content: View>: View {
    var isSelected = false
    var cornerRadius = 16.0

    /// Whether the pointer is over the plate.
    @ViewBuilder var content: (Bool) -> Content

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var isHovering = false

    var body: some View {
        content(isHovering)
            .background {
                shape
                    .fill(.quaternary.opacity(isHovering ? 0.8 : 0.5))
                    .overlay { shape.fill(Color.accentColor.opacity(isSelected ? 0.16 : 0)) }
            }
            .overlay {
                // `primary` rather than white: a white hairline is invisible on a
                // light window, which is how the cards came to have no edge at all
                // in one of the two appearances the app runs in.
                shape.strokeBorder(
                    isSelected ? AnyShapeStyle(Color.accentColor) : AnyShapeStyle(Color.primary.opacity(0.09)),
                    lineWidth: isSelected ? 1.5 : 1
                )
            }
            // Lifted rather than brightened. The artwork is the point of these
            // cards, and a card that changes colour under the pointer changes the
            // colour the charm is being judged against.
            .shadow(color: .black.opacity(shadowOpacity), radius: isHovering ? 11 : 4, y: isHovering ? 4 : 2)
            .scaleEffect(isHovering && !reduceMotion ? 1.025 : 1)
            .animation(reduceMotion ? nil : Motion.hover, value: isHovering)
            .animation(reduceMotion ? nil : Motion.settle, value: isSelected)
            .onHover { isHovering = $0 }
            .contentShape(shape)
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
    }

    private var shadowOpacity: Double {
        isHovering ? 0.14 : 0.05
    }
}

/// A small, tracked, upper-case label — the one used above each band of the Library.
struct BandLabel: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption2.weight(.semibold))
            .tracking(0.8)
            .textCase(.uppercase)
            .foregroundStyle(.tertiary)
    }
}
