//
//  FollowPrompt.swift
//  Hangly
//
//  Credits / Milestone popup.
//

import SwiftUI

/// A small card offered after five launches with creator appreciation.
struct FollowPrompt: View {
    var analytics: AnalyticsManager? = nil
    var onAnswer: (FollowPromptAnswer) -> Void = { _ in }

    @State private var isCoffeeSheetPresented = false

    var body: some View {
        VStack(spacing: Space.regular) {
            CharmMark()

            Text("Thanks for using Hangly ✨")
                .font(.title2.weight(.semibold))
                .multilineTextAlignment(.center)

            VStack(spacing: 3) {
                Text("Created by")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(Creator.handle)
                    .font(.callout.weight(.semibold))
            }

            VStack(spacing: Space.snug) {
                Button {
                    onAnswer(.followed)
                    Creator.openInstagram()
                } label: {
                    Text("Instagram")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)

                Button {
                    isCoffeeSheetPresented = true
                } label: {
                    Text("☕ Buy Creator a Coffee")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)

                Button("Continue") {
                    onAnswer(.declined)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.secondary)
                .font(.callout)
                .padding(.top, 4)
                .keyboardShortcut(.defaultAction)
            }
            .padding(.top, Space.tight)
        }
        .padding(Space.section)
        .frame(width: 320)
        .sheet(isPresented: $isCoffeeSheetPresented) {
            BuyCoffeeSheet(source: "milestone_popup", analytics: analytics)
        }
    }
}

/// The app's own charm, small, at the top of the card — so the thing asking is
/// recognisably the thing on your screen.
private struct CharmMark: View {
    var body: some View {
        Image(systemName: "sparkles")
            .font(.system(size: 26, weight: .light))
            .foregroundStyle(.tint)
            .padding(.bottom, 2)
            .accessibilityHidden(true)
    }
}
