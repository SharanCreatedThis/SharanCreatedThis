//
//  GuardSettingsPage.swift
//  Vision
//
//  Redesigned Vision Guard monitoring dashboard for Vision 2.0.
//  Features real-time presence scoring, selectable lock threshold cards, and false-positive protection cards.
//

import SwiftUI

struct GuardSettingsPage: View {
    @Bindable private var settings = VisionSettings.shared
    @State private var guardManager = VisionGuardManager.shared

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            // MARK: - Master Enable Card
            SettingsGroup {
                SettingsRowContent(
                    title: "Vision Guard",
                    subtitle: "Continuously detect presence and auto-lock when you step away"
                ) {
                    VisionToggle(isOn: $settings.isGuardEnabled)
                }
            }

            if settings.isGuardEnabled {
                // MARK: - Monitoring Active Top Status Card
                monitoringStatusCard

                // MARK: - Lock After Duration Cards
                VStack(alignment: .leading, spacing: 8) {
                    SettingsSectionTitle(text: "Lock Countdown Duration")

                    HStack(spacing: 10) {
                        ForEach(GuardAbsenceRule.allCases, id: \.self) { rule in
                            durationCard(rule: rule)
                        }
                    }
                }

                // MARK: - False-Positive Protection Cards
                VStack(alignment: .leading, spacing: 8) {
                    SettingsSectionTitle(text: "False-Positive Protection")

                    HStack(spacing: 12) {
                        safeguardCard(
                            title: "Ignore Video Calls",
                            subtitle: "Zoom, Teams, FaceTime, Discord",
                            icon: "video.fill",
                            isActive: true
                        )

                        safeguardCard(
                            title: "Ignore Presentations",
                            subtitle: "Fullscreen apps & slideshows",
                            icon: "rectangle.inset.filled.and.person.filled",
                            isActive: true
                        )
                    }

                    SettingsCaption(text: "Smart safeguards automatically pause the lock countdown during active meetings and presentations.")
                }
            }
        }
    }

    // MARK: - Monitoring Status Card
    private var monitoringStatusCard: some View {
        HStack(spacing: 16) {
            // Gauge / Indicator Circle
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.08), lineWidth: 6)
                    .frame(width: 56, height: 56)

                Circle()
                    .trim(from: 0, to: CGFloat(guardManager.currentPresenceScore))
                    .stroke(
                        presenceColor(guardManager.currentPresenceScore),
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .frame(width: 56, height: 56)

                Text(String(format: "%.0f%%", guardManager.currentPresenceScore * 100))
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 7, height: 7)

                    Text("Monitoring Active")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(Color.white)
                }

                HStack(spacing: 6) {
                    Text("Presence Score: \(Int(guardManager.currentPresenceScore * 100))%")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(SettingsMetrics.textSecondary)

                    Text("•")
                        .foregroundStyle(SettingsMetrics.textTertiary)

                    Text(guardManager.statusMessage)
                        .font(.system(size: 11.5))
                        .foregroundStyle(presenceColor(guardManager.currentPresenceScore))
                }
            }

            Spacer()

            // Status Badge
            Text(guardManager.currentState.rawValue)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(presenceColor(guardManager.currentPresenceScore))
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Capsule().fill(presenceColor(guardManager.currentPresenceScore).opacity(0.12)))
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

    // MARK: - Duration Card
    private func durationCard(rule: GuardAbsenceRule) -> some View {
        let isSelected = guardManager.awayDetector.selectedRule == rule

        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                guardManager.awayDetector.selectedRule = rule
            }
        } label: {
            VStack(spacing: 6) {
                HStack {
                    Spacer()
                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(Color.accentColor)
                    } else {
                        Circle()
                            .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
                            .frame(width: 11, height: 11)
                    }
                }

                Text(shortTitle(for: rule))
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundStyle(isSelected ? Color.white : SettingsMetrics.textPrimary)

                Text("Absence")
                    .font(.system(size: 10))
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(isSelected ? Color.accentColor.opacity(0.16) : SettingsMetrics.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(isSelected ? Color.accentColor.opacity(0.4) : SettingsMetrics.cardBorderColor, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Safeguard Card
    private func safeguardCard(title: String, subtitle: String, icon: String, isActive: Bool) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundStyle(Color.green)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 12.5, weight: .semibold))
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Text(subtitle)
                    .font(.system(size: 10.5))
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }

            Spacer()

            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 14))
                .foregroundStyle(Color.green)
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

    private func shortTitle(for rule: GuardAbsenceRule) -> String {
        switch rule {
        case .seconds10: return "10 Sec"
        case .seconds30: return "30 Sec"
        case .minute1: return "1 Min"
        case .minutes5: return "5 Min"
        }
    }

    private func presenceColor(_ score: Float) -> Color {
        if score > 0.65 { return .green }
        if score > 0.35 { return .orange }
        return .red
    }
}
