//
//  AppearancePage.swift
//  Hangly
//

import SwiftUI

/// How Hangly looks and behaves, in one page.
///
/// The old Overlay tab was nine rows of sliders and toggles, and three of them —
/// a corner menu and two offset sliders — existed to answer a question nobody asks
/// in numbers. They are gone, replaced by dragging a charm on a picture of a screen.
/// Three toggles went with them, because click-through, all-Spaces and screen-edge
/// anchoring were defaults nobody changed and one of them could break the app.
///
/// What is left is three things you can see the result of, and three you switch on.
struct AppearancePage: View {
    @Bindable var viewModel: SettingsViewModel

    @State private var showsPrivacyDetails = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 26) {
                position
                Divider()
                proportions
                Divider()
                ambient
                Divider()
                system
                Divider()
                privacy
            }
            .padding(26)
            .frame(maxWidth: 620, alignment: .leading)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Position

    private var position: some View {
        section("Position", note: "Drag it anywhere along the top of your screen.") {
            DesktopPositionPicker(
                anchor: $viewModel.anchor,
                horizontalOffset: $viewModel.horizontalOffset,
                verticalOffset: $viewModel.verticalOffset,
                charm: viewModel.previewCharm,
                ropeLength: viewModel.ropeLength,
                charmSize: viewModel.charmSize
            )
        }
    }

    // MARK: - Proportions

    private var proportions: some View {
        section("Charm") {
            // The two questions the old single "Size" slider could not tell apart:
            // how big, and how far down.
            LabeledSlider(
                title: "Charm Size",
                value: $viewModel.charmSize,
                range: SettingsViewModel.charmSizeRange,
                leading: "Small",
                trailing: "Large"
            )
            LabeledSlider(
                title: "Rope Length",
                value: $viewModel.ropeLength,
                range: SettingsViewModel.ropeLengthRange,
                leading: "Short",
                trailing: "Long"
            )
            LabeledSlider(
                title: "Opacity",
                value: $viewModel.opacity,
                range: OverlaySettings.Limits.opacity,
                leading: "Faint",
                trailing: "Solid"
            )
        }
    }

    // MARK: - Ambient

    private var ambient: some View {
        section("Weather") {
            Toggle("Weather Effects", isOn: $viewModel.weatherEnabled)
                .toggleStyle(.switch)

            if viewModel.weatherEnabled {
                WeatherStatusRow(viewModel: viewModel)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }

            Text("The charm takes on the sky — warmer in sun, drained under cloud, "
                 + "wet in rain. This is the only part of Hangly that uses the network.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .animation(.snappy(duration: 0.25), value: viewModel.weatherEnabled)
    }

    // MARK: - Privacy

    private var privacy: some View {
        section("Privacy") {
            Toggle("Anonymous Analytics", isOn: $viewModel.analyticsEnabled)
                .toggleStyle(.switch)

            Text("Counts which features are used, so Hangly can be made better. "
                 + "No account, no name, nothing that identifies you, and nothing about "
                 + "the images or charms you make.")
                .font(.caption)
                .foregroundStyle(.secondary)

            Button("View Privacy Details") { showsPrivacyDetails = true }
                .buttonStyle(.link)
                .padding(.top, 2)
        }
        .sheet(isPresented: $showsPrivacyDetails) { PrivacyDetails() }
    }

    // MARK: - System

    private var system: some View {
        section("Hangly") {
            Toggle("Show Hangly", isOn: $viewModel.isOverlayVisible)
                .toggleStyle(.switch)
            Toggle("Launch at login", isOn: $viewModel.launchesAtLogin)
                .toggleStyle(.switch)
            Toggle("Play sound effects", isOn: $viewModel.soundEffectsEnabled)
                .toggleStyle(.switch)

            Toggle("Auto-hide during fullscreen video", isOn: $viewModel.hidesDuringFullscreenVideo)
                .toggleStyle(.switch)

            Text("Steps out of the way while a film is playing full screen, and comes "
                 + "back when it stops. Off by default: telling a film from any other "
                 + "full-screen app is a guess, and it is occasionally wrong.")
                .font(.caption)
                .foregroundStyle(.secondary)

            Toggle("Drag files onto charms to AirDrop", isOn: $viewModel.airdropOnDrop)
                .toggleStyle(.switch)

            Text("Drop any file on a charm to open AirDrop. "
                 + "When off, dropping an image opens Create instead.")
                .font(.caption)
                .foregroundStyle(.secondary)

            if viewModel.soundEffectsEnabled {
                LabeledSlider(
                    title: "Volume",
                    value: $viewModel.soundVolume,
                    range: AppSettings.soundVolumeRange,
                    leading: "Quiet",
                    trailing: "Loud"
                )
                .transition(.opacity)
            }

            if let error = viewModel.launchAtLoginError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
        }
        .animation(.snappy(duration: 0.25), value: viewModel.soundEffectsEnabled)
    }

    // MARK: - Shape

    private func section<Content: View>(
        _ title: String,
        note: String? = nil,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(title)
                    .font(.headline)
                if let note {
                    Text(note)
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
            }
            content()
        }
    }
}

/// A slider with words at the ends instead of a number in the middle.
///
/// The old rows showed "98%" beside every slider, which invited people to aim for a
/// number rather than look at the charm. What matters is which way is bigger.
///
/// The value is held locally and written to settings **only while the user is
/// actually dragging**, which is not a nicety. A `Slider` bound straight to a stored
/// property writes back a value quantised to its own pixel width as soon as it is
/// laid out — so simply opening this window moved a rope length of 1.0 to 0.778 and
/// then to 0.9982, silently editing settings nobody had touched.
struct LabeledSlider: View {
    let title: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let leading: String
    let trailing: String

    @State private var draft: Double = 0
    @State private var isEditing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.subheadline)
            HStack(spacing: 10) {
                Text(leading)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)

                Slider(value: $draft, in: range) { editing in
                    isEditing = editing
                    // Commit on release as well, so the settled value is the one
                    // stored rather than the last one the drag happened to report.
                    if !editing { value = draft }
                }

                Text(trailing)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .onAppear { draft = value }
        // Live while the hand is down — the charm should follow the slider — and
        // ignored entirely when it is not.
        .onChange(of: draft) { _, new in if isEditing { value = new } }
        .onChange(of: value) { _, new in if !isEditing { draft = new } }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(title)
    }
}

/// What the weather is, and a quiet way to say it is looking at the wrong place.
///
/// The location is resolved from the system time zone, which is right in India and
/// wrong in most of the United States — so the correction has to exist. It does not
/// have to be visible: almost nobody needs it, and a text field sitting there asking
/// to be filled in makes an automatic feature look like a manual one.
struct WeatherStatusRow: View {
    @Bindable var viewModel: SettingsViewModel
    @State private var isEditing = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: viewModel.weatherSymbol)
                    .foregroundStyle(.secondary)
                    .contentTransition(.symbolEffect(.replace))
                Text(viewModel.weatherSummary)
                    .font(.subheadline)
            }

            if isEditing {
                HStack(spacing: 8) {
                    TextField("City", text: $viewModel.weatherLocation)
                        .textFieldStyle(.roundedBorder)
                        .frame(maxWidth: 220)
                    Button("Done") { isEditing = false }
                        .buttonStyle(.borderless)
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            } else {
                Button("Not your location?") { isEditing = true }
                    .buttonStyle(.link)
                    .font(.caption)
            }
        }
        .animation(.snappy(duration: 0.22), value: isEditing)
    }
}
