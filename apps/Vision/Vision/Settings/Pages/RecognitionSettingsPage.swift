//
//  RecognitionSettingsPage.swift
//  Vision
//
//  Redesigned Vision Unlock page for Vision 2.0.
//  Card-based controls for Match Confidence, Detection Distance, and interactive Liveness cards.
//

import SwiftUI

struct RecognitionSettingsPage: View {
    @Bindable var coordinator: FaceUnlockCoordinator
    @Bindable var pocController: POCController
    @Bindable private var settings = VisionSettings.shared

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
        .onAppear { pocController.refreshCredentialStatus() }
        .onChange(of: NotchOverlayController.shared.phase) { _, newPhase in
            guard newPhase == .closed else { return }
            pocController.refreshCredentialStatus()
        }
    }

    // MARK: - Locked State
    private var lockedState: some View {
        SettingsEmptyStateView(
            icon: "sparkle",
            message: "Session Locked",
            buttonTitle: isUnlocking ? "Authenticating…" : "Unlock Session",
            isButtonEnabled: !isUnlocking,
            caption: sessionError ?? "Authenticate to configure face recognition and liveness parameters.",
            action: unlock
        )
    }

    // MARK: - Unlocked Dashboard
    private var unlockedState: some View {
        VStack(alignment: .leading, spacing: 18) {
            // MARK: - Match Confidence Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Match Confidence Threshold")

                SettingsGroup {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Text("Cosine Vector Similarity")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(SettingsMetrics.textPrimary)

                            Spacer()

                            Text(matchConfidenceLevel.title)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(Color.accentColor)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(Color.accentColor.opacity(0.14)))
                        }

                        HStack(spacing: 8) {
                            ForEach(MatchConfidenceLevel.allCases, id: \.self) { level in
                                let isSelected = matchConfidenceLevel == level
                                Button {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        coordinator.matchThreshold = level.threshold
                                    }
                                } label: {
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            Text(level.title)
                                                .font(.system(size: 12.5, weight: .semibold))
                                                .foregroundStyle(isSelected ? Color.white : SettingsMetrics.textPrimary)
                                            Spacer()
                                            if isSelected {
                                                Image(systemName: "checkmark")
                                                    .font(.system(size: 10, weight: .bold))
                                                    .foregroundStyle(Color.accentColor)
                                            }
                                        }

                                        Text(level.description)
                                            .font(.system(size: 10.5))
                                            .foregroundStyle(SettingsMetrics.textSecondary)
                                            .lineLimit(2)
                                    }
                                    .padding(12)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .frame(height: 64)
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
                        }
                    }
                    .padding(.horizontal, SettingsMetrics.rowHorizontalInset)
                    .padding(.vertical, 14)
                }
                SettingsCaption(text: "Higher thresholds decrease false acceptances but may require closer alignment.")
            }

            // MARK: - Detection Distance Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Detection Distance Range")

                SettingsGroup {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Text("Minimum Prominent Face Width")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(SettingsMetrics.textPrimary)

                            Spacer()

                            Text(detectionDistanceLevel.title)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(Color.accentColor)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(Color.accentColor.opacity(0.14)))
                        }

                        HStack(spacing: 8) {
                            ForEach(DetectionDistanceLevel.allCases, id: \.self) { dist in
                                let isSelected = detectionDistanceLevel == dist
                                Button {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        settings.minimumFaceWidth = dist.minimumFaceWidth
                                    }
                                } label: {
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            Text(dist.title)
                                                .font(.system(size: 12.5, weight: .semibold))
                                                .foregroundStyle(isSelected ? Color.white : SettingsMetrics.textPrimary)
                                            Spacer()
                                            if isSelected {
                                                Image(systemName: "checkmark")
                                                    .font(.system(size: 10, weight: .bold))
                                                    .foregroundStyle(Color.accentColor)
                                            }
                                        }

                                        Text(dist.description)
                                            .font(.system(size: 10.5))
                                            .foregroundStyle(SettingsMetrics.textSecondary)
                                            .lineLimit(2)
                                    }
                                    .padding(12)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .frame(height: 64)
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
                        }
                    }
                    .padding(.horizontal, SettingsMetrics.rowHorizontalInset)
                    .padding(.vertical, 14)
                }
            }

            // MARK: - Liveness Detection Card
            VStack(alignment: .leading, spacing: 8) {
                SettingsSectionTitle(text: "Anti-Spoofing & Liveness")

                HStack(spacing: 10) {
                    livenessCard(
                        mode: .off,
                        title: "Off",
                        subtitle: "Face recognition only. Fast match without anti-spoof checks.",
                        icon: "bolt.slash.fill"
                    )

                    livenessCard(
                        mode: .light,
                        title: "Light",
                        subtitle: "Recommended. Denies digital phone screens and printed photos.",
                        icon: "shield.lefthalf.filled"
                    )

                    livenessCard(
                        mode: .heavy,
                        title: "Heavy",
                        subtitle: "High security. Checks eye-blink, micro-pose angles, and 3D depth cues.",
                        icon: "shield.fill"
                    )
                }
                SettingsCaption(text: "Liveness analysis ensures a live person is present before unlocking.")
            }
        }
    }

    // MARK: - Liveness Card
    private enum EffectiveLivenessMode: Equatable {
        case off, light, heavy
    }

    private var currentLiveness: EffectiveLivenessMode {
        if !settings.livenessChecksEnabled { return .off }
        return settings.livenessMode == .heavy ? .heavy : .light
    }

    private func livenessCard(mode: EffectiveLivenessMode, title: String, subtitle: String, icon: String) -> some View {
        let isSelected = currentLiveness == mode

        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                switch mode {
                case .off:
                    settings.livenessChecksEnabled = false
                case .light:
                    settings.livenessChecksEnabled = true
                    settings.livenessMode = .light
                case .heavy:
                    settings.livenessChecksEnabled = true
                    settings.livenessMode = .heavy
                }
            }
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(isSelected ? Color.accentColor.opacity(0.2) : Color.white.opacity(0.08))
                            .frame(width: 32, height: 32)
                        Image(systemName: icon)
                            .font(.system(size: 13))
                            .foregroundStyle(isSelected ? Color.accentColor : SettingsMetrics.textSecondary)
                    }

                    Spacer()

                    if isSelected {
                        Circle()
                            .fill(Color.accentColor)
                            .frame(width: 6, height: 6)
                    }
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(isSelected ? Color.white : SettingsMetrics.textPrimary)

                    Text(subtitle)
                        .font(.system(size: 10.5))
                        .foregroundStyle(SettingsMetrics.textSecondary)
                        .lineLimit(3)
                        .lineSpacing(1.5)
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .frame(height: 120)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isSelected ? Color.accentColor.opacity(0.14) : SettingsMetrics.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(isSelected ? Color.accentColor.opacity(0.4) : SettingsMetrics.cardBorderColor, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Helpers
    private var matchConfidenceLevel: MatchConfidenceLevel {
        .nearest(to: coordinator.matchThreshold)
    }

    private var detectionDistanceLevel: DetectionDistanceLevel {
        .nearest(to: settings.minimumFaceWidth)
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

// MARK: - MatchConfidenceLevel
private enum MatchConfidenceLevel: Int, CaseIterable {
    case lessStrict, standard, moreStrict

    var title: String {
        switch self {
        case .lessStrict: return "Less Strict"
        case .standard: return "Default"
        case .moreStrict: return "More Strict"
        }
    }

    var description: String {
        switch self {
        case .lessStrict: return "Faster match in dim light (0.58)"
        case .standard: return "Optimal daily balance (0.63)"
        case .moreStrict: return "Highest security match (0.68)"
        }
    }

    var threshold: Float {
        switch self {
        case .lessStrict: return 0.58
        case .standard: return 0.63
        case .moreStrict: return 0.68
        }
    }

    static func nearest(to threshold: Float) -> Self {
        allCases.min { abs($0.threshold - threshold) < abs($1.threshold - threshold) } ?? .standard
    }
}

// MARK: - DetectionDistanceLevel
private enum DetectionDistanceLevel: Int, CaseIterable {
    case close, standard, far

    var title: String {
        switch self {
        case .close: return "Close"
        case .standard: return "Default"
        case .far: return "Far"
        }
    }

    var description: String {
        switch self {
        case .close: return "Nearby webcam only"
        case .standard: return "Standard desk posture"
        case .far: return "Extended arm distance"
        }
    }

    var minimumFaceWidth: Float {
        switch self {
        case .close: return 0.23
        case .standard: return 0.19
        case .far: return 0.15
        }
    }

    static func nearest(to width: Float) -> Self {
        allCases.min { abs($0.minimumFaceWidth - width) < abs($1.minimumFaceWidth - width) } ?? .standard
    }
}
