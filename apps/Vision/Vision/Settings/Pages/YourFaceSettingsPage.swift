//
//  YourFaceSettingsPage.swift
//  Vision
//
//  Redesigned Face Recognition page for Vision 2.0.
//  Presents rich multi-identity profile cards with capture quality, sample tick strip, and instant actions.
//

import SwiftUI

struct YourFaceSettingsPage: View {
    let environment: AppEnvironment
    @Bindable private var store = FaceEnrollmentStore.shared

    @State private var sessionError: String?
    @State private var isUnlocking = false
    @State private var identityPendingDeletion: FaceIdentity?
    @State private var writeError: String?

    private enum PageStateKind: Equatable {
        case locked
        case unreadable
        case notEnrolled
        case enrolled
    }

    private var stateKind: PageStateKind {
        if store.isLocked { return .locked }
        if store.loadFailure != nil { return .unreadable }
        return store.identities.isEmpty ? .notEnrolled : .enrolled
    }

    private var enrollmentFlowIsRunning: Bool {
        NotchOverlayController.shared.phase == .onboarding
    }

    var body: some View {
        ZStack(alignment: .top) {
            lockedState
                .opacity(stateKind == .locked ? 1 : 0)
                .allowsHitTesting(stateKind == .locked)
                .accessibilityHidden(stateKind != .locked)

            unreadableState
                .opacity(stateKind == .unreadable ? 1 : 0)
                .allowsHitTesting(stateKind == .unreadable)
                .accessibilityHidden(stateKind != .unreadable)

            notEnrolledState
                .opacity(stateKind == .notEnrolled ? 1 : 0)
                .allowsHitTesting(stateKind == .notEnrolled)
                .accessibilityHidden(stateKind != .notEnrolled)

            enrolledState
                .opacity(stateKind == .enrolled ? 1 : 0)
                .allowsHitTesting(stateKind == .enrolled)
                .accessibilityHidden(stateKind != .enrolled)
        }
        .animation(SettingsMetrics.stateTransitionAnimation, value: stateKind)
        .onAppear { store.reloadIfUnlocked() }
        .onChange(of: NotchOverlayController.shared.phase) { _, newPhase in
            guard newPhase == .closed else { return }
            store.reloadIfUnlocked()
        }
        .confirmationDialog(
            "Delete this enrolled face?",
            isPresented: Binding(
                get: { identityPendingDeletion != nil },
                set: { if !$0 { identityPendingDeletion = nil } }
            ),
            titleVisibility: .visible,
            presenting: identityPendingDeletion
        ) { identity in
            Button("Delete", role: .destructive) { delete(identity) }
            Button("Cancel", role: .cancel) { identityPendingDeletion = nil }
        } message: { identity in
            Text("\"\(identity.name)\" will stop being recognized until you enroll them again.")
        }
    }

    // MARK: - Locked State
    private var lockedState: some View {
        SettingsEmptyStateView(
            icon: "lock.fill",
            message: "Session Locked",
            buttonTitle: isUnlocking ? "Authenticating…" : "Unlock Session",
            isButtonEnabled: !isUnlocking,
            caption: sessionError ?? "Touch ID required to view enrolled face profiles.",
            action: unlock
        )
    }

    // MARK: - Unreadable State
    private var unreadableState: some View {
        VStack(spacing: SettingsMetrics.emptyStateSpacing) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: SettingsMetrics.emptyStateIconSize))
                .foregroundStyle(SettingsMetrics.qualityFairColor)

            Text("Enrolled Faces Couldn't Be Read")
                .font(SettingsMetrics.rowFont)
                .foregroundStyle(SettingsMetrics.textSecondary)

            SettingsCaption(text: store.loadFailure ?? "The stored data couldn't be decrypted with this session key.")
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: SettingsMetrics.emptyStateMinHeight)
    }

    // MARK: - Not Enrolled State
    private var notEnrolledState: some View {
        SettingsEmptyStateView(
            icon: "faceid",
            message: "No Faces Enrolled",
            buttonTitle: "Set Up Face Unlock",
            isButtonEnabled: !enrollmentFlowIsRunning,
            caption: "Complete guided 9-pose face capture to start unlocking your Mac.",
            action: { OnboardingController.startEnrollmentOnly() }
        )
    }

    // MARK: - Enrolled Dashboard State
    private var enrolledState: some View {
        VStack(alignment: .leading, spacing: 18) {
            // Security Notice Card
            securityInfoCard

            // Identities Section Header
            HStack {
                Text("Enrolled Profiles")
                    .font(SettingsMetrics.cardTitleFont)
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Spacer()

                Button {
                    OnboardingController.startAddIdentity()
                } label: {
                    HStack(spacing: 5) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 13))
                        Text("Add Face")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundStyle(Color.accentColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(Color.accentColor.opacity(0.12)))
                }
                .buttonStyle(.plain)
                .disabled(enrollmentFlowIsRunning)
                .opacity(enrollmentFlowIsRunning ? 0.4 : 1)
                .help("Enroll another face or appearance")
            }

            // Profile Cards
            VStack(spacing: 12) {
                ForEach(store.identities) { identity in
                    profileCard(for: identity)
                }
            }

            if !store.identities.isEmpty && store.activeIdentities.isEmpty {
                SettingsCaption(text: "No profiles are enabled — Face Unlock won't recognize anyone until you switch one back on.")
            }

            if let writeError {
                SettingsCaption(text: writeError)
            }
        }
    }

    // MARK: - Security Info Card
    private var securityInfoCard: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 15))
                    .foregroundStyle(Color.accentColor)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text("On-Device Biometric Storage")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Text("Facial embedding vectors are encrypted with your Keychain session key and never leave this Mac. Add profiles for different glasses, hairstyles, or family members.")
                    .font(.system(size: 11.5))
                    .foregroundStyle(SettingsMetrics.textSecondary)
                    .lineSpacing(2)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(SettingsMetrics.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )
        )
    }

    // MARK: - Profile Card
    private func profileCard(for identity: FaceIdentity) -> some View {
        let isStale = identity.isStale(comparedTo: environment.faceLabController.pipeline.embedder)
        let poorCount = identity.samples.filter { $0.qualityTier == .poor }.count
        let total = identity.samples.count
        let qualityPercentage = total > 0 ? Int((Double(total - poorCount) / Double(total) * 100).rounded()) : 100

        return VStack(alignment: .leading, spacing: 14) {
            // Profile Header
            HStack(spacing: 12) {
                ZStack {
                    Circle()
                        .fill(identity.isEnabled ? Color.accentColor.opacity(0.2) : Color.white.opacity(0.08))
                        .frame(width: 40, height: 40)
                    Image(systemName: "faceid")
                        .font(.system(size: 18))
                        .foregroundStyle(identity.isEnabled ? Color.accentColor : SettingsMetrics.textSecondary)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(identity.name)
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                        .foregroundStyle(identity.isEnabled ? Color.white : SettingsMetrics.textSecondary)

                    HStack(spacing: 6) {
                        Text("Capture Quality: \(qualityPercentage)%")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(qualityPercentage >= 80 ? Color.green : Color.orange)

                        Text("•")
                            .foregroundStyle(SettingsMetrics.textTertiary)

                        Text("\(total) samples")
                            .font(.system(size: 11))
                            .foregroundStyle(SettingsMetrics.textSecondary)
                    }
                }

                Spacer()

                VisionToggle(isOn: enabledBinding(for: identity))
            }

            // Quality Ticks Bar
            VStack(alignment: .leading, spacing: 6) {
                QualityTickStrip(samples: identity.samples)

                HStack {
                    Text("Created \(identity.createdAt.formatted(date: .abbreviated, time: .omitted))")
                        .font(.system(size: 10.5))
                        .foregroundStyle(SettingsMetrics.textTertiary)

                    Spacer()

                    if isStale {
                        Text("Model Update Required")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(SettingsMetrics.qualityFairColor)
                    }
                }
            }
            .opacity(identity.isEnabled ? 1 : 0.45)

            Divider()
                .background(Color.white.opacity(0.06))

            // Action Buttons
            HStack(spacing: 10) {
                Button {
                    OnboardingController.startRecapture(of: identity)
                } label: {
                    HStack(spacing: 5) {
                        Image(systemName: "arrow.trianglehead.2.clockwise.rotate.90")
                            .font(.system(size: 11))
                        Text("Recapture")
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundStyle(SettingsMetrics.textPrimary)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(
                        Capsule().fill(Color.white.opacity(0.08))
                            .overlay(Capsule().strokeBorder(Color.white.opacity(0.1), lineWidth: 1))
                    )
                }
                .buttonStyle(.plain)
                .disabled(enrollmentFlowIsRunning)
                .opacity(enrollmentFlowIsRunning ? 0.4 : 1)

                Spacer()

                Button {
                    identityPendingDeletion = identity
                } label: {
                    Image(systemName: "trash")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.red.opacity(0.85))
                        .frame(width: 30, height: 30)
                        .background(
                            Circle().fill(Color.red.opacity(0.12))
                                .overlay(Circle().strokeBorder(Color.red.opacity(0.2), lineWidth: 1))
                        )
                }
                .buttonStyle(.plain)
                .help("Delete \(identity.name)")
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: SettingsMetrics.cardRadius, style: .continuous)
                .fill(SettingsMetrics.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: SettingsMetrics.cardRadius, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )
        )
    }

    // MARK: - Helpers
    private func enabledBinding(for identity: FaceIdentity) -> Binding<Bool> {
        Binding(
            get: { store.identities.first { $0.id == identity.id }?.isEnabled ?? true },
            set: { newValue in
                do {
                    try store.setEnabled(newValue, for: identity.id)
                    writeError = nil
                } catch {
                    writeError = error.localizedDescription
                }
            }
        )
    }

    private func delete(_ identity: FaceIdentity) {
        do {
            try store.delete(identity)
            writeError = nil
        } catch {
            writeError = error.localizedDescription
        }
        identityPendingDeletion = nil
    }

    private func unlock() {
        isUnlocking = true
        sessionError = nil
        Task {
            do {
                try await Task.detached(priority: .userInitiated) {
                    try SecureCredentialManager.unlockSession(reason: "Authenticate to view your enrolled faces")
                }.value
                store.reloadIfUnlocked()
            } catch {
                sessionError = error.localizedDescription
            }
            isUnlocking = false
        }
    }
}

// MARK: - Quality Tick Strip
private struct QualityTickStrip: View {
    let samples: [FaceSample]

    var body: some View {
        HStack(spacing: 5) {
            ForEach(Array(samples.enumerated()), id: \.offset) { _, sample in
                Capsule()
                    .fill(color(for: sample.qualityTier))
                    .frame(maxWidth: 4)
            }
        }
        .frame(height: 18)
    }

    private func color(for tier: FaceSample.QualityTier) -> Color {
        switch tier {
        case .poor: return SettingsMetrics.qualityPoorColor
        case .fair: return SettingsMetrics.qualityFairColor
        case .good: return SettingsMetrics.qualityGoodColor
        case .unrated: return SettingsMetrics.qualityUnratedColor
        }
    }
}
