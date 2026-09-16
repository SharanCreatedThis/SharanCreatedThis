//
//  WelcomeView.swift
//  Vision
//
//  First-launch onboarding welcome screen featuring Apple-quality aesthetics.
//

import SwiftUI
import AppKit

public struct WelcomeView: View {
    public let onSetUp: () -> Void
    public let onLearnMore: () -> Void

    @State private var hasAppeared = false
    @State private var isHoveringPrimary = false
    @State private var isHoveringSecondary = false

    public init(onSetUp: @escaping () -> Void, onLearnMore: @escaping () -> Void) {
        self.onSetUp = onSetUp
        self.onLearnMore = onLearnMore
    }

    public var body: some View {
        ZStack {
            // Background subtle gradient glow
            RadialGradient(
                colors: [
                    Color.accentColor.opacity(0.18),
                    Color.clear
                ],
                center: .top,
                startRadius: 20,
                endRadius: 280
            )
            .ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer(minLength: 12)

                // Animated App Icon / Face ID Badge
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color.accentColor.opacity(0.25), Color.accentColor.opacity(0.05)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 96, height: 96)
                        .blur(radius: hasAppeared ? 8 : 2)

                    if let appIcon = NSApp.applicationIconImage {
                        Image(nsImage: appIcon)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 76, height: 76)
                            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 18, style: .continuous)
                                    .strokeBorder(Color.white.opacity(0.18), lineWidth: 1)
                            )
                            .shadow(color: Color.black.opacity(0.3), radius: 12, x: 0, y: 6)
                    } else {
                        Image(systemName: "faceid")
                            .font(.system(size: 42, weight: .light))
                            .foregroundStyle(Color.accentColor)
                    }
                }
                .scaleEffect(hasAppeared ? 1.0 : 0.82)
                .opacity(hasAppeared ? 1.0 : 0.0)

                // Title & Tagline
                VStack(spacing: 8) {
                    Text("Welcome to Vision")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.white)
                        .tracking(0.3)

                    Text("Unlock your Mac with your face.")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Color.white.opacity(0.7))
                }
                .offset(y: hasAppeared ? 0 : 8)
                .opacity(hasAppeared ? 1.0 : 0.0)

                // Feature Highlights Pill
                HStack(spacing: 16) {
                    featureBadge(icon: "lock.shield.fill", text: "Secure On-Device")
                    featureBadge(icon: "bolt.fill", text: "Instant Unlock")
                    featureBadge(icon: "eye.fill", text: "Liveness Protection")
                }
                .padding(.vertical, 8)
                .padding(.horizontal, 14)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.04))
                        .overlay(Capsule().strokeBorder(Color.white.opacity(0.08), lineWidth: 1))
                )
                .offset(y: hasAppeared ? 0 : 12)
                .opacity(hasAppeared ? 1.0 : 0.0)

                Spacer(minLength: 12)

                // Action Buttons
                VStack(spacing: 12) {
                    Button(action: onSetUp) {
                        HStack(spacing: 8) {
                            Image(systemName: "faceid")
                                .font(.system(size: 15, weight: .semibold))
                            Text("Set Up Face ID")
                                .font(.system(size: 14, weight: .semibold, design: .rounded))
                        }
                        .foregroundStyle(Color.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 42)
                        .background(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [Color.accentColor, Color.accentColor.opacity(0.85)],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .strokeBorder(Color.white.opacity(0.25), lineWidth: 1)
                        )
                        .shadow(color: Color.accentColor.opacity(isHoveringPrimary ? 0.45 : 0.25), radius: 10, y: 3)
                        .scaleEffect(isHoveringPrimary ? 1.015 : 1.0)
                    }
                    .buttonStyle(.plain)
                    .onHover { isHoveringPrimary = $0 }

                    Button(action: onLearnMore) {
                        HStack(spacing: 4) {
                            Text("Learn More")
                                .font(.system(size: 12.5, weight: .medium))
                            Image(systemName: "arrow.up.right")
                                .font(.system(size: 9.5, weight: .semibold))
                        }
                        .foregroundStyle(isHoveringSecondary ? Color.white : Color.white.opacity(0.6))
                        .padding(.vertical, 6)
                        .padding(.horizontal, 12)
                    }
                    .buttonStyle(.plain)
                    .onHover { isHoveringSecondary = $0 }
                }
                .padding(.horizontal, 32)
                .offset(y: hasAppeared ? 0 : 16)
                .opacity(hasAppeared ? 1.0 : 0.0)

                Spacer(minLength: 8)
            }
            .padding(28)
        }
        .frame(width: 420, height: 440)
        .background(Color(nsColor: .windowBackgroundColor).opacity(0.88))
        .background(.ultraThinMaterial)
        .onAppear {
            withAnimation(.spring(response: 0.55, dampingFraction: 0.8, blendDuration: 0)) {
                hasAppeared = true
            }
        }
    }

    private func featureBadge(icon: String, text: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 9.5, weight: .medium))
                .foregroundStyle(Color.accentColor)
            Text(text)
                .font(.system(size: 10.5, weight: .medium))
                .foregroundStyle(Color.white.opacity(0.8))
        }
    }
}
