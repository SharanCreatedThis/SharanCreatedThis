//
//  DesktopPositionPicker.swift
//  Hangly
//
//  Putting the charm where you want it by putting it there.
//

import AppKit
import SwiftUI

/// A miniature of the display, with the real charm on it, that you drag.
///
/// This replaced a corner menu and two offset sliders, and then had to be replaced
/// itself. The first version drew a screen but did not mean one: the width of the
/// picture stood for the *offset range* rather than for the display, so a full drag
/// moved the charm six hundred points however wide the screen was, and crossing
/// between anchor thirds changed what the stored number meant — a jump that read as
/// lag and quantisation. The arithmetic now goes through the same geometry the
/// window layer uses, so a point on this picture is a point on the display.
struct DesktopPositionPicker: View {
    @Binding var anchor: OverlayAnchor
    @Binding var horizontalOffset: Double
    @Binding var verticalOffset: Double

    /// Drawn hanging from the rope, at the size it hangs at.
    let charm: any Charm

    /// How far down the rope reaches, so the preview lengthens with the setting.
    let ropeLength: Double

    /// How large the charm is drawn, for the same reason.
    let charmSize: Double

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    /// Held while a drag is in flight so the charm follows the pointer exactly,
    /// rather than being routed through the settings store and back every frame.
    @State private var dragging: CGPoint?
    @State private var isHovering = false

    /// How far down the screen the rope may be pinned. The charm hangs from near
    /// the menu bar, so the useful band is the top third rather than the whole.
    static let verticalBand: ClosedRange<Double> = 0...0.34

    var body: some View {
        GeometryReader { proxy in
            let screen = CGRect(origin: .zero, size: proxy.size)
            ZStack(alignment: .topLeading) {
                desktop
                hangly(in: screen)
            }
            .contentShape(Rectangle())
            .gesture(drag(in: screen))
        }
        .aspectRatio(Self.displayAspect, contentMode: .fit)
        // A picture of a screen, not a screen. Left to fill the page it became the
        // page, and everything it was meant to sit above went below the fold.
        .frame(maxWidth: 460)
        .onHover { isHovering = $0 }
        .accessibilityRepresentation {
            // A drag needs a pointer, so the same two values are offered plainly.
            VStack {
                Slider(value: $horizontalOffset, in: OverlaySettings.Limits.horizontalOffset)
                    .accessibilityLabel("Horizontal position")
                Slider(value: $verticalOffset, in: OverlaySettings.Limits.verticalOffset)
                    .accessibilityLabel("Vertical position")
            }
        }
    }

    /// The shape of the display this is a picture of, so the miniature is not a
    /// picture of some other computer.
    static var displayAspect: Double {
        let bounds = NSScreen.hanglyPreferred?.hanglyPlacementBounds(ignoringMenuBar: true)
        guard let bounds, bounds.height > 0 else { return 16.0 / 10.0 }
        return bounds.width / bounds.height
    }

    // MARK: - Drawing

    private var desktop: some View {
        RoundedRectangle(cornerRadius: 12, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [Color(white: 0.26), Color(white: 0.12)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay(alignment: .top) {
                // The menu bar, because the charm hangs off it and a picture of a
                // screen without one is a picture of a rectangle.
                Rectangle()
                    .fill(.white.opacity(0.13))
                    .frame(height: 9)
                    .clipShape(UnevenRoundedRectangle(topLeadingRadius: 12, topTrailingRadius: 12))
            }
            .overlay {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(.white.opacity(isHovering ? 0.3 : 0.14), lineWidth: 1)
            }
            .animation(Motion.hover, value: isHovering)
    }

    private func hangly(in screen: CGRect) -> some View {
        let pin = dragging ?? point(in: screen)
        let drop = screen.height * RopeConfiguration.Layout.lengthFraction * ropeLength * Self.ropeScale
        let radius = max(7, screen.height * Self.charmScale * charmSize)

        return ZStack(alignment: .topLeading) {
            Path { path in
                path.move(to: pin)
                path.addLine(to: CGPoint(x: pin.x, y: pin.y + drop))
            }
            .stroke(.white.opacity(0.5), style: StrokeStyle(lineWidth: 1.4, lineCap: .round))

            CharmView(charm: charm, inset: 0.95)
                .frame(width: radius * 2, height: radius * 2)
                .position(x: pin.x, y: pin.y + drop + radius)
                .shadow(color: .black.opacity(0.4), radius: 4, y: 2)
        }
        .scaleEffect(dragging == nil ? 1 : 1.06, anchor: .top)
        .animation(reduceMotion ? nil : Motion.press, value: dragging == nil)
        .allowsHitTesting(false)
    }

    /// The rope in the miniature is shortened against the real proportion: at true
    /// scale the charm would hang below the picture, because the picture is a third
    /// of the height of the screen and the rope is not.
    private static let ropeScale = 0.30

    /// The charm's radius as a fraction of the miniature's height.
    private static let charmScale = 0.055

    // MARK: - Dragging

    private func drag(in screen: CGRect) -> some Gesture {
        DragGesture(minimumDistance: 0, coordinateSpace: .local)
            .onChanged { value in
                let top = screen.height * Self.verticalBand.lowerBound
                let bottom = screen.height * Self.verticalBand.upperBound
                let spot = CGPoint(
                    x: value.location.x.clamped(to: screen.minX...screen.maxX),
                    y: value.location.y.clamped(to: top...bottom)
                )
                dragging = spot
                write(spot, in: screen)
            }
            .onEnded { _ in dragging = nil }
    }

    private func point(in screen: CGRect) -> CGPoint {
        let unit = Self.geometry.unitPoint(
            anchor: anchor,
            horizontalOffset: horizontalOffset,
            verticalOffset: verticalOffset
        )
        return CGPoint(x: screen.minX + (screen.width * unit.x), y: screen.minY + (screen.height * unit.y))
    }

    private func write(_ spot: CGPoint, in screen: CGRect) {
        guard screen.width > 0, screen.height > 0 else { return }
        let unit = CGPoint(x: spot.x / screen.width, y: spot.y / screen.height)
        let placement = Self.geometry.placement(forUnit: unit)
        anchor = placement.anchor
        horizontalOffset = placement.offset.x
        verticalOffset = placement.offset.y
    }

    /// The display and window the arithmetic is done against, read once per drag
    /// rather than per frame.
    static var geometry: OverlayGeometry { OverlayGeometry.current }
}

/// The display the charm is on and the window it hangs in, as the mapping needs
/// them.
///
/// A value rather than a lookup so the picker can be driven in a test with a made-up
/// display, and so that dragging does not ask AppKit for the screen sixty times a
/// second.
struct OverlayGeometry: Sendable {
    var bounds: CGRect
    var windowSize: CGSize
    var edgeInset: CGFloat

    static var current: OverlayGeometry {
        let bounds = NSScreen.hanglyPreferred?.hanglyPlacementBounds(ignoringMenuBar: true)
            ?? CGRect(x: 0, y: 0, width: 1440, height: 900)
        return OverlayGeometry(
            bounds: bounds,
            windowSize: AppConstants.Overlay.baseSize,
            edgeInset: AppConstants.Overlay.edgeInset
        )
    }

    func unitPoint(anchor: OverlayAnchor, horizontalOffset: Double, verticalOffset: Double) -> CGPoint {
        ScreenPlacement.unitPoint(
            for: ScreenPlacement.Placement(
                anchor: anchor,
                offset: CGPoint(x: horizontalOffset, y: verticalOffset)
            ),
            size: windowSize,
            in: bounds,
            edgeInset: edgeInset
        )
    }

    func placement(forUnit unit: CGPoint) -> ScreenPlacement.Placement {
        ScreenPlacement.placement(forUnit: unit, size: windowSize, in: bounds, edgeInset: edgeInset)
    }
}
