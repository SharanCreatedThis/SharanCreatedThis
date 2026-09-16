//
//  SecuritySettingsPage.swift
//  Vision
//
//  Combined Security dashboard for Vision 2.0:
//  Password protection, hardware encryption, session auto-lock, and credential management.
//

import SwiftUI

struct SecuritySettingsPage: View {
    @Bindable var pocController: POCController
    @Bindable private var settings = VisionSettings.shared

    @State private var isUnlocking = false
    @State private var sessionError: String?
    @State private var statusMessage: String?

    private var isSessionUnlocked: Bool { pocController.isSessionUnlocked }

    private enum PageState: Equatable {
        case noPassword
        case locked
        case unlocked
    }

    private var pageState: PageState {
        guard pocController.hasStoredPassword else { return .noPassword }
        return isSessionUnlocked ? .unlocked : .locked
    }

    var body: some View {
        ZStack(alignment: .top) {
            noPasswordState
                .opacity(pageState == .noPassword ? 1 : 0)
                .allowsHitTesting(pageState == .noPassword)
                .accessibilityHidden(pageState != .noPassword)

            lockedState
                .opacity(pageState == .locked ? 1 : 0)
                .allowsHitTesting(pageState == .locked)
                .accessibilityHidden(pageState != .locked)

            unlockedState
                .opacity(pageState == .unlocked ? 1 : 0)
                .allowsHitTesting(pageState == .unlocked)
                .accessibilityHidden(pageState != .unlocked)
        }
        .animation(SettingsMetrics.stateTransitionAnimation, value: pageState)
        .onAppear { pocController.refreshCredentialStatus() }
        .onChange(of: NotchOverlayController.shared.phase) { _, newPhase in
            guard newPhase == .closed else { return }
            pocController.refreshCredentialStatus()
            FaceEnrollmentStore.shared.reloadIfUnlocked()
        }
    }

    // MARK: - No Password Stored State
    private var noPasswordState: some View {
        SettingsEmptyStateView(
            icon: "lock.slash.fill",
            message: "No Password Stored",
            buttonTitle: "Set Up Password",
            caption: statusMessage ?? "Store your password to enable seamless Face Unlock.",
            action: { OnboardingController.startPasswordOnly() }
        )
    }

    // MARK: - Locked Session State
    private var lockedState: some View {
        SettingsEmptyStateView(
            icon: "lock.fill",
            message: "Session Locked",
            buttonTitle: isUnlocking ? "Authenticating…" : "Unlock Session",
            isButtonEnabled: !isUnlocking,
            caption: sessionError ?? "Touch ID or Mac authentication required to access security settings.",
            action: unlock
        )
    }

    // MARK: - Unlocked Dashboard
    private var unlockedState: some View {
        VStack(alignment: .leading, spacing: 18) {
            // MARK: - Security Overview Cards (Grid)
            HStack(spacing: 12) {
                securityCard(
                    icon: "lock.shield.fill",
                    color: .green,
                    title: "Password Protected",
                    status: "Active",
                    detail: "Stored in macOS Keychain"
                )

                securityCard(
                    icon: "key.fill",
                    color: Color.accentColor,
                    title: "Encrypted Session",
                    status: "Touch ID",
                    detail: "Protected by Secure Enclave"
                )
            }

            // MARK: - Session Auto Lock Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Session Security")

                SettingsGroup {
                    SettingsSteppedSliderRowContent(
                        title: "Auto-lock session",
                        valueLabel: settings.autoLockInterval.title,
                        index: Binding(
                            get: { settings.autoLockInterval.sliderIndex },
                            set: { settings.autoLockInterval = .from(sliderIndex: $0) }
                        ),
                        stopCount: AutoLockInterval.allCases.count
                    )
                }
                SettingsCaption(text: "After this period of inactivity, Vision requires Touch ID before performing face recognition.")
            }

            // MARK: - Credential Actions Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Credential Management")

                SettingsGroup {
                    SettingsRowContent(
                        title: "Change password",
                        subtitle: "Update stored Mac login password"
                    ) {
                        SettingsPrimaryButton(title: "Change", compact: true) {
                            OnboardingController.startPasswordOnly()
                        }
                    }

                    SettingsGroupDivider()

                    SettingsRowContent(
                        title: "Remove password & faces",
                        subtitle: "Erase stored password and enrolled biometric templates"
                    ) {
                        HoldToConfirmButton(title: "Remove", action: removePassword)
                    }
                }
            }

            if let statusMessage {
                SettingsCaption(text: statusMessage)
            }
        }
    }

    private func securityCard(
        icon: String,
        color: Color,
        title: String,
        status: String,
        detail: String
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                ZStack {
                    Circle()
                        .fill(color.opacity(0.15))
                        .frame(width: 32, height: 32)
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(color)
                }

                Spacer()

                Text(status)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(color)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Capsule().fill(color.opacity(0.12)))
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(SettingsMetrics.cardTitleFont)
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Text(detail)
                    .font(.system(size: 11.5))
                    .foregroundStyle(SettingsMetrics.textSecondary)
                    .lineLimit(1)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: SettingsMetrics.cardRadius, style: .continuous)
                .fill(SettingsMetrics.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: SettingsMetrics.cardRadius, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )
        )
    }

    // MARK: - Actions
    private func unlock() {
        isUnlocking = true
        sessionError = nil
        Task {
            await pocController.unlockSession()
            sessionError = pocController.sessionError
            FaceEnrollmentStore.shared.reloadIfUnlocked()
            isUnlocking = false
        }
    }

    private func removePassword() {
        do {
            FaceEnrollmentStore.shared.deleteAll()
            try SecureCredentialManager.deletePassword()
            pocController.refreshCredentialStatus()
            statusMessage = "Password and face enrollment removed successfully."
        } catch {
            statusMessage = "Couldn't remove credentials: \(error.localizedDescription)"
        }
    }
}
