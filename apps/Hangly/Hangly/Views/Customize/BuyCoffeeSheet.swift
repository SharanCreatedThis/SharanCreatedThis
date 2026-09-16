//
//  BuyCoffeeSheet.swift
//  Hangly
//
//  Lightweight creator support modal sheet.
//

import AppKit
import SwiftUI

/// A tasteful, optional sheet allowing users to support the creator via UPI.
struct BuyCoffeeSheet: View {
    let source: String
    var analytics: AnalyticsManager?
    @Environment(\.dismiss) private var dismiss

    static let upiID = "8870786087@yescred"

    @State private var hasCopied = false
    @State private var copyResetTask: Task<Void, Never>?

    var body: some View {
        VStack(spacing: Space.regular) {
            header
            qrCodeView
            upiSection
            footer
        }
        .padding(.horizontal, Space.page)
        .padding(.vertical, 22)
        .frame(width: 340)
        .background {
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(.regularMaterial)
                .overlay {
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .strokeBorder(Color.primary.opacity(0.08), lineWidth: 1)
                }
        }
        .overlay(alignment: .topTrailing) {
            closeButton
        }
        .onAppear {
            analytics?.track(.coffeeSheetOpened(source: source))
            analytics?.track(.coffeeQRViewed(source: source))
        }
        .onDisappear {
            copyResetTask?.cancel()
        }
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 5) {
            Text("☕ Buy Creator a Coffee")
                .font(.system(size: 19, weight: .semibold, design: .rounded))
                .multilineTextAlignment(.center)

            Text("Help keep Hangly growing.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 4)
    }

    // MARK: - QR Code

    private var qrCodeView: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.12), radius: 10, y: 5)

            Image("CreatorUPIQR")
                .resizable()
                .interpolation(.none)
                .scaledToFit()
                .padding(10)
        }
        .frame(width: 220, height: 220)
        .padding(.vertical, 2)
    }

    // MARK: - UPI Section

    private var upiSection: some View {
        VStack(spacing: Space.tight) {
            Text("UPI ID: \(Self.upiID)")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)
                .textSelection(.enabled)

            Button {
                copyUPI()
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: hasCopied ? "checkmark" : "doc.on.doc")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(hasCopied ? .green : .primary)

                    Text(hasCopied ? "Copied" : "Copy UPI ID")
                        .font(.callout.weight(.medium))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.regular)
            .tint(hasCopied ? Color.green.opacity(0.8) : nil)
            .animation(Motion.hover, value: hasCopied)
        }
        .padding(.horizontal, Space.tight)
    }

    // MARK: - Footer

    private var footer: some View {
        Text("Thank you for using Hangly ❤️")
            .font(.caption)
            .foregroundStyle(.secondary)
            .padding(.top, 2)
    }

    // MARK: - Close Button

    private var closeButton: some View {
        Button {
            dismiss()
        } label: {
            Image(systemName: "xmark.circle.fill")
                .font(.system(size: 19))
                .foregroundStyle(.tertiary)
                .padding(12)
        }
        .buttonStyle(.plain)
        .keyboardShortcut(.cancelAction)
        .help("Close (Esc)")
        .accessibilityLabel("Close")
    }

    // MARK: - Actions

    private func copyUPI() {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(Self.upiID, forType: .string)

        analytics?.track(.coffeeCopyUPI(source: source))

        hasCopied = true
        copyResetTask?.cancel()
        copyResetTask = Task {
            try? await Task.sleep(nanoseconds: 2_500_000_000)
            if !Task.isCancelled {
                hasCopied = false
            }
        }
    }
}
