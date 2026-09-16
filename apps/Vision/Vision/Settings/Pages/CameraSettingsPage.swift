//
//  CameraSettingsPage.swift
//  Vision
//
//  Redesigned Camera Settings dashboard for Vision 2.0.
//  Includes Camera Sources card, centered Live Preview card, and live hardware Diagnostics.
//

import SwiftUI

struct CameraSettingsPage: View {
    @Bindable var pocController: POCController
    @State private var devices: [CameraDevice] = CameraDeviceCatalog.availableDevices()
    @Bindable private var settings = VisionSettings.shared
    @State private var previewCamera = CameraManager()
    @State private var isPreviewShown = false

    @State private var isUnlocking = false
    @State private var sessionError: String?

    private var isSessionUnlocked: Bool { pocController.isSessionUnlocked }

    var body: some View {
        ZStack(alignment: .top) {
            lockedState
                .opacity(isSessionUnlocked ? 0 : 1)
                .allowsHitTesting(!isSessionUnlocked)
                .accessibilityHidden(isSessionUnlocked)

            unlockedState
                .opacity(isSessionUnlocked ? 1 : 0)
                .allowsHitTesting(isSessionUnlocked)
                .accessibilityHidden(!isSessionUnlocked)
        }
        .animation(SettingsMetrics.stateTransitionAnimation, value: isSessionUnlocked)
        .preference(
            key: HeaderTrailingActionKey.self,
            value: isSessionUnlocked ? HeaderAction(perform: refreshDevices) : nil
        )
        .onAppear { pocController.refreshCredentialStatus() }
        .onChange(of: isSessionUnlocked) { _, unlocked in
            guard !unlocked else { return }
            hidePreview()
        }
        .onDisappear { hidePreview() }
        .onChange(of: NotchOverlayController.shared.phase) { _, newPhase in
            guard newPhase == .closed else { return }
            pocController.refreshCredentialStatus()
        }
    }

    // MARK: - Locked State
    private var lockedState: some View {
        SettingsEmptyStateView(
            icon: "video.badge.waveform.fill",
            message: "Session Locked",
            buttonTitle: isUnlocking ? "Authenticating…" : "Unlock Session",
            isButtonEnabled: !isUnlocking,
            caption: sessionError ?? "Authenticate to access camera sources and video stream.",
            action: unlock
        )
    }

    // MARK: - Unlocked Dashboard
    private var unlockedState: some View {
        VStack(alignment: .leading, spacing: 18) {
            // MARK: - Live Preview Card (Centered Large Card)
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    SettingsSectionTitle(text: "Live Preview")

                    Spacer()

                    if isPreviewShown {
                        HStack(spacing: 5) {
                            Circle()
                                .fill(Color.green)
                                .frame(width: 6, height: 6)
                            Text("LIVE")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(Color.green)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Capsule().fill(Color.green.opacity(0.15)))
                    }
                }

                ZStack {
                    if isPreviewShown {
                        CameraPreviewView(session: previewCamera.session, faces: [])
                            .frame(height: 230)
                            .clipShape(RoundedRectangle(cornerRadius: SettingsMetrics.cardRadius, style: .continuous))
                            .overlay(
                                Button(action: hidePreview) {
                                    HStack(spacing: 5) {
                                        Image(systemName: "stop.fill")
                                            .font(.system(size: 10))
                                        Text("Stop Preview")
                                            .font(.system(size: 11, weight: .semibold))
                                    }
                                    .foregroundStyle(Color.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(Capsule().fill(Color.black.opacity(0.65)))
                                }
                                .buttonStyle(.plain)
                                .padding(12),
                                alignment: .bottomTrailing
                            )
                    } else {
                        VStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.06))
                                    .frame(width: 48, height: 48)
                                Image(systemName: "video.fill")
                                    .font(.system(size: 20))
                                    .foregroundStyle(SettingsMetrics.textSecondary)
                            }

                            Text("Camera stream paused to preserve battery and privacy.")
                                .font(.system(size: 12))
                                .foregroundStyle(SettingsMetrics.textSecondary)

                            SettingsPrimaryButton(title: "Start Live Preview", compact: true, action: showPreview)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 210)
                        .background(SettingsMetrics.cardBackground)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: SettingsMetrics.cardRadius, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: SettingsMetrics.cardRadius, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )

                if isPreviewShown, let error = previewCamera.errorMessage {
                    SettingsCaption(text: error)
                }
            }

            // MARK: - Camera Sources Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Camera Sources")

                SettingsGroup {
                    cameraPickerRow(title: "Default Camera", icon: "camera.fill", selection: $settings.defaultCameraID)
                    SettingsGroupDivider()
                    cameraPickerRow(title: "Built-in Display", icon: "laptopcomputer", selection: $settings.builtInDisplayCameraID)
                    SettingsGroupDivider()
                    cameraPickerRow(title: "External Display", icon: "display", selection: $settings.externalDisplayCameraID)
                }
            }

            // MARK: - Diagnostics Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Hardware Diagnostics")

                HStack(spacing: 10) {
                    diagnosticItem(title: "Resolution", value: isPreviewShown ? "1080p FHD" : "1920 × 1080", icon: "aspectratio")
                    diagnosticItem(title: "Target FPS", value: "30 FPS", icon: "speedometer")
                    diagnosticItem(title: "Status", value: isPreviewShown ? "Streaming" : "Standby", icon: "bolt.fill")
                    diagnosticItem(title: "Pipeline", value: "Apple Vision", icon: "cpu.fill")
                }
            }
        }
        .onChange(of: settings.defaultCameraID) { restartPreview() }
        .onChange(of: settings.builtInDisplayCameraID) { restartPreview() }
        .onChange(of: settings.externalDisplayCameraID) { restartPreview() }
    }

    private func cameraPickerRow(title: String, icon: String, selection: Binding<String?>) -> some View {
        SettingsRowContent(title: title) {
            SettingsMenuPickerPill(label: cameraLabel(for: selection.wrappedValue)) {
                Button("System default") { selection.wrappedValue = nil }
                ForEach(devices) { device in
                    Button(device.name) { selection.wrappedValue = device.id }
                }
            }
        }
    }

    private func diagnosticItem(title: String, value: String, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.system(size: 11))
                    .foregroundStyle(Color.accentColor)
                Text(title)
                    .font(.system(size: 10.5, weight: .medium))
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }

            Text(value)
                .font(.system(size: 12.5, weight: .semibold, design: .rounded))
                .foregroundStyle(SettingsMetrics.textPrimary)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(SettingsMetrics.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )
        )
    }

    private func cameraLabel(for id: String?) -> String {
        guard let id, let device = devices.first(where: { $0.id == id }) else {
            return "System default"
        }
        return device.name
    }

    private func showPreview() {
        isPreviewShown = true
        Task { await previewCamera.start() }
    }

    private func hidePreview() {
        guard isPreviewShown else { return }
        previewCamera.stop()
        isPreviewShown = false
    }

    private func restartPreview() {
        guard isPreviewShown else { return }
        previewCamera.stop()
        Task { await previewCamera.start() }
    }

    private func refreshDevices() {
        devices = CameraDeviceCatalog.availableDevices()
    }

    private func unlock() {
        isUnlocking = true
        sessionError = nil
        Task {
            await pocController.unlockSession()
            sessionError = pocController.sessionError
            isUnlocking = false
        }
    }
}
