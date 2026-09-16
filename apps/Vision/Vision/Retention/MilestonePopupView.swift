//
//  MilestonePopupView.swift
//  Vision
//
//  5th launch celebration & creator appreciation milestone modal.
//

import SwiftUI
import AppKit

public struct MilestonePopupView: View {
    public let onInstagram: () -> Void
    public let onBuyCoffee: () -> Void
    public let onContinue: () -> Void

    @State private var appeared = false
    @State private var isHoveringInstagram = false
    @State private var isHoveringCoffee = false
    @State private var isHoveringContinue = false

    public init(
        onInstagram: @escaping () -> Void,
        onBuyCoffee: @escaping () -> Void,
        onContinue: @escaping () -> Void
    ) {
        self.onInstagram = onInstagram
        self.onBuyCoffee = onBuyCoffee
        self.onContinue = onContinue
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
                endRadius: 260
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
                Spacer(minLength: 8)

                // Creator Icon / Avatar Badge
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.accentColor.opacity(0.35), Color.accentColor.opacity(0.1)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 76, height: 76)

                    Text("✨")
                        .font(.system(size: 36))
                }
                .scaleEffect(appeared ? 1.0 : 0.8)

                // Title
                VStack(spacing: 6) {
                    Text("Thanks for using Vision ✨")
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.white)
                        .multilineTextAlignment(.center)

                    VStack(spacing: 3) {
                        Text("Created by")
                            .font(.system(size: 11.5, weight: .medium))
                            .foregroundStyle(Color.white.opacity(0.6))

                        Text("@sharan.created.this")
                            .font(.system(size: 13.5, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.accentColor)
                    }
                    .padding(.top, 4)
                }

                // Action Buttons
                VStack(spacing: 10) {
                    // Instagram Button
                    Button(action: onInstagram) {
                        HStack(spacing: 8) {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 12))
                            Text("Instagram")
                                .font(.system(size: 13, weight: .semibold))
                            Spacer()
                            Image(systemName: "arrow.up.right")
                                .font(.system(size: 10, weight: .semibold))
                        }
                        .foregroundStyle(Color.white)
                        .padding(.horizontal, 16)
                        .frame(height: 38)
                        .background(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .fill(Color.white.opacity(isHoveringInstagram ? 0.12 : 0.07))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.12), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .onHover { isHoveringInstagram = $0 }

                    // Buy Creator a Coffee Button
                    Button(action: onBuyCoffee) {
                        HStack(spacing: 8) {
                            Text("☕")
                                .font(.system(size: 13))
                            Text("Buy Creator a Coffee")
                                .font(.system(size: 13, weight: .semibold))
                            Spacer()
                            Image(systemName: "heart.fill")
                                .font(.system(size: 10))
                                .foregroundStyle(Color.pink.opacity(0.85))
                        }
                        .foregroundStyle(Color.white)
                        .padding(.horizontal, 16)
                        .frame(height: 38)
                        .background(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.accentColor.opacity(0.35), Color.accentColor.opacity(0.18)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .strokeBorder(Color.accentColor.opacity(0.5), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .onHover { isHoveringCoffee = $0 }

                    // Continue Button
                    Button(action: onContinue) {
                        Text("Continue")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(Color.white.opacity(isHoveringContinue ? 0.9 : 0.6))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                    }
                    .buttonStyle(.plain)
                    .onHover { isHoveringContinue = $0 }
                }
                .padding(.horizontal, 28)
                .padding(.top, 4)

                Spacer(minLength: 8)
            }
            .padding(24)
        }
        .frame(width: 360, height: 380)
        .background(Color(nsColor: .windowBackgroundColor).opacity(0.92))
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
