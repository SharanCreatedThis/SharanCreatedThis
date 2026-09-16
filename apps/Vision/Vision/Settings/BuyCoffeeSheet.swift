//
//  BuyCoffeeSheet.swift
//  Vision
//
//  Creator appreciation modal sheet with UPI QR code and copy button.
//

import SwiftUI
import AppKit

public struct BuyCoffeeSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var isCopied = false

    private let upiID = "8870786087@yescred"

    public init() {}

    public var body: some View {
        VStack(spacing: 20) {
            // Header with Close Button
            HStack {
                Spacer()
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 18))
                        .foregroundStyle(SettingsMetrics.textTertiary)
                }
                .buttonStyle(.plain)
            }

            // Title & Subtitle
            VStack(spacing: 6) {
                Text("☕ Buy Creator a Coffee")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(SettingsMetrics.textPrimary)

                Text("Help keep Vision growing.")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(SettingsMetrics.textSecondary)
            }

            // Large Centered QR Code
            ZStack {
                if let nsImage = NSImage(named: "CreatorUPIQR") {
                    Image(nsImage: nsImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 210, height: 210)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                        )
                        .shadow(color: Color.black.opacity(0.35), radius: 12, x: 0, y: 6)
                } else {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.gray.opacity(0.2))
                        .frame(width: 210, height: 210)
                }
            }
            .padding(.vertical, 4)

            // UPI ID & Copy Row
            VStack(spacing: 8) {
                Text("UPI ID: \(upiID)")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(SettingsMetrics.textSecondary)

                HStack(spacing: 8) {
                    Text(upiID)
                        .font(.system(size: 13, weight: .semibold, design: .monospaced))
                        .foregroundStyle(SettingsMetrics.textPrimary)

                    Button {
                        copyUPIID()
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: isCopied ? "checkmark" : "doc.on.doc")
                                .font(.system(size: 11, weight: .semibold))
                            Text(isCopied ? "Copied" : "Copy")
                                .font(.system(size: 11, weight: .semibold))
                        }
                        .foregroundStyle(isCopied ? Color.green : Color.accentColor)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(
                            Capsule()
                                .fill(isCopied ? Color.green.opacity(0.15) : Color.accentColor.opacity(0.15))
                        )
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(Color(nsColor: .controlBackgroundColor).opacity(0.6))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.08), lineWidth: 1)
                        )
                )
            }

            // Footer Appreciation
            Text("Thank you for using Vision ❤️")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(SettingsMetrics.textSecondary)
                .padding(.top, 4)
        }
        .padding(24)
        .frame(width: 340)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color(nsColor: .windowBackgroundColor))
        )
    }

    private func copyUPIID() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(upiID, forType: .string)
        withAnimation(.easeInOut(duration: 0.2)) {
            isCopied = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            withAnimation(.easeInOut(duration: 0.2)) {
                isCopied = false
            }
        }
    }
}
