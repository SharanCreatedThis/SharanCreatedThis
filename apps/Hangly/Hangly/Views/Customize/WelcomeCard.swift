//
//  WelcomeCard.swift
//  Hangly
//
//  The first thing a new install says.
//

import SwiftUI

/// Shown once, on the first launch, and never again.
///
/// Hangly has a problem no windowed app has: after installing it, the only evidence
/// it exists is a small thing swinging at the top of the screen, which is easy to
/// read as a glitch. This card is the introduction that solves that, and it has ten
/// seconds to do it in — so it is three short lines and two buttons rather than a
/// tour.
///
/// What keeps it from feeling like a tutorial is that the top half is not an
/// illustration of the app: it is the app, running the same solver on the charm the
/// person actually has, and it swings when it is pushed.
struct WelcomeCard: View {
    let charm: any Charm

    var onExplore: () -> Void = {}
    var onDismiss: () -> Void = {}

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var nudge = 0

    var body: some View {
        VStack(spacing: 0) {
            hero
            title
                .padding(.top, 2)
            promise
                .padding(.top, 20)
            buttons
                .padding(.top, 22)
        }
        .padding(.horizontal, 28)
        .padding(.bottom, 26)
        .frame(width: 360)
        .background(backdrop)
    }

    // MARK: - The app, being itself

    private var hero: some View {
        AboutHero(charm: charm, nudge: nudge, height: 158)
            .contentShape(Rectangle())
            .onTapGesture {
                guard !reduceMotion else { return }
                nudge += 1
            }
            .accessibilityLabel("\(charm.displayName), hanging on a rope")
            .accessibilityHint("Push the charm")
    }

    // MARK: - What it is

    private var title: some View {
        VStack(spacing: 7) {
            Text("Welcome to Hangly")
                .font(.system(size: 25, weight: .semibold, design: .rounded))
                .tracking(-0.3)

            Text("Tiny hanging charms from cultures around the world.")
                .font(.callout)
                .foregroundStyle(.secondary)
        }
        .multilineTextAlignment(.center)
        .fixedSize(horizontal: false, vertical: true)
        .accessibilityElement(children: .combine)
    }

    /// The three things there are to do, in the order people do them.
    ///
    /// Set on a plate with a hairline around it rather than in the flow of the card,
    /// because the point of this card is that the app is a small object you own, and
    /// the lines read as something engraved on one rather than as a feature list.
    private var promise: some View {
        VStack(spacing: 6) {
            line("Collect them.")
            line("Create your own.")
            line("Build your perfect rope.")
        }
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity)
        .background {
            RoundedRectangle(cornerRadius: 13, style: .continuous)
                .fill(.quaternary.opacity(0.28))
                .overlay {
                    RoundedRectangle(cornerRadius: 13, style: .continuous)
                        .strokeBorder(.white.opacity(0.07), lineWidth: 1)
                }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Collect them. Create your own. Build your perfect rope.")
    }

    private func line(_ text: String) -> some View {
        Text(text)
            .font(.callout.weight(.medium))
            .tracking(0.2)
            .foregroundStyle(.primary.opacity(0.82))
    }

    // MARK: - The two ways out

    private var buttons: some View {
        VStack(spacing: Space.snug) {
            Button(action: onExplore) {
                Text("Explore Library")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .keyboardShortcut(.defaultAction)

            Button("Keep Hanging", action: onDismiss)
                .buttonStyle(.plain)
                .font(.callout)
                .foregroundStyle(.secondary)
                .keyboardShortcut(.cancelAction)
                .help("Leave the charm where it is")
        }
    }

    /// A wash behind the rope that fades out before the words start, so the top of
    /// the card has some depth without any of it landing on the type.
    private var backdrop: some View {
        LinearGradient(
            colors: [Color.accentColor.opacity(0.13), Color.accentColor.opacity(0)],
            startPoint: .top,
            endPoint: .center
        )
        .ignoresSafeArea()
    }
}
