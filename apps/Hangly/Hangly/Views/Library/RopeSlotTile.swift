//
//  RopeSlotTile.swift
//  Hangly
//
//  One place on the rope, and the empty one at the end of the row.
//

import SwiftUI

/// A filled place: the charm, its name, how large it is, and a way to take it off.
struct RopeSlotTile: View {
    /// The colour of the cord, and of the short hanger each place hangs by. Shared
    /// with `CurrentRopeStrip`, which draws the cord these meet.
    static let cordColor = Color.secondary.opacity(0.45)

    /// How far the plate hangs below the cord.
    static let hangerHeight = 15.0

    let slot: RopeSlot

    /// How many places there are in total, so this one can say where it hangs
    /// rather than what number it is.
    let total: Int

    let charm: any Charm
    let isActive: Bool
    let canRemove: Bool
    let onFocus: () -> Void
    let onRemove: () -> Void
    let onSize: (Double) -> Void

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    var body: some View {
        VStack(spacing: 0) {
            hanger

            Button(action: onFocus) {
                CollectiblePlate(isSelected: isActive, cornerRadius: 14) { isHovering in
                    preview(isHovering: isHovering)
                }
            }
            .buttonStyle(.plain)
            .accessibilityLabel("\(slot.name), \(CharmStack.slotName(slot.slot, of: total))")
            .accessibilityAddTraits(isActive ? .isSelected : [])
            .accessibilityHint("Choose a charm below to change this one")

            Text(slot.name)
                .font(.caption.weight(.medium))
                .lineLimit(1)
                .truncationMode(.tail)
                .padding(.top, 9)

            SlotSizeSlider(size: slot.size, name: slot.name, onChange: onSize)
                .padding(.top, 5)
        }
        .frame(width: 124)
    }

    /// The short length of cord between the rope and this place.
    private var hanger: some View {
        Capsule()
            .fill(Self.cordColor)
            .frame(width: 2, height: Self.hangerHeight)
            .accessibilityHidden(true)
    }

    private func preview(isHovering: Bool) -> some View {
        ZStack(alignment: .topTrailing) {
            // Drawn at the size it hangs at, so the row reads as the composition
            // rather than as three equal thumbnails.
            CharmView(charm: charm, inset: 0.78)
                .frame(width: 84 * previewScale, height: 84 * previewScale)
                .frame(width: 108, height: 88)
                .animation(reduceMotion ? nil : Motion.settle, value: slot.size)

            if canRemove {
                Button(action: onRemove) {
                    Image(systemName: "xmark")
                        .font(.system(size: 9, weight: .bold))
                        .padding(5)
                        .background(.thinMaterial, in: Circle())
                }
                .buttonStyle(.plain)
                .padding(5)
                .opacity(isHovering ? 1 : 0)
                .animation(Motion.hover, value: isHovering)
                .help("Take \(slot.name) off the rope")
                .accessibilityLabel("Remove \(slot.name) from the rope")
            }
        }
        .frame(width: 108, height: 88)
    }

    /// The tile is not the rope, so this is flattened: a charm trimmed to 0.6 would
    /// be lost in a thumbnail at true scale, and the point of the row is to show the
    /// balance rather than to measure it.
    private var previewScale: Double {
        0.82 + ((slot.size - RopeCharm.sizeRange.lowerBound) * 0.26)
    }
}

/// How large one place is drawn.
///
/// Commits only while a hand is on it. A `Slider` bound straight to stored state
/// writes back during layout, which is how rope length walked itself from 1.0 to
/// 0.778 to 0.998 with nobody touching it.
struct SlotSizeSlider: View {
    let size: Double
    let name: String
    let onChange: (Double) -> Void

    @State private var draft: Double = 1
    @State private var isEditing = false

    var body: some View {
        Slider(value: $draft, in: RopeCharm.sizeRange) { editing in
            isEditing = editing
            if !editing { onChange(draft) }
        }
        .controlSize(.mini)
        .frame(width: 96)
        .onAppear { draft = size }
        .onChange(of: draft) { _, new in if isEditing { onChange(new) } }
        .onChange(of: size) { _, new in if !isEditing { draft = new } }
        .help("How large \(name) is drawn")
        .accessibilityLabel("\(name) size")
    }
}

/// The place that is not filled yet.
struct AddCharmTile: View {
    let isWaiting: Bool
    let onTap: () -> Void

    @State private var isHovering = false

    var body: some View {
        VStack(spacing: 0) {
            // No hanger: nothing hangs here yet. The space is kept so the empty
            // place lines up with the filled ones.
            Color.clear
                .frame(width: 2, height: RopeSlotTile.hangerHeight)

            Button(action: onTap) {
                label
            }
            .buttonStyle(.plain)
            .hoverLift()
            .onHover { isHovering = $0 }
            .help(isWaiting ? "Choose a charm below" : "Hang another charm on the rope")
            .accessibilityLabel(isWaiting ? "Waiting for a charm" : "Add a charm to the rope")
        }
        .frame(width: 124, alignment: .top)
    }

    private var label: some View {
        VStack(spacing: 6) {
            Image(systemName: isWaiting ? "arrow.down" : "plus")
                .font(.system(size: 15, weight: .medium))
                .symbolEffect(.bounce, value: isWaiting)
            Text(isWaiting ? "Pick one" : "Add Charm")
                .font(.caption)
        }
        .foregroundStyle(isWaiting ? Color.accentColor : Color.secondary)
        .frame(width: 108, height: 88)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.primary.opacity(isHovering ? 0.05 : 0.02))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(
                    isWaiting ? Color.accentColor : Color.secondary.opacity(0.35),
                    style: StrokeStyle(lineWidth: isWaiting ? 2 : 1, dash: [5, 4])
                )
        )
        .animation(Motion.hover, value: isHovering)
    }
}
