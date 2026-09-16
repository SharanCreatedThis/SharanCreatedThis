//
//  AboutSettingsPage.swift
//  Vision
//
//  Redesigned About Page for Vision 2.0.
//  The premier showcase page featuring Hero identity, statistics row, security status card,
//  creator appreciation section, and Sparkle 2 update center.
//

import SwiftUI
import AppKit

struct AboutSettingsPage: View {
    @Bindable var updater: UpdaterController
    let environment: AppEnvironment

    @State private var iconTapCount = 0
    @State private var lastTapDate: Date?
    private let requiredTapCount = 5
    private let tapResetInterval: TimeInterval = 1.0

    @State private var isCoffeeSheetPresented = false

    private var analytics: VisionAnalytics { VisionAnalytics.shared }
    private var settings: VisionSettings { VisionSettings.shared }
    private var enrollmentStore: FaceEnrollmentStore { FaceEnrollmentStore.shared }

    private var versionString: String {
        let info = Bundle.main.infoDictionary
        let short = info?["CFBundleShortVersionString"] as? String ?? "1.1"
        let build = info?["CFBundleVersion"] as? String ?? "3"
        return "Version \(short) (Build \(build))"
    }

    private var formattedLastUnlock: String {
        guard let date = analytics.lastUnlockDate else { return "Never" }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    var body: some View {
        VStack(spacing: 16) {
            // MARK: - Hero Section Card
            heroSection

            // MARK: - Statistics Row
            statisticsRow

            // MARK: - Security Status Card & Creator Card Grid
            HStack(alignment: .top, spacing: 14) {
                securityCard
                creatorCard
            }

            // MARK: - Update Center (Sparkle 2)
            updateCenterCard

            // MARK: - Footer
            footerSection
        }
        .sheet(isPresented: $isCoffeeSheetPresented) {
            BuyCoffeeSheet()
        }
    }

    // MARK: - Hero Section
    private var heroSection: some View {
        VStack(spacing: 9) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.accentColor.opacity(0.35), Color.accentColor.opacity(0.08)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 86, height: 86)
                    .blur(radius: 12)

                Image(nsImage: NSApp.applicationIconImage)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 74, height: 74)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .strokeBorder(Color.white.opacity(0.18), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.35), radius: 10, y: 5)
                    .contentShape(Rectangle())
                    .onTapGesture(perform: handleIconTap)
            }

            VStack(spacing: 3) {
                Text("Vision")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Text("Face ID for Mac")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.accentColor)

                Text(versionString)
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .foregroundStyle(SettingsMetrics.textTertiary)
                    .padding(.top, 1)
            }

            // MARK: - Big Spacious Eye-Catching Buy Creator a Coffee Button
            Button {
                isCoffeeSheetPresented = true
            } label: {
                HStack(spacing: 8) {
                    Text("☕")
                        .font(.system(size: 15))

                    Text("Buy Creator a Coffee")
                        .font(.system(size: 13.5, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.white)

                    Image(systemName: "heart.fill")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.white.opacity(0.9))
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 9)
                .background(
                    ZStack {
                        LinearGradient(
                            colors: [
                                Color(red: 1.0, green: 0.52, blue: 0.20),
                                Color(red: 0.88, green: 0.32, blue: 0.16)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )

                        LinearGradient(
                            colors: [Color.white.opacity(0.24), Color.clear],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    }
                )
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .strokeBorder(Color.white.opacity(0.4), lineWidth: 1)
                )
                .shadow(color: Color(red: 1.0, green: 0.45, blue: 0.15).opacity(0.4), radius: 10, y: 3)
            }
            .buttonStyle(.plain)
            .padding(.top, 3)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 4)
    }

    // MARK: - Statistics Row
    private var statisticsRow: some View {
        HStack(spacing: 12) {
            statCard(title: "Faces Enrolled", value: "\(enrollmentStore.activeIdentities.count)", icon: "faceid")
            statCard(title: "Successful Unlocks", value: "\(analytics.totalUnlocks)", icon: "lock.open.fill")
            statCard(title: "Security Events", value: "\(analytics.totalFailed)", icon: "shield.lefthalf.filled")
        }
    }

    private func statCard(title: String, value: String, icon: String) -> some View {
        VStack(spacing: 4) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 12))
                    .foregroundStyle(Color.accentColor)
                Text(title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }

            Text(value)
                .font(SettingsMetrics.statFont)
                .foregroundStyle(SettingsMetrics.textPrimary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(SettingsMetrics.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )
        )
    }

    // MARK: - Security Status Card
    private var securityCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("SECURITY STATUS")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.2)
                .foregroundStyle(SettingsMetrics.textTertiary)

            VStack(spacing: 8) {
                statusRow(label: "Face Recognition", value: "Active", isActive: true)
                statusRow(label: "Liveness Detection", value: settings.livenessChecksEnabled ? "Active" : "Disabled", isActive: settings.livenessChecksEnabled)
                statusRow(label: "Profiles Enrolled", value: "\(enrollmentStore.activeIdentities.count)", isActive: enrollmentStore.activeIdentities.count > 0)
                statusRow(label: "Last Unlock", value: formattedLastUnlock, isActive: analytics.lastUnlockDate != nil)
            }
        }
        .padding(14)
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

    private func statusRow(label: String, value: String, isActive: Bool) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 12))
                .foregroundStyle(SettingsMetrics.textSecondary)

            Spacer()

            HStack(spacing: 5) {
                Circle()
                    .fill(isActive ? Color.green : Color.orange)
                    .frame(width: 5.5, height: 5.5)

                Text(value)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(SettingsMetrics.textPrimary)
            }
        }
    }

    // MARK: - Creator Section Card
    private var creatorCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("CREATED BY")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.2)
                .foregroundStyle(SettingsMetrics.textTertiary)

            VStack(alignment: .leading, spacing: 3) {
                Button {
                    openURL("https://www.instagram.com/sharan.created.this/")
                } label: {
                    Text("@sharan.created.this")
                        .font(.system(size: 13.5, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.accentColor)
                }
                .buttonStyle(.plain)

                Text("Photography · Film · Design · Code")
                    .font(.system(size: 10.5))
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }

            HStack(spacing: 8) {
                Button {
                    openURL("https://www.instagram.com/sharan.created.this/")
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 10))
                        Text("Instagram")
                            .font(.system(size: 11.5, weight: .medium))
                    }
                    .foregroundStyle(SettingsMetrics.textPrimary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(Color.white.opacity(0.08)))
                }
                .buttonStyle(.plain)

                Button {
                    isCoffeeSheetPresented = true
                } label: {
                    HStack(spacing: 5) {
                        Text("☕")
                            .font(.system(size: 11))
                        Text("Support")
                            .font(.system(size: 11.5, weight: .semibold))
                    }
                    .foregroundStyle(Color.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Capsule().fill(Color.accentColor.opacity(0.25)))
                    .overlay(Capsule().strokeBorder(Color.accentColor.opacity(0.45), lineWidth: 1))
                }
                .buttonStyle(.plain)
            }
            .padding(.top, 2)
        }
        .padding(14)
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

    // MARK: - Update Center Card (Sparkle 2)
    private var updateCenterCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            SettingsSectionTitle(text: "Software Update Center")

            SettingsGroup {
                // Check updates row
                SettingsActionRowContent(
                    title: "Check for Updates",
                    buttonTitle: "Check Now",
                    isEnabled: updater.canCheckForUpdates
                ) {
                    updater.checkForUpdates()
                }

                SettingsGroupDivider()

                // Live status row
                HStack {
                    Text("Update Status")
                        .font(.system(size: 13))
                        .foregroundStyle(SettingsMetrics.textPrimary)

                    Spacer()

                    HStack(spacing: 6) {
                        Circle()
                            .fill(updateStatusColor)
                            .frame(width: 6, height: 6)

                        Text(updater.updateStatus.displayText)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(SettingsMetrics.textSecondary)
                    }
                }
                .padding(.horizontal, SettingsMetrics.rowHorizontalInset)
                .padding(.vertical, 10)

                SettingsGroupDivider()

                // Auto check toggle
                SettingsRowContent(title: "Automatically check for updates") {
                    VisionToggle(isOn: $updater.automaticallyChecksForUpdates)
                }

                SettingsGroupDivider()

                // Background download toggle
                SettingsRowContent(title: "Automatically download updates in background") {
                    VisionToggle(isOn: $updater.automaticallyDownloadsUpdates)
                }

                SettingsGroupDivider()

                // What's new button
                SettingsActionRowContent(
                    title: "What's New in Vision",
                    buttonTitle: "View Notes",
                    isEnabled: true
                ) {
                    ReleaseNotesManager.shared.presentReleaseNotes(for: ReleaseNotesManager.shared.currentVersion)
                }
            }
        }
    }

    private var updateStatusColor: Color {
        switch updater.updateStatus {
        case .idle, .upToDate: return .green
        case .checking, .downloading: return .blue
        case .updateAvailable, .readyToInstall: return .orange
        case .error: return .red
        }
    }

    // MARK: - Footer Section
    private var footerSection: some View {
        VStack(spacing: 6) {
            HStack(spacing: 12) {
                Button("Privacy Policy") { openURL("https://tryvision.app/privacy") }
                Text("·").foregroundStyle(SettingsMetrics.textTertiary)
                Button("Terms") { openURL("https://tryvision.app") }
                Text("·").foregroundStyle(SettingsMetrics.textTertiary)
                Button("Documentation") { openURL("https://tryvision.app") }
                Text("·").foregroundStyle(SettingsMetrics.textTertiary)
                Button("Report a Bug") { openURL("mailto:swarnsharan@gmail.com?subject=Vision%20Bug%20Report") }
            }
            .font(.system(size: 11))
            .buttonStyle(.plain)
            .foregroundStyle(SettingsMetrics.textSecondary)

            Text("Copyright © 2026 SharanCreatedThis. All rights reserved.")
                .font(.system(size: 10))
                .foregroundStyle(SettingsMetrics.textTertiary)
        }
        .padding(.vertical, 8)
    }

    // MARK: - Helpers
    private func handleIconTap() {
        let now = Date()
        if let lastTapDate, now.timeIntervalSince(lastTapDate) > tapResetInterval {
            iconTapCount = 0
        }
        lastTapDate = now
        iconTapCount += 1
        guard iconTapCount >= requiredTapCount else { return }
        iconTapCount = 0
        environment.isDebugSectionRevealed = true
    }

    private func openURL(_ urlString: String) {
        if let url = URL(string: urlString) {
            NSWorkspace.shared.open(url)
        }
    }
}
