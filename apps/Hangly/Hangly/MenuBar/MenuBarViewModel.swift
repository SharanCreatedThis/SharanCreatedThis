//
//  MenuBarViewModel.swift
//  Hangly
//
//  Presentation state and commands for the menu bar item.
//

import AppKit
import Observation
import OSLog
import SwiftUI

/// Backs `MenuBarView`.
///
/// The view model owns the only two decisions the menu can make — toggle the overlay
/// and open Settings — plus quitting. Keeping `NSApp` here means the menu itself
/// stays pure SwiftUI.
@MainActor
@Observable
final class MenuBarViewModel {
    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let charmManager: CharmManager
    @ObservationIgnored private let importCoordinator: CharmImportCoordinator
    @ObservationIgnored private let weather: WeatherService
    @ObservationIgnored private let seasonal: SeasonalCoordinator
    @ObservationIgnored private let customizeWindow: CustomizeWindowController

    init(
        settingsStore: SettingsStore,
        charmManager: CharmManager,
        importCoordinator: CharmImportCoordinator,
        weather: WeatherService,
        seasonal: SeasonalCoordinator,
        customizeWindow: CustomizeWindowController
    ) {
        self.weather = weather
        self.seasonal = seasonal
        self.customizeWindow = customizeWindow
        self.settingsStore = settingsStore
        self.charmManager = charmManager
        self.importCoordinator = importCoordinator
    }

    /// Charms offered in the menu: the built-ins, then every import. Observable, so
    /// the menu grows the moment an import lands.
    var charmMenuItems: [CharmMenuItem] {
        charmManager.menuItems
    }

    /// The charm on the end of the rope. Changing it takes effect on the next
    /// frame; there is nothing to confirm and nothing to restart.
    var charmID: CharmID {
        get { charmManager.selection }
        set {
            charmManager.selection = newValue
            // A charm chosen by hand outranks the calendar: the season stops owning
            // the rope rather than putting this back weeks later.
            seasonal.noteManualChoice()
        }
    }

    /// The charms worth switching between without opening a window: the ones
    /// starred in the Library, in the order the Library lists them.
    var favouriteCharms: [CharmMenuItem] {
        charmManager.menuItems.filter { charmManager.isFavorite($0.id) }
    }

    /// The charms the season has brought, while it is running. Empty the rest of
    /// the year, which is what makes them worth noticing when they appear.
    var seasonalCharms: [CharmMenuItem] {
        guard let pack = seasonal.activePack else { return [] }
        let kinds = Set(pack.charms.map(CharmID.builtIn))
        return charmManager.menuItems.filter { kinds.contains($0.id) }
    }

    var seasonTitle: String {
        seasonal.activePack?.displayName ?? "Seasonal"
    }

    /// Opens the one window everything else lives in.
    func openCustomize(section: CustomizeSection) {
        customizeWindow.present(section)
    }

    /// Every cord the charm can hang on, in the order they are offered.
    var ropeStyles: [RopeStyle] { RopeStyle.allCases }

    /// What the rope is made of. Applied on the next frame, mid-swing and all:
    /// dragging down this menu is how a user compares the styles, so each one has to
    /// answer immediately.
    var ropeStyle: RopeStyle {
        get { settingsStore.settings.overlay.ropeStyle }
        set {
            settingsStore.update { $0.overlay.ropeStyle = newValue }
            Logger.menuBar.diagnostic("Rope style set to \(newValue.rawValue).")
        }
    }

    var isImportingCharm: Bool {
        charmManager.isImporting
    }

    /// Only imports can be deleted.
    var canDeleteCurrentCharm: Bool {
        charmManager.canDeleteCurrent
    }

    func importCharmImage() {
        importCoordinator.importFromOpenPanel()
    }

    func openCharmStudio() {
        importCoordinator.openStudio()
    }

    func deleteCurrentCharm() {
        importCoordinator.deleteCurrentCharm()
    }

    /// Bound to the menu's checkmark item.
    var isOverlayVisible: Bool {
        get { settingsStore.settings.overlay.isEnabled }
        set {
            settingsStore.update { $0.overlay.isEnabled = newValue }
            Logger.menuBar.diagnostic("Overlay visibility set to \(newValue).")
        }
    }

    func quit() {
        NSApp.terminate(nil)
    }
}
