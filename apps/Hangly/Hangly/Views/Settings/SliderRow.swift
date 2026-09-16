//
//  SliderRow.swift
//  Hangly
//
//  Reusable labelled slider.
//

import SwiftUI

/// A form row pairing a slider with its current value.
///
/// The read-out uses monospaced digits and a fixed width so the row does not shift
/// horizontally while the user drags.
///
/// The value is committed only while a hand is on the control. A `Slider` bound
/// straight to stored state writes back during layout — SwiftUI quantises the value
/// to the pixel the knob lands on and reports that as a change — so simply opening
/// a window nudged every slider in it. Harmless-looking, and not: in the Studio each
/// of those writes re-ran the image pipeline, so a page that had been merely opened
/// was already busy recomputing a charm nobody had touched.
struct SliderRow: View {
    let title: String
    let valueDescription: String
    let range: ClosedRange<Double>
    @Binding var value: Double

    /// Called as a drag starts and ends, for callers that record undo steps.
    var onEditingChanged: (Bool) -> Void = { _ in }

    @State private var draft = 0.0
    @State private var isEditing = false

    var body: some View {
        LabeledContent {
            HStack(spacing: 10) {
                Slider(value: $draft, in: range) { editing in
                    isEditing = editing
                    onEditingChanged(editing)
                    if !editing { value = draft }
                }
                .accessibilityLabel(title)
                .accessibilityValue(valueDescription)
                .onAppear { draft = value }
                // Live while dragging, so the preview follows the hand; ignored
                // otherwise, which is what makes layout's write-back a no-op.
                .onChange(of: draft) { _, new in if isEditing { value = new } }
                .onChange(of: value) { _, new in if !isEditing { draft = new } }

                Text(valueDescription)
                    .font(.callout.monospacedDigit())
                    .foregroundStyle(.secondary)
                    .frame(width: 58, alignment: .trailing)
            }
        } label: {
            Text(title)
        }
    }
}
