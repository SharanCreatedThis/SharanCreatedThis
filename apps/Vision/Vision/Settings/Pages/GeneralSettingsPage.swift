//
//  GeneralSettingsPage.swift
//  Vision
//
//  Redesigned General Settings dashboard for Vision 2.0.
//  Structured with modern frosted cards for Startup, Triggers, Behaviour, and Animation previews.
//

import OSLog
import SwiftUI

struct GeneralSettingsPage: View {
    @Bindable var coordinator: FaceUnlockCoordinator
    @Bindable private var settings = VisionSettings.shared

    @State private var launchAtLoginEnabled = LaunchAtLogin.isEnabled
    @State private var launchAtLoginError: String?
    @State private var screens: [NSScreen] = NSScreen.screens
    @State private var inputMonitoring = SpaceKeyMonitor.inputMonitoringAccess

    private var needsInputMonitoring: Bool {
        settings.unlockTriggers.contains(.onSpace) && inputMonitoring != .granted
    }

    private var hasInheritedXcodePermission: Bool {
        settings.unlockTriggers.contains(.onSpace) && SpaceKeyMonitor.isLaunchedByXcode
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            // MARK: - Startup Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Startup & Status")

                SettingsGroup {
                    SettingsRowContent(
                        title: "Launch at login",
                        subtitle: "Start Vision automatically when you log in"
                    ) {
                        VisionToggle(isOn: Binding(
                            get: { launchAtLoginEnabled },
                            set: { newValue in
                                launchAtLoginEnabled = newValue
                                do {
                                    try LaunchAtLogin.setEnabled(newValue)
                                    launchAtLoginError = nil
                                } catch {
                                    launchAtLoginEnabled = !newValue
                                    launchAtLoginError = error.localizedDescription
                                }
                            }
                        ))
                    }

                    SettingsGroupDivider()

                    SettingsRowContent(
                        title: "Enable Face Unlock",
                        subtitle: "Arm camera and notch overlay for authentication"
                    ) {
                        VisionToggle(isOn: $coordinator.isEnabled)
                    }
                }

                if let launchAtLoginError {
                    SettingsCaption(text: launchAtLoginError)
                }
            }

            // MARK: - Triggers Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Unlock Triggers")

                SettingsGroup {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("When to scan for your face:")
                            .font(.system(size: 12.5, weight: .medium))
                            .foregroundStyle(SettingsMetrics.textSecondary)

                        HStack(spacing: 10) {
                            triggerTile(trigger: .onWake, title: "On Wake", icon: "moon.fill")
                            triggerTile(trigger: .onLock, title: "On Lock", icon: "lock.laptopcomputer")
                            triggerTile(trigger: .onSpace, title: "On Space", icon: "space")
                        }

                        SettingsGroupDivider()
                            .padding(.top, 4)

                        displayPicker()
                    }
                    .padding(.horizontal, SettingsMetrics.rowHorizontalInset)
                    .padding(.vertical, 12)
                }

                if hasInheritedXcodePermission {
                    SettingsCaption(text: "Running from Xcode — permission checks resolve against Xcode’s grants, not Vision’s.")
                } else if needsInputMonitoring {
                    inputMonitoringNotice()
                }
            }

            // MARK: - Behaviour Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Unlock Behaviour")

                SettingsGroup {
                    SettingsRowContent(
                        title: "Retry on notch hover",
                        subtitle: "Move your cursor to the notch to immediately re-scan"
                    ) {
                        VisionToggle(isOn: $settings.retryOnHover)
                    }

                    SettingsGroupDivider()

                    SettingsRowContent(
                        title: "Auto retry once after failure",
                        subtitle: "Tries a second scan attempt if the first face match is unclear"
                    ) {
                        VisionToggle(isOn: $settings.autoRetryOnce)
                    }

                    SettingsGroupDivider()

                    SettingsRowContent(
                        title: "Haptic feedback",
                        subtitle: "Subtle trackpad click upon successful recognition"
                    ) {
                        VisionToggle(isOn: $settings.hapticFeedbackEnabled)
                    }

                    SettingsGroupDivider()

                    SettingsSteppedSliderRowContent(
                        title: "Face detection duration",
                        valueLabel: "\(settings.faceDetectionSeconds)s",
                        index: Binding(
                            get: { Double(settings.faceDetectionSeconds - VisionSettings.faceDetectionRange.lowerBound) },
                            set: { settings.faceDetectionSeconds = VisionSettings.faceDetectionRange.lowerBound + Int($0.rounded()) }
                        ),
                        stopCount: VisionSettings.faceDetectionRange.count
                    )
                }
            }

            // MARK: - Animation Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Notch Animation")

                SettingsGroup {
                    VStack(alignment: .leading, spacing: 14) {
                        SettingsRowContent(
                            title: "Show animation",
                            subtitle: "Display visual Face ID confirmation in the notch"
                        ) {
                            VisionToggle(isOn: $settings.showUnlockAnimation)
                        }

                        if settings.showUnlockAnimation {
                            SettingsGroupDivider()

                            HStack(spacing: 14) {
                                animationStyleCard(
                                    style: .minimal,
                                    title: "Minimal Pill",
                                    subtitle: "Compact lock glyph & light breath"
                                ) {
                                    MinimalPillSamplePreview()
                                }

                                animationStyleCard(
                                    style: .original,
                                    title: "Dynamic Notch",
                                    subtitle: "Full expand with iris recognition"
                                ) {
                                    DynamicNotchSamplePreview()
                                }
                            }
                            .padding(.top, 4)
                        }
                    }
                    .padding(.horizontal, SettingsMetrics.rowHorizontalInset)
                    .padding(.vertical, 12)
                }
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: NSApplication.didChangeScreenParametersNotification)) { _ in
            screens = NSScreen.screens
        }
        .onReceive(NotificationCenter.default.publisher(for: NSApplication.didBecomeActiveNotification)) { _ in
            inputMonitoring = SpaceKeyMonitor.inputMonitoringAccess
        }
        .onChange(of: settings.unlockTriggers) { oldValue, newValue in
            if newValue.contains(.onSpace), !oldValue.contains(.onSpace), inputMonitoring != .granted {
                SpaceKeyMonitor.requestInputMonitoringAccess()
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    inputMonitoring = SpaceKeyMonitor.inputMonitoringAccess
                }
            }
        }
    }

    // MARK: - Trigger Segmented Tile
    private func triggerTile(trigger: UnlockTrigger, title: String, icon: String) -> some View {
        let isSelected = settings.unlockTriggers.contains(trigger)

        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                if isSelected {
                    // Maintain at least one trigger active
                    if settings.unlockTriggers.count > 1 {
                        settings.unlockTriggers.remove(trigger)
                    }
                } else {
                    settings.unlockTriggers.insert(trigger)
                }
            }
        } label: {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(isSelected ? Color.accentColor : SettingsMetrics.textSecondary)

                Text(title)
                    .font(.system(size: 12.5, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(isSelected ? Color.white : SettingsMetrics.textPrimary)

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Color.accentColor)
                }
            }
            .padding(.horizontal, 12)
            .frame(height: 38)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(isSelected ? Color.accentColor.opacity(0.18) : SettingsMetrics.optionPreviewFill)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .strokeBorder(isSelected ? Color.accentColor.opacity(0.4) : Color.white.opacity(0.06), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Animation Style Card
    private func animationStyleCard<Preview: View>(
        style: UnlockAnimationStyle,
        title: String,
        subtitle: String,
        @ViewBuilder preview: () -> Preview
    ) -> some View {
        let isSelected = settings.unlockAnimationStyle == style

        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                settings.unlockAnimationStyle = style
            }
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                // Live sample animation container — simulates the real desktop
                ZStack {
                    // Desktop-like background gradient
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(white: 0.12),
                                    Color(white: 0.08)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.06), lineWidth: 1)
                        )

                    // Simulated top menu bar edge
                    VStack(spacing: 0) {
                        Rectangle()
                            .fill(Color.white.opacity(0.04))
                            .frame(height: 1)
                        Spacer()
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                    preview()
                }
                .frame(height: 100)
                .frame(maxWidth: .infinity)

                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(title)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(isSelected ? Color.white : SettingsMetrics.textPrimary)

                        Spacer()

                        if isSelected {
                            Circle()
                                .fill(Color.accentColor)
                                .frame(width: 6, height: 6)
                        }
                    }

                    Text(subtitle)
                        .font(.system(size: 11))
                        .foregroundStyle(SettingsMetrics.textSecondary)
                        .lineLimit(2)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isSelected ? Color.accentColor.opacity(0.12) : SettingsMetrics.optionPreviewFill)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(isSelected ? Color.accentColor.opacity(0.4) : Color.white.opacity(0.08), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Display Picker
    private func displayPicker() -> some View {
        HStack {
            Text("Display on")
                .font(.system(size: 13))
                .foregroundStyle(SettingsMetrics.textPrimary)

            Spacer()

            SettingsMenuPickerPill(label: displayLabel) {
                Button("Main display") {
                    settings.preferredDisplayID = nil
                    settings.preferredDisplayName = nil
                }
                ForEach(screens.compactMap(NamedScreen.init), id: \.id) { screen in
                    Button(screen.name) {
                        settings.preferredDisplayID = screen.id
                        settings.preferredDisplayName = screen.name
                    }
                }
            }
        }
    }

    private struct NamedScreen {
        let id: String
        let name: String

        init?(_ screen: NSScreen) {
            guard let id = screen.stableDisplayID else { return nil }
            self.id = id
            self.name = screen.localizedName
        }
    }

    private var displayLabel: String {
        guard let targetID = settings.preferredDisplayID else { return "Main display" }
        if let connected = screens.first(where: { $0.stableDisplayID == targetID }) {
            return connected.localizedName
        }
        guard let name = settings.preferredDisplayName else { return "Selected display (disconnected)" }
        return "\(name) (disconnected)"
    }

    private func inputMonitoringNotice() -> some View {
        VStack(alignment: .leading, spacing: 6) {
            SettingsCaption(text: "\u{201C}On space\u{201D} reads the space key on the lock screen, which requires Accessibility permission.")
            Button("Open Accessibility Settings") {
                SpaceKeyMonitor.requestInputMonitoringAccess()
                if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
                    NSWorkspace.shared.open(url)
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    inputMonitoring = SpaceKeyMonitor.inputMonitoringAccess
                }
            }
            .buttonStyle(.plain)
            .font(.system(size: 12, weight: .medium))
            .foregroundStyle(VisionTheme.accent)
        }
    }
}

// MARK: - Sample Live Animation Previews

/// Miniature replica of the real Minimal Pill overlay. Uses the exact proportions
/// from NotchGeometry (150×40) scaled down to fit the preview card, with the same
/// capsule shape, lock icon + breathing scan dot layout as MinimalUnlockView.
struct MinimalPillSamplePreview: View {
    @State private var isUnlocked = false
    @State private var timer: Timer?

    // Scale factor: real pill is 150×40; we scale to fit the preview card
    private let previewScale: CGFloat = 0.6
    private var pillWidth: CGFloat { NotchGeometry.minimalPillOpenWidth * previewScale }
    private var pillHeight: CGFloat { NotchGeometry.minimalPillOpenHeight * previewScale }

    var body: some View {
        VStack {
            // Position at top like the real overlay hangs from the top of the screen
            HStack(spacing: 0) {
                // Lock icon on the left
                Image(systemName: isUnlocked ? "lock.open.fill" : "lock.fill")
                    .font(.system(size: 10 * previewScale + 4, weight: .semibold))
                    .foregroundStyle(isUnlocked ? Color.green : Color.white.opacity(0.9))
                    .contentTransition(.symbolEffect(.replace.magic(fallback: .replace)))
                    .animation(.smooth(duration: 0.4), value: isUnlocked)
                    .frame(width: pillWidth * 0.35)

                Spacer(minLength: 0)

                // Face ID scan animation on the right
                LoopingVideoView(resourceName: "unlockanimation", pauseBetweenLoops: 1.5)
                    .frame(width: pillHeight * 0.7, height: pillHeight * 0.7)
                    .clipShape(RoundedRectangle(cornerRadius: 2, style: .continuous))
                    .frame(width: pillWidth * 0.35)
            }
            .padding(.horizontal, pillHeight * 0.3)
            .frame(width: pillWidth, height: pillHeight)
            .background(
                Capsule()
                    .fill(Color.black)
                    .overlay(Capsule().strokeBorder(Color.white.opacity(0.15), lineWidth: 0.8))
            )
            .shadow(color: Color.black.opacity(0.5), radius: 6, y: 3)
            .padding(.top, 6)

            Spacer()
        }
        .onAppear {
            timer = Timer.scheduledTimer(withTimeInterval: 2.5, repeats: true) { _ in
                withAnimation(.spring(response: 0.32, dampingFraction: 0.78)) {
                    isUnlocked.toggle()
                }
            }
        }
        .onDisappear {
            timer?.invalidate()
            timer = nil
        }
    }
}

/// Miniature replica of the real Dynamic Notch overlay. Uses the actual NotchShape
/// with proper corner radii from NotchGeometry, and embeds the Face ID video at a
/// proportionally correct size — matching how the expanded notch looks on screen.
struct DynamicNotchSamplePreview: View {
    // Scale factor: real notch open is 220×200; we scale to fit preview
    private let previewScale: CGFloat = 0.42

    private var notchWidth: CGFloat { NotchGeometry.notchOpenSize.width * previewScale }
    private var notchHeight: CGFloat { NotchGeometry.notchOpenSize.height * previewScale }
    private var topR: CGFloat { NotchGeometry.openTopRadius * previewScale }
    private var bottomR: CGFloat { NotchGeometry.openBottomRadius * previewScale }

    var body: some View {
        VStack {
            // Notch hangs from the top edge
            ZStack {
                // Real NotchShape silhouette
                NotchShape(topRadius: topR, bottomRadius: bottomR, style: .notch)
                    .fill(Color.black)
                    .overlay(
                        NotchShape(topRadius: topR, bottomRadius: bottomR, style: .notch)
                            .stroke(Color.white.opacity(0.12), lineWidth: 0.6)
                    )
                    .frame(width: notchWidth + topR * 2, height: notchHeight)
                    .shadow(color: Color.black.opacity(0.5), radius: 6, y: 3)

                // Face ID video, inset with proportional padding
                LoopingVideoView(resourceName: "unlockanimation", pauseBetweenLoops: 1.5)
                    .frame(
                        width: notchWidth - NotchGeometry.notchContentPaddingLeading * previewScale * 2,
                        height: notchHeight - (NotchGeometry.notchContentPaddingTop + NotchGeometry.notchContentPaddingBottom) * previewScale
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
            }
            .padding(.top, 0)

            Spacer()
        }
    }
}
