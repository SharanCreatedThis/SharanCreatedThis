//
//  MenuBarView.swift
//  Hangly
//
//  Contents of the menu bar dropdown.
//

import SwiftUI

/// The menu shown when the status item is clicked.
///
/// Rendered with `.menu` style, so SwiftUI converts this tree into a real `NSMenu`.
/// That buys native appearance, keyboard navigation and VoiceOver support for free.
///
/// **A menu is a switching surface, not a browsing one.** This one holds four
/// things: whether the charm is there, which charm it is, what it hangs on, and the
/// way to everything else. Weather, seasons and the time of day used to be here and
/// are not any more — they happen on their own, and a menu that offered to set them
/// was asking people to manage something they should only ever notice.
///
/// One rule governs what may appear here: the menu may **mirror** Customize, but it
/// may never **own** anything. Everything below exists in the Customize window too,
/// so nobody has to find the menu to change something.
struct MenuBarView: View {
    /// Owned by `AppEnvironment`: the status item and its menu share one view model,
    /// so the icon and the checkmark can never disagree.
    let viewModel: MenuBarViewModel

    var body: some View {
        @Bindable var viewModel = viewModel

        Toggle("Show Hangly", isOn: $viewModel.isOverlayVisible)
            .keyboardShortcut("o", modifiers: [.command, .shift])

        Menu("Charm") {
            // Favourites first, then whatever the season has brought. Twenty-seven
            // charms in a menu is a list nobody reads to the bottom; this is the
            // handful worth switching between without opening a window, and it is
            // what makes favouriting mean something.
            if !viewModel.favouriteCharms.isEmpty {
                Section("Favorites") {
                    ForEach(viewModel.favouriteCharms) { item in
                        charmChoice(item)
                    }
                }
            }

            if !viewModel.seasonalCharms.isEmpty {
                Section(viewModel.seasonTitle) {
                    ForEach(viewModel.seasonalCharms) { item in
                        charmChoice(item)
                    }
                }
            }

            if viewModel.favouriteCharms.isEmpty && viewModel.seasonalCharms.isEmpty {
                // Nothing starred and no season running: the menu has nothing useful
                // to shortlist, so it says so rather than showing an arbitrary five.
                Text("Star a charm to keep it here")
            }

            Divider()

            Button("Browse Library…") {
                viewModel.openCustomize(section: .library)
            }
        }

        Menu("Rope") {
            // The one piece of appearance that stays in the menu. Five words, each
            // of which a person understands on sight, and a change they can see the
            // instant they make it.
            ForEach(viewModel.ropeStyles) { style in
                choice(style.displayName, isOn: viewModel.ropeStyle == style) {
                    viewModel.ropeStyle = style
                }
            }
        }

        Divider()

        Button("Customize…") {
            viewModel.openCustomize(section: .appearance)
        }
        .keyboardShortcut(",", modifiers: .command)

        Divider()

        Button("Quit \(AppConstants.appName)") {
            viewModel.quit()
        }
        .keyboardShortcut("q", modifiers: .command)
    }

    private func charmChoice(_ item: CharmMenuItem) -> some View {
        choice(item.name, isOn: viewModel.charmID == item.id) {
            viewModel.charmID = item.id
        }
    }

    /// One option in a menu, ticked when it is the current one.
    ///
    /// A button rather than a `Picker` row, which matters more than it looks. An
    /// inline picker carries a selection the menu machinery can write back to, and
    /// three times during development a setting was found changed to the *last*
    /// option of a menu nobody had clicked in. It was never reproducible on demand
    /// and may well have been the accessibility scripting used to inspect the menus
    /// rather than anything a person would hit — but a button has no selection to
    /// write back, so the question stops being worth answering.
    private func choice(_ title: String, isOn: Bool, action: @escaping () -> Void) -> some View {
        Button {
            action()
        } label: {
            // A leading tick rather than `Toggle`, so the row reads as one of
            // several rather than as something switched on and off.
            Text(isOn ? "✓  \(title)" : "     \(title)")
        }
    }
}
