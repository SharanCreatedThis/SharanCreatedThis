//
//  SettingsSidebarView.swift
//  Vision
//
//  Permanent left sidebar navigation for Vision Settings 2.0.
//  Styled with frosted glass vibrancy, Apple System Settings aesthetics, and smooth selection animations.
//

import SwiftUI

struct SettingsSidebarView: View {
    @Binding var selection: SettingsTab
    let environment: AppEnvironment

    @State private var hoveredTab: SettingsTab?

    private var visibleTabs: [SettingsTab] {
        SettingsTab.visibleTabs(includingDebug: environment.isDebugSectionRevealed)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // MARK: - Header / Traffic Light Area
            HStack(spacing: 10) {
                // Subtle App Badge next to traffic lights area
                Image(nsImage: NSApp.applicationIconImage)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 22, height: 22)
                    .clipShape(RoundedRectangle(cornerRadius: 5.5, style: .continuous))
                    .shadow(color: Color.black.opacity(0.2), radius: 3, y: 1)

                Text("Vision")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Spacer()
            }
            .padding(.leading, 96) // Ample clearance for macOS traffic lights (red, yellow, green)
            .padding(.trailing, 16)
            .padding(.top, 20)
            .padding(.bottom, 22)

            // MARK: - Navigation Items
            VStack(spacing: 4) {
                ForEach(visibleTabs) { tab in
                    sidebarRow(for: tab)
                }
            }
            .padding(.horizontal, 10)

            Spacer(minLength: 16)

            // MARK: - Bottom Footer / Version Info
            VStack(alignment: .leading, spacing: 4) {
                Divider()
                    .background(Color.white.opacity(0.06))
                    .padding(.horizontal, 10)
                    .padding(.bottom, 8)

                HStack(spacing: 6) {
                    Circle()
                        .fill(VisionAnalytics.shared.analyticsEnabled ? Color.green : Color.secondary)
                        .frame(width: 5, height: 5)

                    Text("Vision 1.1")
                        .font(.system(size: 10.5, weight: .medium, design: .monospaced))
                        .foregroundStyle(SettingsMetrics.textTertiary)

                    Spacer()

                    if environment.isDebugSectionRevealed {
                        Text("DEBUG")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(Color.orange)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 1.5)
                            .background(Capsule().fill(Color.orange.opacity(0.15)))
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 16)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .frame(width: SettingsMetrics.sidebarWidth)
        .background(
            ZStack {
                VisualEffectView()
                Color.black.opacity(0.15)
            }
        )
    }

    private func sidebarRow(for tab: SettingsTab) -> some View {
        let isSelected = selection == tab
        let isHovered = hoveredTab == tab

        return Button {
            withAnimation(.spring(response: 0.28, dampingFraction: 0.82)) {
                selection = tab
            }
        } label: {
            HStack(spacing: 11) {
                // Tab Icon Tile
                tabIconView(tab.icon, isSelected: isSelected)
                    .frame(width: 20, height: 20)

                Text(tab.title)
                    .font(.system(size: 13, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(isSelected ? Color.white : (isHovered ? SettingsMetrics.textPrimary : SettingsMetrics.textSecondary))

                Spacer()

                if isSelected {
                    Circle()
                        .fill(Color.accentColor)
                        .frame(width: 5, height: 5)
                }
            }
            .padding(.horizontal, 12)
            .frame(height: 36)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(
                        isSelected
                            ? Color.accentColor.opacity(0.18)
                            : (isHovered ? Color.white.opacity(0.06) : Color.clear)
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .strokeBorder(
                        isSelected ? Color.accentColor.opacity(0.35) : Color.clear,
                        lineWidth: 1
                    )
            )
            .contentShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        }
        .buttonStyle(.plain)
        .onHover { hovering in
            hoveredTab = hovering ? tab : nil
        }
    }

    @ViewBuilder
    private func tabIconView(_ icon: SettingsTabIcon, isSelected: Bool) -> some View {
        switch icon {
        case .system(let name):
            Image(systemName: name)
                .font(.system(size: 13.5, weight: isSelected ? .semibold : .regular))
                .foregroundStyle(isSelected ? Color.accentColor : SettingsMetrics.textSecondary)
        case .asset(let name):
            Image(name)
                .renderingMode(.template)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .foregroundStyle(isSelected ? Color.accentColor : SettingsMetrics.textSecondary)
        }
    }
}
