//
//  ReleaseNotesView.swift
//  Vision
//
//  What's New release notes view presented after an application update.
//

import SwiftUI
import AppKit

public struct ReleaseNotesView: View {
    public let version: String
    public let items: [String]
    public let onDismiss: () -> Void

    @State private var appeared = false
    @State private var isHoveringButton = false

    public init(version: String, items: [String], onDismiss: @escaping () -> Void) {
        self.version = version
        self.items = items
        self.onDismiss = onDismiss
    }

    public var body: some View {
        ZStack {
            RadialGradient(
                colors: [
                    Color.accentColor.opacity(0.18),
                    Color.clear
                ],
                center: .top,
                startRadius: 10,
                endRadius: 280
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer(minLength: 4)

                // Version Icon Badge
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.accentColor.opacity(0.3), Color.accentColor.opacity(0.08)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 68, height: 68)

                    Image(systemName: "sparkles")
                        .font(.system(size: 30))
                        .foregroundStyle(Color.accentColor)
                }
                .scaleEffect(appeared ? 1.0 : 0.8)

                // Header
                VStack(spacing: 6) {
                    Text("Vision updated to \(version)")
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.white)

                    Text("What's New")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Color.accentColor)
                }

                // Bullets List
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(items.indices, id: \.self) { idx in
                        HStack(alignment: .top, spacing: 10) {
                            Circle()
                                .fill(Color.accentColor)
                                .frame(width: 5, height: 5)
                                .padding(.top, 6)

                            Text(items[idx])
                                .font(.system(size: 12.5, weight: .regular))
                                .foregroundStyle(Color.white.opacity(0.85))
                                .fixedSize(horizontal: false, vertical: true)
                                .lineSpacing(2)
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.white.opacity(0.04))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.08), lineWidth: 1)
                        )
                )

                Spacer(minLength: 4)

                // Action Button
                Button(action: onDismiss) {
                    Text("Continue")
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundStyle(Color.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 38)
                        .background(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.accentColor, Color.accentColor.opacity(0.85)],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.25), lineWidth: 1)
                        )
                        .shadow(color: Color.accentColor.opacity(isHoveringButton ? 0.4 : 0.2), radius: 8, y: 2)
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 24)
                .onHover { isHoveringButton = $0 }

                Spacer(minLength: 4)
            }
            .padding(24)
        }
        .frame(width: 380, height: 420)
        .background(Color(nsColor: .windowBackgroundColor).opacity(0.94))
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
        )
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                appeared = true
            }
        }
    }
}
