//
//  AboutSecrets.swift
//  Hangly
//
//  The button that knows things.
//

import SwiftUI

/// Ask the app for a secret, and see what it says.
///
/// Most answers are jokes, two are rare enough to be worth telling somebody about,
/// and four are notes from the person who made it — those are not luck. They arrive
/// on exact counts, so they are found by persistence rather than by chance, which is
/// the only kind of hidden thing a person can deliberately go and get.
///
/// Drawn as a card the same size as the creator's, so the two sit as a pair rather
/// than as a button that happens to be beside a card.
struct AboutSecrets: View {
    /// How many secrets this install has been told before now.
    let secretsFound: Int

    /// Records the ask and returns which secret it is in the life of the install.
    let ask: () -> Int

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var vault = SecretVault()
    @State private var revealed: Secret?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            BandLabel(text: "Secrets")
            button
            progress
            stage
        }
        // Centred rather than pinned to the top. The stage keeps room for an
        // answer whether or not one has been asked for, and a card whose lower
        // half is reserved looks better with the reservation shared top and
        // bottom than with it all hanging underneath the button.
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(.vertical, 14)
        .padding(.horizontal, 16)
        .background {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(.quaternary.opacity(0.3))
        }
        .overlay {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(Color.primary.opacity(0.07), lineWidth: 1)
        }
    }

    private var button: some View {
        Button {
            let next = vault.reveal(lifetimeCount: ask())
            if reduceMotion {
                revealed = next
            } else {
                withAnimation(.smooth(duration: 0.3)) { revealed = next }
            }
        } label: {
            Text("Tell me a secret")
                .font(.callout.weight(.medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
        }
        .buttonStyle(SoftButtonStyle())
        .accessibilityLabel("Tell me a secret")
        .accessibilityHint("Reveals one of the app's secrets, and pushes the rope")
    }

    /// A fixed stage, so revealing a secret fades one in rather than pushing the
    /// page around under the pointer. The `ZStack` is what makes it a crossfade: the
    /// outgoing secret is still there, fading, while the incoming one arrives.
    private var stage: some View {
        ZStack(alignment: .topLeading) {
            if let secret = revealed {
                secretView(secret)
                    .id(secret)
                    .transition(.opacity.combined(with: .offset(y: 6)))
            }
        }
        .frame(maxWidth: .infinity, minHeight: 58, alignment: .topLeading)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(revealed.map(description) ?? "No secret revealed yet")
        .accessibilityAddTraits(.updatesFrequently)
    }

    @ViewBuilder
    private func secretView(_ secret: Secret) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            if let title = secret.title {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(titleStyle(for: secret))
            }

            Text(secret.message)
                .font(messageFont(for: secret))
                .foregroundStyle(secret.title == nil ? .primary : .secondary)
                .fixedSize(horizontal: false, vertical: true)

            if let attribution = secret.attribution {
                Text(attribution)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .multilineTextAlignment(.leading)
    }

    /// How far it is to the next note. Shown only once somebody has started, so it
    /// is a trail rather than an advertisement for a feature nobody asked about.
    @ViewBuilder private var progress: some View {
        if secretsFound > 0, let next = SecretVault.nextNote(after: secretsFound) {
            let remaining = next - secretsFound
            Text(remaining == 1 ? "One more for a note from the maker" : "\(remaining) more until something else")
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .lineLimit(2)
                .transition(.opacity)
        }
    }

    private func titleStyle(for secret: Secret) -> AnyShapeStyle {
        secret.rarity == .common ? AnyShapeStyle(.primary) : AnyShapeStyle(.tint)
    }

    /// The luck bar is drawn out of block characters, which only line up into a bar
    /// in a face whose glyphs share an advance. Everything else keeps the app's
    /// regular one.
    private func messageFont(for secret: Secret) -> Font {
        secret.message.contains(where: \.isBlockElement) ? .caption.monospaced() : .caption
    }

    private func description(_ secret: Secret) -> String {
        [secret.title, secret.message, secret.attribution]
            .compactMap { $0 }
            .joined(separator: ". ")
    }
}
