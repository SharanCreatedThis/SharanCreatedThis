//
//  ReleaseNotesSheet.swift
//  Hangly
//
//  What's new in Hangly, with creator support at the bottom.
//

import SwiftUI

struct ReleaseNotesSheet: View {
    var analytics: AnalyticsManager?
    @Environment(\.dismiss) private var dismiss

    @State private var isCoffeeSheetPresented = false

    var body: some View {
        VStack(spacing: 0) {
            navigationBar

            ScrollView {
                VStack(alignment: .leading, spacing: Space.section) {
                    introSection
                    highlightsSection
                    enjoyingSection
                }
                .padding(.horizontal, Space.page)
                .padding(.vertical, Space.regular)
            }
        }
        .frame(width: 520, height: 600)
        .background(.regularMaterial)
        .sheet(isPresented: $isCoffeeSheetPresented) {
            BuyCoffeeSheet(source: "release_notes", analytics: analytics)
        }
    }

    private var navigationBar: some View {
        HStack {
            Text("Release Notes")
                .font(.headline)

            Spacer()

            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 19))
                    .foregroundStyle(.tertiary)
            }
            .buttonStyle(.plain)
            .keyboardShortcut(.cancelAction)
            .help("Close (Esc)")
        }
        .padding(.horizontal, Space.page)
        .padding(.top, 18)
        .padding(.bottom, 12)
    }

    private var introSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Hangly 2.0")
                .font(.system(size: 26, weight: .bold, design: .rounded))

            Text("A charm hangs from the top of your screen, on a rope, and swings.")
                .font(.body)
                .foregroundStyle(.secondary)
        }
    }

    private var highlightsSection: some View {
        VStack(alignment: .leading, spacing: Space.regular) {
            noteItem(
                symbol: "sparkles",
                title: "Tiny hanging charms from cultures around the world",
                description: "Over 27 handcrafted cultural charms to collect and hang, each with its story and meaning."
            )
            noteItem(
                symbol: "link",
                title: "Five cords and up to three charms",
                description: "Thread, Leather, Gold Chain, Silver Chain and Neon. Hang one charm, or three, with realistic physical mass and collisions."
            )
            noteItem(
                symbol: "cloud.sun.fill",
                title: "Live Weather and Seasonal Packs",
                description: "Charms react dynamically to the sky, and seasonal collections arrive and depart automatically."
            )
            noteItem(
                symbol: "airdrop",
                title: "Drag to AirDrop",
                description: "Drop any file onto your hanging charm to trigger native macOS AirDrop sharing with impact physics."
            )
            noteItem(
                symbol: "cpu",
                title: "Universal Binary",
                description: "Native Apple Silicon (M1–M4) and Intel (x86_64) support in a single high-performance app."
            )
        }
    }

    private func noteItem(symbol: String, title: String, description: String) -> some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 20))
                .foregroundStyle(.tint)
                .frame(width: 28, height: 28)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.callout.weight(.semibold))

                Text(description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    // MARK: - Coffee Section at bottom

    private var enjoyingSection: some View {
        VStack(alignment: .center, spacing: 10) {
            Divider()
                .padding(.bottom, 8)

            Text("Enjoying Hangly?")
                .font(.headline)
                .multilineTextAlignment(.center)

            Text("Help keep Hangly growing.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                isCoffeeSheetPresented = true
            } label: {
                Label("☕ Buy Creator a Coffee", systemImage: "cup.and.saucer.fill")
                    .font(.callout.weight(.medium))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.regular)
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, Space.regular)
    }
}
