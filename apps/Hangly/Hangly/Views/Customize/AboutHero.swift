//
//  AboutHero.swift
//  Hangly
//
//  The charm, hanging, at the top of the About page.
//

import SwiftUI

/// A real rope with the real charm on it, swinging.
///
/// Not a picture of the app: the app itself, running a second copy of the same
/// solver in a small box. It costs nothing at rest — the simulation sleeps once the
/// rope settles and the timeline pauses with it — and it is the one thing on this
/// page that could not be a screenshot.
struct AboutHero: View {
    let charm: any Charm

    /// Pushed when the page wants the rope to move: opening the page, and asking
    /// for a secret.
    let nudge: Int

    /// How much room the rope gets. The default is the About page's; the welcome
    /// card asks for less, because it has words to fit underneath.
    var height = 210.0

    @Environment(\.accessibilityReduceMotion)
    private var reduceMotion

    @State private var driver = PreviewRopeDriver()

    var body: some View {
        GeometryReader { proxy in
            TimelineView(.animation(minimumInterval: 1.0 / 60.0, paused: driver.isPaused)) { context in
                RopeCanvasView(snapshot: driver.snapshot, charmSlots: [driver.layers])
                    .onChange(of: context.date) { _, date in driver.tick(at: date) }
            }
            .onAppear {
                driver.configure(
                    size: proxy.size,
                    charm: charm,
                    reducesMotion: reduceMotion,
                    // Larger than life. At true proportions the charm is a sixth of
                    // the box and reads as a dot on a string; this is a portrait of
                    // it, not a scale drawing.
                    charmSize: 1.9,
                    settlesEarly: true
                )
            }
            .onChange(of: proxy.size) { _, size in driver.resize(to: size) }
            .onChange(of: charm.id) { _, _ in driver.setCharm(charm) }
            .onChange(of: nudge) { _, _ in
                guard !reduceMotion else { return }
                driver.swing()
            }
        }
        .frame(height: height)
        .frame(maxWidth: 300)
        .accessibilityLabel("\(charm.displayName), hanging on a rope")
    }
}
