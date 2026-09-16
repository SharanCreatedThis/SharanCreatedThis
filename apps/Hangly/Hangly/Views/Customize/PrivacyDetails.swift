//
//  PrivacyDetails.swift
//  Hangly
//
//  Exactly what is collected, written where it can be read.
//

import SwiftUI

/// The full list, in the app rather than in a document nobody opens.
///
/// Written out by hand rather than generated from `AnalyticsEvent`, and that is the
/// point: the two have to be kept in step by a person, and a person adding an event
/// has to decide what to write here. A generated list would always be accurate and
/// would tell nobody anything.
struct PrivacyDetails: View {
    @Environment(\.dismiss)
    private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: Space.section) {
                    header
                    section("What is sent", items: Self.collected)
                    section("What is never sent", items: Self.notCollected, symbol: "xmark")
                    footer
                }
                .padding(Space.page)
            }

            Divider()
            HStack {
                Spacer()
                Button("Done") { dismiss() }
                    .keyboardShortcut(.defaultAction)
            }
            .padding(Space.regular)
        }
        .frame(width: 460, height: 520)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: Space.tight) {
            Text("Anonymous Analytics")
                .font(.title2.weight(.semibold))
            Text("Hangly counts how its features are used so it can be made better. "
                 + "There is no account, no name, and nothing that identifies you.")
                .font(.callout)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func section(_ title: String, items: [String], symbol: String = "checkmark") -> some View {
        VStack(alignment: .leading, spacing: Space.snug) {
            Text(title)
                .font(.headline)
            ForEach(items, id: \.self) { item in
                HStack(alignment: .firstTextBaseline, spacing: Space.snug) {
                    Image(systemName: symbol)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(symbol == "checkmark" ? Color.secondary : Color.orange)
                        .frame(width: 12)
                    Text(item)
                        .font(.callout)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    private var footer: some View {
        Text("Turning the switch off stops collection immediately and discards the "
             + "installation identifier, so anything sent afterwards cannot be linked "
             + "to anything sent before.")
            .font(.caption)
            .foregroundStyle(.secondary)
            .fixedSize(horizontal: false, vertical: true)
    }

    static let collected = [
        "A random installation identifier, made on this Mac and used for nothing else.",
        "App version, build number and macOS version.",
        "When the app launches and quits.",
        "Which built-in charms are on the rope, and how many.",
        "Which rope style is in use.",
        "That a charm was added, removed, reordered, imported, saved or chosen.",
        "That a setting on the Appearance page was changed — which setting, not its value.",
        "Whether weather effects were switched on or off.",
        "Whether the follow card was shown, and whether its button was pressed."
    ]

    static let notCollected = [
        "Your name, email address or any account.",
        "Images you import, or anything about them — not the file, its name or its size.",
        "Charms you make. A custom charm is reported as the word “custom”.",
        "Your location. Weather uses a city name you can see and change, and it is never sent here.",
        "Where your charm sits on screen, or anything else about your desktop.",
        "Keystrokes, screen contents, other apps, or what you are doing."
    ]
}
