//
//  CharmStudioProperties.swift
//  Hangly
//
//  The right column: everything that can be changed about the charm.
//

import SwiftUI

/// Background, name, size, weight and fill: every control in one column.
///
/// Each of the three sliders answers exactly one question, and the app is tested on
/// that — see `StudioControlsTests`. Size is how large the charm is drawn, Weight is
/// how heavy it swings, and Fill is how the picture sits inside its own square.
/// None of them is a disguised version of another.
struct StudioPropertiesPanel: View {
    let viewModel: CharmStudioViewModel

    @FocusState private var nameIsFocused: Bool

    var body: some View {
        ScrollView {
            // Eleven rather than fourteen. The column has three sections, five
            // captions and a floor set by the window, and the three points a gap
            // is what buys room for the tolerance slider that appears when the
            // background method is "Flat background" — the one combination that
            // used to overrun the panel at the window's own default height.
            VStack(alignment: .leading, spacing: 11) {
                StudioBackgroundControls(viewModel: viewModel)

                Divider()

                Text("Charm").font(.headline)

                TextField("Name", text: nameBinding, prompt: Text(viewModel.effectiveName))
                    .textFieldStyle(.roundedBorder)
                    .focused($nameIsFocused)
                    .onChange(of: nameIsFocused) { _, focused in
                        focused ? viewModel.beginEditing() : viewModel.endEditing()
                    }
                    .accessibilityLabel("Charm name")

                SliderRow(
                    title: "Size",
                    valueDescription: viewModel.adjustments.sizeRatio.formatted(.percent.precision(.fractionLength(0))),
                    range: StudioAdjustments.sizeRange,
                    value: continuousBinding(\.sizeRatio),
                    onEditingChanged: editing
                )
                caption("How large it hangs. Nothing to do with how heavy it is.")

                SliderRow(
                    title: "Weight",
                    valueDescription: weightDescription,
                    range: StudioAdjustments.weightRange,
                    value: continuousBinding(\.weightScale),
                    onEditingChanged: editing
                )
                caption("How it swings. It does not change the size.")

                SliderRow(
                    title: "Fill",
                    valueDescription: viewModel.adjustments.fill.formatted(.percent.precision(.fractionLength(0))),
                    range: StudioAdjustments.fillRange,
                    value: continuousBinding(\.fill),
                    onEditingChanged: editing
                )
                caption("How much of its square the picture takes. Not size, not weight.")

                if let draft = viewModel.draft {
                    Divider()
                    Text("Physics").font(.headline)
                    LabeledContent("Mass") {
                        Text(draft.metrics.mass.formatted(.number.precision(.fractionLength(2))))
                            .monospacedDigit()
                    }
                    LabeledContent("Analysed") {
                        Text(draft.analysedMass.formatted(.number.precision(.fractionLength(2))))
                            .monospacedDigit()
                            .foregroundStyle(.secondary)
                    }
                    Text("Mass comes from how much shape there is, times your weight. Fill does not change it.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(14)
        }
    }

    /// One drag is one undo step, said by the control rather than guessed at by a
    /// gesture recogniser sitting over the whole panel.
    private func editing(_ isEditing: Bool) {
        if isEditing {
            viewModel.beginEditing()
        } else {
            viewModel.endEditing()
        }
    }

    private func caption(_ text: String) -> some View {
        Text(text)
            .font(.caption2)
            .foregroundStyle(.tertiary)
            .fixedSize(horizontal: false, vertical: true)
    }

    private var weightDescription: String {
        "×" + viewModel.adjustments.weightScale.formatted(.number.precision(.fractionLength(2)))
    }

    private var nameBinding: Binding<String> {
        Binding(
            get: { viewModel.adjustments.name },
            set: { value in viewModel.apply({ $0.name = value }, recordUndo: false) }
        )
    }

    private func continuousBinding(_ keyPath: WritableKeyPath<StudioAdjustments, Double>) -> Binding<Double> {
        Binding(
            get: { viewModel.adjustments[keyPath: keyPath] },
            set: { value in viewModel.apply({ $0[keyPath: keyPath] = value }, recordUndo: false) }
        )
    }
}
