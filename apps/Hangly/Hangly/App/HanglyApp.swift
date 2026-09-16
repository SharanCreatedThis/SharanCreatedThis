//
//  HanglyApp.swift
//  Hangly
//
//  Application entry point.
//

import SwiftUI

/// Hangly's SwiftUI entry point.
///
/// One scene. `MenuBarExtra` is the app's whole presence: there is no `WindowGroup`,
/// which — together with `LSUIElement` — is what makes Hangly a true menu bar app
/// with no Dock icon and no main window.
///
/// Neither window Hangly has is a scene, and for the same reason in both cases:
///
/// - The overlay is an AppKit `NSPanel` managed by `OverlayWindowController`,
///   because a borderless, non-activating, click-through window pinned above every
///   other app cannot be expressed as a `Window`.
/// - Customize is an `NSWindow` managed by `CustomizeWindowController`, because a
///   `Window` scene does not close — it hides, and keeps its view tree and backing
///   store for the next time. That was measured at 45 MB held behind a closed
///   window in a menu bar app that idles at 23.
@main
struct HanglyApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self)
    private var appDelegate

    var body: some Scene {
        MenuBarExtra {
            MenuBarView(viewModel: appDelegate.environment.menuBarViewModel)
        } label: {
            MenuBarIcon(viewModel: appDelegate.environment.menuBarViewModel)
        }
        // `.menu` renders the content as a real NSMenu: native look, keyboard
        // navigation and VoiceOver support without reimplementing any of it.
        .menuBarExtraStyle(.menu)
    }
}
