//
//  CurrentRopeStrip.swift
//  Hangly
//
//  What is on the rope right now, at the top of the Library.
//

import SwiftUI
import UniformTypeIdentifiers

/// The rope, as a row of places you can fill, empty, reorder and resize.
///
/// This replaces a count control and a set of pickers. A count told you how many
/// charms there were and nothing about which; the pickers told you which and nothing
/// about where. Places tell you both at once, and the number falls out of them.
///
/// The places hang from a drawn cord. It is three points of colour and it is the
/// difference between a row of tiles that happen to be next to each other and a rope
/// with things on it — which is what the section is called and what it is for.
struct CurrentRopeStrip: View {
    @Bindable var viewModel: CharmLibraryViewModel

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    /// The place being dragged, if any. Held here rather than in the view model
    /// because it is a gesture in progress, not a fact about the rope.
    @State private var dragging: Int?

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            header
            row
        }
        // Sized by what is in it. The band is one of three things stacked down
        // the page and the grid below it is the one that grows; without this the
        // band quietly keeps a share of the slack and the rope floats in a third
        // of the window with nothing under it.
        .fixedSize(horizontal: false, vertical: true)
        .frame(maxWidth: .infinity, alignment: .leading)
        .animation(motion, value: viewModel.ropeSlots.count)
    }

    // MARK: - Header

    private var header: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 3) {
                BandLabel(text: "Current Rope")
                Text(composition)
                    .font(.system(.title3, design: .rounded).weight(.semibold))
            }
            Spacer()
            Text(hint)
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .accessibilityElement(children: .combine)
    }

    /// What is hanging, in words: the count and the cord it hangs on.
    private var composition: String {
        let count = viewModel.ropeSlots.count
        let charms = count == 1 ? "1 charm" : "\(count) charms"
        return "\(charms) on \(viewModel.currentRope.displayName)"
    }

    // MARK: - The rope itself

    private var row: some View {
        HStack(alignment: .top, spacing: 0) {
            HStack(alignment: .top, spacing: 14) {
                ForEach(viewModel.ropeSlots) { slot in
                    tile(for: slot)
                }

                if viewModel.canAddSlot {
                    AddCharmTile(
                        isWaiting: viewModel.isAddingSlot,
                        onTap: {
                            withAnimation(motion) {
                                viewModel.isAddingSlot ? viewModel.cancelAddingSlot() : viewModel.beginAddingSlot()
                            }
                        }
                    )
                }
            }
            .background(alignment: .top) { cord }

            Spacer(minLength: 0)
        }
    }

    private func tile(for slot: RopeSlot) -> some View {
        RopeSlotTile(
            slot: slot,
            total: viewModel.ropeSlots.count,
            charm: viewModel.charm(for: slot.charm),
            isActive: !viewModel.isAddingSlot && viewModel.dressedSlot == slot.slot,
            canRemove: viewModel.canRemoveSlot,
            onFocus: { viewModel.focus(slot: slot.slot) },
            onRemove: { withAnimation(motion) { viewModel.remove(slot: slot.slot) } },
            onSize: { viewModel.setSize($0, at: slot.slot) }
        )
        .opacity(dragging == slot.slot ? 0.35 : 1)
        .onDrag {
            dragging = slot.slot
            return NSItemProvider(object: String(slot.slot) as NSString)
        }
        .onDrop(
            of: [.plainText],
            delegate: RopeSlotDropDelegate(
                destination: slot.slot,
                dragging: $dragging,
                move: { source, destination in
                    withAnimation(motion) { viewModel.move(from: source, to: destination) }
                }
            )
        )
    }

    /// The cord the places hang from. Fades at both ends rather than stopping, so
    /// the row does not look like a diagram with a beginning and an end.
    private var cord: some View {
        LinearGradient(
            colors: [
                RopeSlotTile.cordColor.opacity(0.15),
                RopeSlotTile.cordColor,
                RopeSlotTile.cordColor,
                RopeSlotTile.cordColor.opacity(0.15)
            ],
            startPoint: .leading,
            endPoint: .trailing
        )
        .frame(height: 3)
        .clipShape(Capsule())
        .accessibilityHidden(true)
    }

    private var motion: Animation? {
        reduceMotion ? nil : Motion.settle
    }

    private var hint: String {
        if viewModel.isAddingSlot {
            return "Pick a charm below"
        }
        return viewModel.canAddSlot ? "Drag to reorder · up to three" : "Drag to reorder"
    }
}

/// Reordering by dropping one place onto another.
///
/// A drop that lands where it started is not a move, and asking the stack to
/// perform it would rebuild the rope for nothing — so it is filtered here rather
/// than left for the model to notice.
private struct RopeSlotDropDelegate: DropDelegate {
    let destination: Int
    @Binding var dragging: Int?
    let move: (Int, Int) -> Void

    func dropEntered(info: DropInfo) {
        guard let source = dragging, source != destination else { return }
        move(source, destination)
        dragging = destination
    }

    func performDrop(info: DropInfo) -> Bool {
        dragging = nil
        return true
    }

    func dropUpdated(info: DropInfo) -> DropProposal? {
        DropProposal(operation: .move)
    }
}
