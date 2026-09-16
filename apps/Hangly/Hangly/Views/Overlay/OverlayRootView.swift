//
//  OverlayRootView.swift
//  Hangly
//
//  Root SwiftUI content hosted inside `OverlayPanel`.
//

import SwiftUI

/// The SwiftUI tree hosted by the overlay panel.
///
/// It never draws a background, because the panel is transparent and any opaque fill
/// would defeat that. Hit testing is narrowed to a disc around the charm, so the
/// overlay stays click-through everywhere else while the charm remains grabbable —
/// and droppable: an image file let go on the charm becomes the charm.
struct OverlayRootView: View {
    /// Not `@State`: the window controller owns the view model for the panel's
    /// lifetime. `@Observable` still tracks the properties read here.
    let viewModel: OverlayViewModel

    var body: some View {
        canvas
        // The one place in the app that draws charms nobody may take away. Every
        // other surface leaves this at `.interface`, and closing Customize forgets
        // what those surfaces rasterised; see `ArtworkUsage`.
        .environment(\.artworkUsage, .overlay)
        .opacity(viewModel.opacity)
        .contentShape(CharmGrabShape(discs: viewModel.grabDiscs))
        .gesture(charmDrag)
        .dropDestination(for: URL.self) { urls, location in
            viewModel.handleDrop(urls, at: location)
        } isTargeted: { targeted in
            viewModel.setDropTargeted(targeted)
        }
        // Decorative: it conveys no information a screen reader needs.
        .accessibilityHidden(true)
    }

    /// The rope and its charm. Built here rather than inline so the development
    /// overlay can be attached to it without an `#if` inside the view body.
    private var canvas: RopeCanvasView {
        var view = RopeCanvasView(
            snapshot: viewModel.snapshot,
            charmSlots: viewModel.charmSlots,
            ropeAppearance: viewModel.ropeAppearance,
            ropeStyleLayers: viewModel.ropeStyleLayers,
            weather: viewModel.weather,
            isDropTargeted: viewModel.isDropTargeted,
            isAirDropTargeted: viewModel.isAirDropTargeted,
            airDropTargetSlot: viewModel.airDropTargetSlot,
            airDropLabel: viewModel.airDropLabel,
            importSpinnerAngle: viewModel.importSpinnerAngle
        )
        #if !HANGLY_PRODUCTION
        view.isDebugEnabled = viewModel.isDebugEnabled
        view.debugSummary = viewModel.debugSummary
        #endif
        return view
    }

    /// `minimumDistance: 0` so the charm responds on press rather than after the
    /// cursor has already travelled, which otherwise feels like a dropped grab.
    private var charmDrag: some Gesture {
        DragGesture(minimumDistance: 0, coordinateSpace: .local)
            .onChanged { value in
                viewModel.dragChanged(
                    location: value.location,
                    velocity: CGPoint(x: value.velocity.width, y: value.velocity.height)
                )
            }
            .onEnded { value in
                viewModel.dragEnded(
                    location: value.location,
                    velocity: CGPoint(x: value.velocity.width, y: value.velocity.height)
                )
            }
    }
}
