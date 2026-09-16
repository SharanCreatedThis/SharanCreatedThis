//
//  SettingsPageHeader.swift
//  Vision
//
//  Global header presented consistently at the top of every settings page.
//  Displays the page title, category subtitle, and a compact Session Unlocked pill.
//

import SwiftUI

struct SettingsPageHeader: View {
    let tab: SettingsTab
    let pocController: POCController
    var trailingAction: HeaderAction?

    var body: some View {
        HStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 8) {
                    Text(tab.title)
                        .font(SettingsMetrics.pageTitleFont)
                        .foregroundStyle(SettingsMetrics.textPrimary)

                    Text("·")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(SettingsMetrics.textTertiary)

                    Text("Face ID for Mac")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Color.accentColor)
                }

                Text(tab.subtitle)
                    .font(SettingsMetrics.pageSubtitleFont)
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }

            Spacer(minLength: 12)

            HStack(spacing: 8) {
                if let trailingAction {
                    Button(action: trailingAction.perform) {
                        Image(systemName: "arrow.trianglehead.clockwise.rotate.90")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(SettingsMetrics.textPrimary)
                            .frame(width: 28, height: 28)
                            .background(Circle().fill(SettingsMetrics.rowColor))
                            .overlay(
                                Circle()
                                    .strokeBorder(SettingsMetrics.rowBorder, lineWidth: SettingsMetrics.rowBorderWidth)
                            )
                            .contentShape(Circle())
                    }
                    .buttonStyle(.plain)
                    .help("Refresh")
                }

                SessionLockButton(pocController: pocController)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
        .padding(.bottom, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
