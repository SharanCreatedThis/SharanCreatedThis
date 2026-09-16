//
//  CustomizeNavigation.swift
//  Hangly
//
//  Which page Customize is on, held outside the window.
//

import Observation

/// The page Customize is showing.
///
/// Owned by `CustomizeWindowController` rather than by the view, because the menu
/// points the window at a page *before* the window exists — "Browse Library…" has
/// to arrive on the Library — and because the window is destroyed on close, so
/// anything the view owned would be forgotten between openings.
///
/// Observable, so pointing an already-open window at another page switches it.
@MainActor
@Observable
final class CustomizeNavigation {
    var section: CustomizeSection = .library
}
