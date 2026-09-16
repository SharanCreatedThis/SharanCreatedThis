//
//  AnalyticsDebugPanel.swift
//  Hangly
//
//  What analytics is doing, for whoever wants to check.
//

import SwiftUI

/// The state of analytics, in four lines at the bottom of About.
///
/// Here rather than hidden behind a defaults key because the argument for
/// collecting anything at all is that it is inspectable. Somebody who wants to know
/// whether their machine is sending anything should be able to look, and see the
/// identifier that would go with it — masked, because it is enough to tell two
/// machines apart and not worth writing down.
struct AnalyticsDebugPanel: View {
    let analytics: AnalyticsManager

    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: Space.snug) {
            Button {
                withAnimation(Motion.hover) { isExpanded.toggle() }
            } label: {
                HStack(spacing: Space.tight) {
                    Image(systemName: isExpanded ? "chevron.down" : "chevron.right")
                        .font(.caption2.weight(.semibold))
                    Text("Analytics")
                        .font(.caption)
                    Circle()
                        .fill(analytics.isEnabled ? Color.green : Color.secondary)
                        .frame(width: 6, height: 6)
                }
                .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Analytics details")

            if isExpanded {
                VStack(spacing: 5) {
                    row("Sharing", analytics.isEnabled ? "On" : "Off")
                    row("Connection", analytics.connection.summary)
                    row("Installation", analytics.maskedIdentifier ?? "None yet")
                    row("Last event", lastEvent)
                }
                .padding(.top, 2)
                .transition(.opacity)
            }
        }
        .frame(maxWidth: 380)
    }

    private var lastEvent: String {
        guard let name = analytics.lastEventName, let at = analytics.lastEventAt else {
            return "Nothing sent"
        }
        return "\(name) · \(at.formatted(date: .omitted, time: .standard))"
    }

    private func row(_ title: String, _ value: String) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .foregroundStyle(.tertiary)
            Spacer(minLength: Space.regular)
            Text(value)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.trailing)
        }
        .font(.caption2.monospacedDigit())
        .accessibilityElement(children: .combine)
    }
}
