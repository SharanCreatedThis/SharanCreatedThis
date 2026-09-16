//
//  VaultSettingsPage.swift
//  Vision
//
//  Redesigned Vision Vault dashboard for Vision 2.0.
//  Cleanly segmented into Overview, Profiles, Protected Assets (Apps & Folders), and Cryptographic Audit Log.
//

import SwiftUI
import AppKit

struct VaultSettingsPage: View {
    @Bindable private var settings = VisionSettings.shared
    @State private var vaultManager = VisionVaultManager.shared
    @State private var profileStore = VaultProfileStore.shared
    @State private var isAuditLogExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            // MARK: - Overview Card
            SettingsGroup {
                SettingsRowContent(
                    title: "Vision Vault",
                    subtitle: "Biometric authentication required to launch protected apps & access secure folders"
                ) {
                    VisionToggle(isOn: $settings.isVaultEnabled)
                }
            }

            if settings.isVaultEnabled {
                // MARK: - Profiles Cards (Personal / Work / Custom)
                VStack(alignment: .leading, spacing: 8) {
                    SettingsSectionTitle(text: "Protection Profiles")

                    HStack(spacing: 12) {
                        profileTile(name: "Personal", icon: "person.fill", count: personalCount, isDefault: true)
                        profileTile(name: "Work", icon: "briefcase.fill", count: workCount, isDefault: false)
                        profileTile(name: "Confidential", icon: "shield.fill", count: confidentialCount, isDefault: false)
                    }
                }

                // MARK: - Protected Apps & Folders Cards
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        SettingsSectionTitle(text: "Protected Assets")

                        Spacer()

                        HStack(spacing: 8) {
                            Button(action: selectAppToProtect) {
                                HStack(spacing: 4) {
                                    Image(systemName: "plus.app.fill")
                                        .font(.system(size: 11))
                                    Text("Protect App")
                                        .font(.system(size: 11.5, weight: .semibold))
                                }
                                .foregroundStyle(Color.accentColor)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Capsule().fill(Color.accentColor.opacity(0.12)))
                            }
                            .buttonStyle(.plain)

                            Button(action: selectFolderToProtect) {
                                HStack(spacing: 4) {
                                    Image(systemName: "folder.badge.plus")
                                        .font(.system(size: 11))
                                    Text("Protect Folder")
                                        .font(.system(size: 11.5, weight: .semibold))
                                }
                                .foregroundStyle(Color.accentColor)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Capsule().fill(Color.accentColor.opacity(0.12)))
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if allRules.isEmpty {
                        emptyAssetsPlaceholder
                    } else {
                        VStack(spacing: 8) {
                            ForEach(allRules, id: \.rule.id) { item in
                                assetRow(rule: item.rule, profile: item.profile)
                            }
                        }
                    }
                }

                // MARK: - Cryptographic Audit Log (Collapsible)
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        SettingsSectionTitle(text: "Cryptographic Audit Log")

                        Spacer()

                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                isAuditLogExpanded.toggle()
                            }
                        } label: {
                            HStack(spacing: 4) {
                                Text(isAuditLogExpanded ? "Hide" : "Show All")
                                    .font(.system(size: 11, weight: .medium))
                                Image(systemName: isAuditLogExpanded ? "chevron.up" : "chevron.down")
                                    .font(.system(size: 9))
                            }
                            .foregroundStyle(SettingsMetrics.textSecondary)
                        }
                        .buttonStyle(.plain)
                    }

                    SettingsGroup {
                        let logs = isAuditLogExpanded ? Array(vaultManager.auditLogger.logs.prefix(8)) : Array(vaultManager.auditLogger.logs.prefix(3))
                        if logs.isEmpty {
                            SettingsRowContent(title: "No access events logged yet") {
                                Text("Secure")
                                    .font(.system(size: 11.5))
                                    .foregroundStyle(Color.green)
                            }
                        } else {
                            ForEach(Array(logs.enumerated()), id: \.element.id) { index, entry in
                                HStack {
                                    Image(systemName: entry.success ? "checkmark.shield.fill" : "xmark.shield.fill")
                                        .font(.system(size: 14))
                                        .foregroundStyle(entry.success ? Color.green : Color.red)

                                    VStack(alignment: .leading, spacing: 1) {
                                        Text(entry.targetName)
                                            .font(.system(size: 12.5, weight: .medium))
                                            .foregroundStyle(SettingsMetrics.textPrimary)

                                        Text("\(entry.authMode) • \(entry.timestamp.formatted(date: .omitted, time: .standard))")
                                            .font(.system(size: 10.5))
                                            .foregroundStyle(SettingsMetrics.textSecondary)
                                    }

                                    Spacer()

                                    Text(entry.success ? "Verified" : "Blocked")
                                        .font(.system(size: 10.5, weight: .semibold))
                                        .foregroundStyle(entry.success ? Color.green : Color.red)
                                        .padding(.horizontal, 7)
                                        .padding(.vertical, 2.5)
                                        .background(Capsule().fill((entry.success ? Color.green : Color.red).opacity(0.12)))
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)

                                if index < logs.count - 1 {
                                    SettingsGroupDivider()
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - Profile Tile
    private func profileTile(name: String, icon: String, count: Int, isDefault: Bool) -> some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(width: 32, height: 32)
                Image(systemName: icon)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.accentColor)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text(name)
                    .font(.system(size: 12.5, weight: .semibold))
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Text("\(count) items")
                    .font(.system(size: 10.5))
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }

            Spacer()
        }
        .padding(10)
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

    // MARK: - Asset Row
    private func assetRow(rule: VaultRule, profile: VaultProfile) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 32, height: 32)
                Image(systemName: rule.isApp ? "app.dashed" : "folder.fill")
                    .font(.system(size: 14))
                    .foregroundStyle(rule.isApp ? Color.accentColor : Color.blue)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(rule.name)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Text(rule.targetIdentifier)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(SettingsMetrics.textSecondary)
                    .lineLimit(1)
            }

            Spacer()

            Button(action: { removeRule(rule, from: profile) }) {
                Image(systemName: "trash")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.red.opacity(0.85))
                    .frame(width: 26, height: 26)
                    .background(Circle().fill(Color.red.opacity(0.12)))
            }
            .buttonStyle(.plain)
            .help("Remove protection")
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(SettingsMetrics.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )
        )
    }

    // MARK: - Empty Placeholder
    private var emptyAssetsPlaceholder: some View {
        VStack(spacing: 8) {
            Image(systemName: "lock.open.trianglebadge.exclamationmark")
                .font(.system(size: 24))
                .foregroundStyle(SettingsMetrics.textSecondary)

            Text("No Apps or Folders Protected")
                .font(.system(size: 12.5, weight: .medium))
                .foregroundStyle(SettingsMetrics.textPrimary)

            Text("Protect individual macOS apps or sensitive directories with Face ID verification.")
                .font(.system(size: 11))
                .foregroundStyle(SettingsMetrics.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(SettingsMetrics.cardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(SettingsMetrics.cardBorderColor, lineWidth: 1)
                )
        )
    }

    // MARK: - Helpers
    private var allRules: [(rule: VaultRule, profile: VaultProfile)] {
        profileStore.profiles.flatMap { profile in
            profile.rules.map { (rule: $0, profile: profile) }
        }
    }

    private var personalCount: Int {
        profileStore.profiles.first(where: { $0.name == "Personal" })?.rules.count ?? allRules.count
    }

    private var workCount: Int {
        profileStore.profiles.first(where: { $0.name == "Work" })?.rules.count ?? 0
    }

    private var confidentialCount: Int {
        profileStore.profiles.first(where: { $0.name == "Confidential" })?.rules.count ?? 0
    }

    private func selectAppToProtect() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = true
        panel.canChooseDirectories = false
        panel.allowsMultipleSelection = false
        panel.directoryURL = URL(fileURLWithPath: "/Applications")
        if panel.runModal() == .OK, let url = panel.url {
            let bundle = Bundle(url: url) ?? Bundle(path: url.path)
            let plistPath = url.appendingPathComponent("Contents/Info.plist").path
            let bundleID = bundle?.bundleIdentifier 
                ?? (NSDictionary(contentsOfFile: plistPath)?["CFBundleIdentifier"] as? String)
                ?? url.lastPathComponent
            let name = url.deletingPathExtension().lastPathComponent
            let rule = VaultRule(name: name, targetIdentifier: bundleID, isApp: true, authMode: .faceOnly)
            
            if profileStore.profiles.isEmpty {
                let newProfile = VaultProfile(name: "Personal", iconName: "person.fill", rules: [rule])
                profileStore.addProfile(newProfile)
            } else {
                var updated = profileStore.profiles[0]
                updated.rules.append(rule)
                profileStore.updateProfile(updated)
            }
            vaultManager.startVaultMonitoring()
        }
    }

    private func selectFolderToProtect() {
        let panel = NSOpenPanel()
        panel.canChooseFiles = false
        panel.canChooseDirectories = true
        panel.allowsMultipleSelection = false
        if panel.runModal() == .OK, let url = panel.url {
            let name = url.lastPathComponent
            let rule = VaultRule(name: name, targetIdentifier: url.path, isApp: false, authMode: .faceOnly)
            
            if profileStore.profiles.isEmpty {
                let newProfile = VaultProfile(name: "Personal", iconName: "person.fill", rules: [rule])
                profileStore.addProfile(newProfile)
            } else {
                var updated = profileStore.profiles[0]
                updated.rules.append(rule)
                profileStore.updateProfile(updated)
            }
            vaultManager.startVaultMonitoring()
        }
    }

    private func removeRule(_ rule: VaultRule, from profile: VaultProfile) {
        var updatedProfile = profile
        updatedProfile.rules.removeAll { $0.id == rule.id }
        profileStore.updateProfile(updatedProfile)
        vaultManager.startVaultMonitoring()
    }
}
