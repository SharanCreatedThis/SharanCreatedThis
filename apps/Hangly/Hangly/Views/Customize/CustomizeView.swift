//
//  CustomizeView.swift
//  Hangly
//
//  The one window everything lives in.
//

import SwiftUI

/// Customize Hangly.
///
/// A `NavigationSplitView` with four pages, and it replaces three windows: the
/// tabbed Settings, the Charm Library and the AI Studio. Those were three places to
/// learn before you could change a charm, and two of them could each do half of what
/// the other did.
///
/// The sidebar is the whole navigation model. There are no tabs inside a page, no
/// second-level sidebar, and no modal sheets for things that are not decisions —
/// depth was most of what made the old arrangement feel like several small tools
/// stitched together.
struct CustomizeView: View {
    /// The content, exactly. Not a minimum and not a preference.
    ///
    /// Every page is laid out against these two numbers: About is composed to end
    /// on one screen at this height, and Create's three columns clear their own
    /// floor here and nowhere shorter. A window that can be dragged to any size is
    /// a window where one of those is wrong most of the time, so
    /// `CustomizeWindowController` gives its window no `.resizable` mask and this
    /// is what fills it.
    ///
    /// The one thing still adjustable is the split: the sidebar can be widened to
    /// read a longer description, and the detail keeps more than Create's minimum
    /// even at the widest setting.
    ///
    /// The window comes out this plus whatever AppKit's title bar costs — about 32
    /// points, and not a number anything here depends on.
    static let contentSize = CGSize(width: 1020, height: 748)

    /// The sidebar, fixed like the window it is in.
    ///
    /// Not a range any more. The shelf below the navigation is a row of a `List`,
    /// and a list row is offered an unspecified width — so the description laid
    /// itself out on one endless line and the column cropped it. Text wraps to a
    /// width or it does not wrap, and this is the width.
    static let sidebarWidth = 250.0

    /// The width of a selected row's capsule — the line everything in this column
    /// is read against.
    static let sidebarCapsuleWidth = sidebarWidth - 20

    /// How far a sidebar row insets its content inside that capsule.
    ///
    /// A row has two left edges: the capsule's, and the content's a little way in
    /// from it. Navigation uses both — the capsule frames the row, the label starts
    /// inside it — but a panel that simply accepts the content edge lands between
    /// the two, which reads as neither deliberate nor accidental. Measured off the
    /// running app rather than assumed, and taken back out below so the panel's
    /// artwork begins on the capsule's line.
    static let sidebarRowContentInset = 6.5

    /// What the shelf under the navigation is given when the Library is open.
    ///
    /// The window is locked, the navigation above it is four fixed rows, and this
    /// is what is left: enough for the panel to reach the foot of the column, so
    /// the actions sit at the bottom where a decision belongs rather than halfway
    /// up with dead space under them.
    ///
    /// A minimum rather than a fixed height, so a larger system type size makes the
    /// sidebar scroll instead of cropping the description.
    static let detailPanelMinimumHeight = 596.0

    /// Owned by the app, not by the window: the menu points the window at a page
    /// before there is a window to point, and the window is destroyed on close.
    @Bindable var navigation: CustomizeNavigation

    let environment: AppEnvironment

    // Built once and held for the life of the window. Building them inside `body`
    // means a new one on every evaluation — and because these write to the settings
    // store, and the store is observed here, that is a loop: a slider writes, the
    // body re-runs, a fresh view model and fresh `@State` appear, and the value
    // ratchets. A charm size of 1.0 became 1.28 and then 0.92 with nobody touching
    // anything.
    @State private var settings: SettingsViewModel
    @State private var library: CharmLibraryViewModel

    init(navigation: CustomizeNavigation, environment: AppEnvironment) {
        self.navigation = navigation
        self.environment = environment
        _settings = State(initialValue: environment.makeSettingsViewModel())
        _library = State(initialValue: environment.makeCharmLibraryViewModel())
    }

    var body: some View {
        NavigationSplitView {
            sidebar
        } detail: {
            detail
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .navigationTitle("Customize Hangly")
        .toolbar { importItem }
        .frame(width: Self.contentSize.width, height: Self.contentSize.height)
    }

    /// Declared here rather than on the Library, which is the only page that used
    /// to have it.
    ///
    /// A toolbar changes how tall AppKit makes the title bar, so a toolbar that
    /// exists on one page of four is a window that grows by thirty-four points when
    /// you click Library and shrinks again when you leave. The SwiftUI `Window`
    /// scene hid that by giving its window a toolbar either way; an `NSWindow` does
    /// not, so the content has to be consistent about it.
    ///
    /// Making it global costs nothing: turning a picture into a charm is the one
    /// thing this window is for, it lands in the Library wherever it is started
    /// from, and Create's drop target is the same action by another route.
    @ToolbarContentBuilder private var importItem: some ToolbarContent {
        ToolbarItem(placement: .primaryAction) {
            Button {
                library.importImage()
            } label: {
                Label("Import Image…", systemImage: "square.and.arrow.down")
            }
            .disabled(library.isImporting)
            .help("Import a PNG, JPEG or WebP as a charm")
        }
    }

    /// Four rows, and — on the Library — what is selected, directly under them.
    ///
    /// The shelf is a row of the same list rather than an inset pinned to the
    /// bottom. Pinned, it sat at the foot of the column with the whole middle of
    /// the sidebar empty above it; as a row it starts where the navigation ends
    /// and takes the rest, which is the space this was moved here to use.
    ///
    /// It cannot be selected — it is a description, not a destination — and the
    /// list scrolls if it ever outgrows the column.
    private var sidebar: some View {
        List(selection: $navigation.section) {
            ForEach(CustomizeSection.allCases) { section in
                Label(section.displayName, systemImage: section.symbolName)
                    .tag(section)
            }

            if navigation.section == .library {
                LibraryDetailPanel(viewModel: library, width: Self.sidebarCapsuleWidth)
                    .frame(minHeight: Self.detailPanelMinimumHeight)
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                    .selectionDisabled()
                    .transition(.opacity)
            }
        }
        .listStyle(.sidebar)
        .navigationSplitViewColumnWidth(Self.sidebarWidth)
        .animation(Motion.settle, value: navigation.section)
    }

    @ViewBuilder private var detail: some View {
        switch navigation.section {
        case .library:
            CharmLibraryView(viewModel: library)
        case .create:
            CreatePage(
                viewModel: environment.charmStudioViewModel,
                charms: environment.charmManager
            )
        case .appearance:
            AppearancePage(viewModel: settings)
        case .about:
            AboutPage(viewModel: settings, analytics: environment.analytics)
        }
    }
}
