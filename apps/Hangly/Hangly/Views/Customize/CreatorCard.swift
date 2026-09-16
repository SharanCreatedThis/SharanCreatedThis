//
//  CreatorCard.swift
//  Hangly
//
//  Who made this, and three ways to say hello.
//

import AppKit
import SwiftUI

/// Where the creator lives, for anyone who wants to know.
enum Creator {
    static let handle = "@sharan.created.this"
    static let instagram = URL(string: "https://instagram.com/sharan.created.this")

    /// What the person who made this does, when not making this.
    static let disciplines = "Photography · Film · Design · Code"

    /// Where a bug goes. The subject is filled in so a report arrives with the
    /// version attached without anybody having to be asked for it.
    static func bugReport(version: String) -> URL? {
        mail(to: address, subject: "Hangly \(version) — bug report")
    }

    /// Where a charm idea goes.
    static let charmSuggestionAddress = "swarnsharan@gmail.com"

    static func charmSuggestion(version: String) -> URL? {
        mail(to: charmSuggestionAddress, subject: "Hangly \(version) — charm suggestion")
    }

    private static func mail(to destination: String, subject: String) -> URL? {
        var components = URLComponents()
        components.scheme = "mailto"
        components.path = destination
        components.queryItems = [URLQueryItem(name: "subject", value: subject)]
        return components.url
    }

    /// Kept here rather than in a view, so there is one place to change it.
    static let address = "digitaltools.sipl@gmail.com"

    /// Opens the profile in whatever handles it.
    static func openInstagram() {
        open(instagram)
    }

    static func open(_ url: URL?) {
        guard let url else { return }
        NSWorkspace.shared.open(url)
    }
}

/// A card on the About page: a handle and three things to do about it.
///
/// Three rather than one, and not three social networks. Following is the least
/// useful of them — a bug report and a charm suggestion are somebody telling you
/// something you could not have found out on your own, and putting all three here
/// costs no more room than the one did.
///
/// It also carries the credit line the page used to give its own band. Saying who
/// made the app twice on one screen, once as a heading and once as a card, was the
/// page repeating itself in two type sizes.
struct CreatorCard: View {
    let version: String

    /// Called when the Instagram button is pressed, so the page can report it.
    var onFollow: () -> Void = {}

    /// Called when the Buy Creator a Coffee button is pressed (optional).
    var onCoffee: (() -> Void)? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            BandLabel(text: "Created by")

            Text(Creator.handle)
                .font(.callout.weight(.semibold))

            Text(Creator.disciplines)
                .font(.caption2)
                .foregroundStyle(.tertiary)
                .lineLimit(1)
                .minimumScaleFactor(0.8)

            VStack(spacing: 6) {
                action("Instagram", symbol: "camera", help: "Opens https://instagram.com/sharan.created.this") {
                    onFollow()
                    Creator.openInstagram()
                }
                if let onCoffee {
                    action("☕ Buy Creator a Coffee", symbol: "cup.and.saucer.fill", help: "Help keep Hangly growing.") {
                        onCoffee()
                    }
                }
                HStack(spacing: 6) {
                    action("Bug Report", symbol: "ladybug", help: "Opens a message to the creator") {
                        Creator.open(Creator.bugReport(version: version))
                    }
                    action("Suggest a Charm", symbol: "lightbulb", help: "Suggest a charm to the creator (swarnsharan@gmail.com)") {
                        Creator.open(Creator.charmSuggestion(version: version))
                    }
                }
            }
            .padding(.top, 3)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
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

    /// Full width and stacked, because the column is about three hundred points
    /// wide and three labelled buttons in a row at that width are three ellipses.
    private func action(
        _ title: String,
        symbol: String,
        help: String,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Label(title, systemImage: symbol)
                .font(.caption)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 11)
                .padding(.vertical, 6)
        }
        .buttonStyle(SoftButtonStyle())
        .help(help)
    }
}
