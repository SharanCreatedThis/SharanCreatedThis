//
//  CharmStudioPanels.swift
//  Hangly
//
//  The source panel (what came in, how the background goes) and the properties
//  panel (what the charm becomes).
//

import SwiftUI

/// The left column: the picture that came in, and nothing to fiddle with.
///
/// Kept as a reference rather than a workspace. What it is for is comparison — is
/// the cut-out losing an ear, is that shadow in the original or something the
/// removal invented — so it wants to be visible while the middle of the window is
/// being judged, and wants no controls of its own competing for the look.
struct StudioSourcePanel: View {
    let viewModel: CharmStudioViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Original")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)

            if let image = viewModel.sourceImage {
                Image(decorative: image, scale: 1)
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: .infinity)
                    .background(Color.primary.opacity(0.05), in: RoundedRectangle(cornerRadius: 10))
                    .accessibilityLabel("Source image, \(image.width) by \(image.height) pixels")
            }

            if let url = viewModel.sourceURL {
                Text(url.lastPathComponent)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .truncationMode(.middle)
            }
            if let image = viewModel.sourceImage {
                Text("\(image.width) × \(image.height)")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .monospacedDigit()
            }

            Spacer(minLength: 0)
        }
        .frame(maxHeight: .infinity, alignment: .top)
        .padding(14)
    }
}

/// How the background goes. Lives with the other controls, on the right.
struct StudioBackgroundControls: View {
    let viewModel: CharmStudioViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
                Text("Background").font(.headline)
                Picker("Method", selection: methodBinding) {
                    ForEach(SubjectRemoval.Kind.allCases, id: \.self) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.radioGroup)
                .labelsHidden()
                .accessibilityLabel("Background removal method")

            methodDetail
        }
    }

    /// Only the parts that apply to the chosen method.
    @ViewBuilder private var methodDetail: some View {
        switch viewModel.adjustments.removal {
        case .detectedSubject(let instance):
            if viewModel.detection.instanceCount > 1 {
                Picker("Subject", selection: instanceBinding(current: instance)) {
                    Text("All").tag(Int?.none)
                    ForEach(1...viewModel.detection.instanceCount, id: \.self) { number in
                        Text("\(number)").tag(Int?.some(number))
                    }
                }
                .pickerStyle(.segmented)
                .accessibilityLabel("Which detected subject to keep")
            } else if !viewModel.detection.hasSubject {
                Text("No subject was detected in this image.")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        case .flatBackground(let tolerance):
            SliderRow(
                title: "Tolerance",
                valueDescription: "\(tolerance)",
                range: Self.toleranceSliderRange,
                value: toleranceBinding(current: tolerance)
            )
            Text("How different from the corner colour a pixel may be and still count as background.")
                .font(.caption)
                .foregroundStyle(.secondary)
        case .automatic:
            Text("Existing transparency is kept. Otherwise the detected subject is used, then a flat-background fill.")
                .font(.caption)
                .foregroundStyle(.secondary)
        case .keepOriginal:
            Text("The image is used exactly as it is.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private static let toleranceSliderRange: ClosedRange<Double> =
        Double(StudioAdjustments.toleranceRange.lowerBound)...Double(StudioAdjustments.toleranceRange.upperBound)

    private var methodBinding: Binding<SubjectRemoval.Kind> {
        Binding(
            get: { viewModel.adjustments.removal.kind },
            set: { kind in
                viewModel.apply { adjustments in
                    switch kind {
                    case .automatic: adjustments.removal = .automatic
                    case .detectedSubject: adjustments.removal = .detectedSubject(instance: nil)
                    case .flatBackground:
                        adjustments.removal = .flatBackground(tolerance: SubjectRemoval.defaultTolerance)
                    case .keepOriginal: adjustments.removal = .keepOriginal
                    }
                }
            }
        )
    }

    private func instanceBinding(current: Int?) -> Binding<Int?> {
        Binding(
            get: { current },
            set: { instance in viewModel.apply { $0.removal = .detectedSubject(instance: instance) } }
        )
    }

    private func toleranceBinding(current: Int) -> Binding<Double> {
        Binding(
            get: { Double(current) },
            set: { value in
                viewModel.apply({ $0.removal = .flatBackground(tolerance: Int(value.rounded())) }, recordUndo: false)
            }
        )
    }
}
