//
//  AboutStatistics.swift
//  Hangly
//
//  Three numbers about this install.
//

import SwiftUI

/// What this copy of Hangly has done, in three numbers.
///
/// They used to be jokes — four million swings, ninety-seven per cent physics —
/// which was funny once and then was three pieces of furniture. These are true of
/// the person reading them, which is the only reason a number on an About page is
/// worth the room it takes. The jokes moved into the secrets, where a joke keeps.
///
/// On a plate, as one band rather than three floating columns: it is a single fact
/// about the install in three parts, and drawing it as one object is what lets the
/// page put it next to other objects without the page becoming a list.
struct AboutStatistics: View {
    let charms: Int
    let launches: Int
    let secretsFound: Int

    var body: some View {
        HStack(alignment: .center, spacing: 0) {
            statistic(charms.formatted(), "charms collected")
            separator
            statistic(launches.formatted(), launches == 1 ? "launch" : "launches")
            separator
            statistic(secretsFound.formatted(), secretsFound == 1 ? "secret found" : "secrets found")
        }
        .padding(.vertical, 13)
        .background {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(.quaternary.opacity(0.35))
        }
        .overlay {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(Color.primary.opacity(0.07), lineWidth: 1)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(summary)
    }

    private func statistic(_ value: String, _ caption: String) -> some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.system(size: 21, weight: .medium, design: .rounded))
                .monospacedDigit()
                .contentTransition(.numericText())
            Text(caption)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }

    private var separator: some View {
        Rectangle()
            .fill(Color.primary.opacity(0.08))
            .frame(width: 1, height: 26)
            .accessibilityHidden(true)
    }

    private var summary: String {
        "\(charms) charms collected. \(launches) launches. \(secretsFound) secrets found."
    }
}
