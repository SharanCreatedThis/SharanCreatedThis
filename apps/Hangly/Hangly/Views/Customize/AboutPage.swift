//
//  AboutPage.swift
//  Hangly
//

import SwiftUI

/// Identity, credit, and a button that knows things.
///
/// The one page of Customize that asks nothing of anybody, and the only one whose
/// job is to be liked.
///
/// It used to be a column: a full-width rope, then a title, then three numbers, then
/// a credit, then a button, then a card, then a footer — each with forty points of
/// air around it, and the whole thing more than a window tall. Air is not the same
/// as generosity. What it is now is the same content in four bands, read left to
/// right where the content allows it, and it fits on one screen with nothing
/// scrolled and nothing crowded.
///
/// There are things hidden in it. The charm can be pushed, and pushing it tells you
/// something true about the charm; the secrets button has two rare answers and four
/// notes that arrive on exact counts. None of it is advertised, and all of it is
/// reachable by somebody idly clicking, which is the correct way round.
struct AboutPage: View {
    let viewModel: SettingsViewModel

    /// Shown at the foot of the page, collapsed. See `AnalyticsDebugPanel`.
    let analytics: AnalyticsManager?

    /// How wide the page lets itself get. Wide enough for the two cards to sit side
    /// by side, narrow enough that the prose never runs the width of a big display.
    static let contentWidth = 640.0

    @State private var nudge = 0
    @State private var fact: String?
    @State private var isCoffeeSheetPresented = false
    @State private var isReleaseNotesPresented = false

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    var body: some View {
        // Centred in whatever room there is, rather than stacked from the top with
        // the slack left in a heap at the bottom. The scroll view is a floor, not a
        // layout: at the window's default size nothing here needs scrolling, and on
        // a window dragged short everything is still reachable.
        GeometryReader { proxy in
            ScrollView {
                page.frame(minHeight: proxy.size.height)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .sheet(isPresented: $isCoffeeSheetPresented) {
            BuyCoffeeSheet(source: "about", analytics: analytics)
        }
        .sheet(isPresented: $isReleaseNotesPresented) {
            ReleaseNotesSheet(analytics: analytics)
        }
    }

    private var page: some View {
        VStack(spacing: 18) {
            header

            AboutStatistics(
                charms: viewModel.charmCount,
                launches: viewModel.launchCount,
                secretsFound: viewModel.secretsFound
            )

            // The two cards match each other's height and nothing else. Each one
            // fills the row, and the row is fixed to its own ideal — without that
            // last part they fill the *window*, and a page centred in its scroll
            // view hands them every point it is not using.
            HStack(alignment: .top, spacing: 16) {
                AboutSecrets(secretsFound: viewModel.secretsFound, ask: askForSecret)
                CreatorCard(
                    version: viewModel.versionDescription,
                    onFollow: { viewModel.reportFollowClicked() }
                )
            }
            .fixedSize(horizontal: false, vertical: true)

            footer
                .padding(.top, 2)

            if let analytics {
                AnalyticsDebugPanel(analytics: analytics)
            }
        }
        .frame(maxWidth: Self.contentWidth)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 28)
        .padding(.vertical, 22)
    }

    // MARK: - Who this is

    /// The app, running, beside its own name. Side by side rather than stacked:
    /// the rope wants height and the words want width, and putting them in a row
    /// spends one lot of vertical on both.
    private var header: some View {
        HStack(alignment: .center, spacing: 20) {
            hero

            VStack(alignment: .leading, spacing: 4) {
                Text(viewModel.appName)
                    .font(.system(size: 30, weight: .semibold, design: .rounded))
                    .tracking(-0.4)

                Text("A tiny piece of motion for your desktop.")
                    .font(.callout)
                    .foregroundStyle(.secondary)

                Button {
                    isReleaseNotesPresented = true
                } label: {
                    HStack(spacing: 4) {
                        Text(viewModel.versionDescription)
                        Text("·  Release Notes")
                            .underline()
                    }
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                }
                .buttonStyle(.plain)
                .padding(.top, 1)
                .help("View Release Notes")

                AboutCoffeeButton {
                    isCoffeeSheetPresented = true
                }
                .padding(.top, 8)

                factLine
            }

            Spacer(minLength: 0)
        }
    }

    /// The charm can be pushed. It swings, it counts, and it says what it is —
    /// which is the whole of the first easter egg and needs no label saying so.
    private var hero: some View {
        AboutHero(charm: viewModel.previewCharm, nudge: nudge, height: 152)
            .frame(width: 158)
            .contentShape(Rectangle())
            .onTapGesture { push() }
            .accessibilityAddTraits(.isButton)
            .accessibilityHint("Push the charm, and hear something about it")
    }

    /// What the charm is, once somebody has pushed it.
    private var factLine: some View {
        ZStack(alignment: .topLeading) {
            if let fact {
                Text(fact)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
                    .fixedSize(horizontal: false, vertical: true)
                    .id(fact)
                    .transition(.opacity.combined(with: .offset(y: 4)))
            }
        }
        .frame(minHeight: fact != nil ? 34 : 0, alignment: .topLeading)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, fact != nil ? 4 : 0)
        .accessibilityLabel(fact ?? "")
        .accessibilityHidden(fact == nil)
    }

    private func push() {
        viewModel.recordCharmPush()
        if !reduceMotion { nudge += 1 }
        let next = viewModel.currentCharmFact
        guard !reduceMotion else {
            fact = next
            return
        }
        withAnimation(.smooth(duration: 0.28)) { fact = next }
    }

    /// Asks for a secret, pushes the rope, and says which secret it is.
    private func askForSecret() -> Int {
        if !reduceMotion { nudge += 1 }
        return viewModel.recordSecretFound()
    }

    // MARK: - Footer

    /// Two lines of small print, and a third that has to be earned.
    private var footer: some View {
        VStack(spacing: 4) {
            Text(analyticsStatus)
                .font(.caption2)
                .foregroundStyle(.tertiary)

            swings

            Text(viewModel.copyright)
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
    }

    /// Said in words rather than shown as a switch, because this is the page people
    /// come to when they want to know what an app is doing, and a switch on an
    /// About page reads as somewhere to change it.
    private var analyticsStatus: String {
        viewModel.analyticsEnabled
            ? "Anonymous usage sharing is on"
            : "Anonymous usage sharing is off"
    }

    /// Appears once the number is large enough to be worth a line. Nothing
    /// anywhere says it is being counted.
    @ViewBuilder private var swings: some View {
        if viewModel.charmPushes >= Self.swingsWorthMentioning {
            Text("Swings survived: \(viewModel.charmPushes.formatted())")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .monospacedDigit()
                .transition(.opacity)
        }
    }

    /// Below this it is a rounding error; at it, it is a fact about somebody.
    private static let swingsWorthMentioning = 10
}

// MARK: - Creator Support Button

/// Prominent, spacious creator-support card button sitting right below the version.
///
/// Designed with glassmorphic styling, warm amber lighting, and an eye-catching coffee cup badge.
struct AboutCoffeeButton: View {
    let action: () -> Void

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var isHovered = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                // Eye-catching coffee cup badge
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.orange.opacity(isHovered ? 0.38 : 0.22),
                                    Color(red: 0.82, green: 0.48, blue: 0.18).opacity(isHovered ? 0.28 : 0.14)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)
                        .overlay(
                            Circle()
                                .strokeBorder(
                                    LinearGradient(
                                        colors: [
                                            Color.orange.opacity(isHovered ? 0.75 : 0.40),
                                            Color.yellow.opacity(isHovered ? 0.45 : 0.15)
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 1
                                )
                        )

                    Image(systemName: "cup.and.saucer.fill")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color.orange, Color(red: 1.0, green: 0.78, blue: 0.35)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                }

                // Exact button copy
                VStack(alignment: .leading, spacing: 3) {
                    Text("☕ Buy Creator a Coffee")
                        .font(.system(size: 15, weight: .semibold, design: .rounded))
                        .foregroundStyle(.primary)

                    Text("Help keep Hangly growing.")
                        .font(.system(size: 12.5, weight: .regular))
                        .foregroundStyle(.secondary)
                }

                Spacer(minLength: 12)

                // Trailing arrow / chevron indicator
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(isHovered ? Color.orange : Color.secondary.opacity(0.45))
                    .offset(x: isHovered ? 2 : 0)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(.ultraThinMaterial)
            }
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.orange.opacity(isHovered ? 0.15 : 0.08),
                                Color(red: 0.82, green: 0.48, blue: 0.18).opacity(isHovered ? 0.09 : 0.04)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
            .overlay {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [
                                Color.orange.opacity(isHovered ? 0.68 : 0.35),
                                Color.white.opacity(isHovered ? 0.32 : 0.14)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
            .shadow(
                color: Color.orange.opacity(isHovered ? 0.30 : 0.10),
                radius: isHovered ? 14 : 6,
                x: 0,
                y: isHovered ? 4 : 2
            )
            .scaleEffect(isHovered && !reduceMotion ? 1.018 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.75), value: isHovered)
        }
        .buttonStyle(.plain)
        .onHover { isHovered = $0 }
        .help("Help keep Hangly growing.")
    }
}
