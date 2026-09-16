//
//  AppEnvironment.swift
//  Hangly
//
//  Composition root: builds the object graph and owns service lifetimes.
//

import Foundation
import OSLog

/// The application's dependency container.
///
/// Services are constructed once, here, and handed to view models through their
/// initialisers. There are no singletons anywhere in Hangly, which is what lets a
/// test build an `AppEnvironment` with a throwaway `UserDefaults` suite and a fake
/// login-item manager and exercise the real view models.
///
/// Ownership is deliberately flat: this object outlives every view, and views own
/// only their view models.
@MainActor
final class AppEnvironment {
    let settingsStore: SettingsStore
    let launchAtLogin: any LaunchAtLoginManaging
    let screenObserver: ScreenObserver
    let overlayController: OverlayWindowController
    let charmManager: CharmManager
    let customCharmStore: CustomCharmStore
    let charmImportCoordinator: CharmImportCoordinator
    let charmLibrary: CharmLibrary
    let audio: AudioService
    let accessibility: AccessibilityPreferences
    let weather: WeatherService
    let seasonal: SeasonalCoordinator
    let customizeWindow: CustomizeWindowController
    let charmStudioViewModel: CharmStudioViewModel
    let charmStudioWindowController: CharmStudioWindowController

    /// What the app is allowed to say about how it is used. Owned here because it
    /// lives for the whole run and is read from every page.
    let analytics: AnalyticsManager

    /// The one thing the app ever asks for, and the record of having asked.
    let followPrompt: FollowPromptWindowController

    /// Said once, on the first launch, and never again.
    let welcome: WelcomeWindowController

    /// Lets `Scripts/measure-memory.sh` walk Customize. Development builds only.
    #if !HANGLY_PRODUCTION
    private lazy var auditRemote = AuditRemote(customize: customizeWindow)
    #endif

    /// The menu bar item exists for the whole life of the app, so its view model is
    /// owned here. The Settings window comes and goes, so `makeSettingsViewModel()`
    /// hands ownership of that one to the view instead.
    let menuBarViewModel: MenuBarViewModel

    init(
        settingsStore: SettingsStore = SettingsStore(),
        launchAtLogin: any LaunchAtLoginManaging = LaunchAtLoginService(),
        screenObserver: ScreenObserver = ScreenObserver(),
        customCharmStore: CustomCharmStore = CustomCharmStore(),
        charmLibrary: CharmLibrary = CharmLibrary.bundled()
    ) {
        self.settingsStore = settingsStore
        self.launchAtLogin = launchAtLogin
        self.screenObserver = screenObserver
        // Built before anything that reports through it, so the reporter can be a
        // stored dependency rather than something wired up afterwards.
        let analytics = AnalyticsManager(settingsStore: settingsStore)
        let charmManager = CharmManager(
            settingsStore: settingsStore,
            customStore: customCharmStore,
            analytics: analytics
        )
        let accessibility = AccessibilityPreferences()
        let audio = AudioService(settingsStore: settingsStore)
        let studio = Self.makeStudio(charmManager: charmManager, accessibility: accessibility)
        let importCoordinator = studio.imports
        let weather = WeatherService(settingsStore: settingsStore)
        let seasonal = SeasonalCoordinator(settingsStore: settingsStore)
        let customizeWindow = CustomizeWindowController()
        self.charmManager = charmManager
        self.customCharmStore = customCharmStore
        self.charmImportCoordinator = importCoordinator
        self.charmLibrary = charmLibrary
        self.audio = audio
        self.accessibility = accessibility
        self.weather = weather
        self.seasonal = seasonal
        self.customizeWindow = customizeWindow
        self.analytics = analytics
        self.followPrompt = FollowPromptWindowController(
            presenter: FollowPromptPresenter(settingsStore: settingsStore, analytics: analytics)
        )
        self.welcome = WelcomeWindowController(
            presenter: WelcomePresenter(settingsStore: settingsStore, customize: customizeWindow),
            charm: { charmManager.current }
        )
        self.charmStudioViewModel = studio.viewModel
        self.charmStudioWindowController = studio.window
        self.menuBarViewModel = MenuBarViewModel(
            settingsStore: settingsStore,
            charmManager: charmManager,
            importCoordinator: importCoordinator,
            weather: weather,
            seasonal: seasonal,
            customizeWindow: customizeWindow
        )
        self.overlayController = OverlayWindowController(
            settingsStore: settingsStore,
            screenObserver: screenObserver,
            charmManager: charmManager,
            importCoordinator: importCoordinator,
            audio: audio,
            accessibility: accessibility,
            weather: weather,
            seasonal: seasonal,
            analytics: analytics
        )

        // Last: the window builds its pages out of this object, so it cannot be
        // handed one until there is one to hand.
        customizeWindow.environment = self
    }

    /// The Create pipeline: the workspace, the window it used to have of its own,
    /// and the coordinator that feeds both. Built together because none of the three
    /// is useful without the other two.
    private static func makeStudio(
        charmManager: CharmManager,
        accessibility: AccessibilityPreferences
    ) -> Studio {
        let viewModel = CharmStudioViewModel(charmManager: charmManager, accessibility: accessibility)
        let window = CharmStudioWindowController(viewModel: viewModel)
        let imports = CharmImportCoordinator(charmManager: charmManager, dialogs: CharmDialogs(), studio: window)
        return Studio(viewModel: viewModel, window: window, imports: imports)
    }

    /// See ``makeStudio(charmManager:accessibility:)``.
    private struct Studio {
        let viewModel: CharmStudioViewModel
        let window: CharmStudioWindowController
        let imports: CharmImportCoordinator
    }

    /// Builds a Settings view model. Called by `SettingsView`, which owns the result
    /// for as long as the window is open.
    func makeSettingsViewModel() -> SettingsViewModel {
        SettingsViewModel(
            settingsStore: settingsStore,
            launchAtLogin: launchAtLogin,
            charmManager: charmManager,
            weather: weather,
            analytics: analytics,
            library: charmLibrary
        )
    }

    /// Builds a Library view model. Owned by `CharmLibraryView` while it is open.
    func makeCharmLibraryViewModel() -> CharmLibraryViewModel {
        CharmLibraryViewModel(
            library: charmLibrary,
            charmManager: charmManager,
            importCoordinator: charmImportCoordinator
        )
    }

    /// Starts long-lived services. Called once, from `applicationDidFinishLaunching`.
    func bootstrap() {
        reconcileLaunchAtLogin()
        #if !HANGLY_PRODUCTION
        // Also the only thing at launch that touches the whole charm registry, and
        // so the only thing that pays to load every SVG before the overlay appears.
        reportMissingArtwork()
        #endif
        accessibility.start()
        #if !HANGLY_PRODUCTION
        auditRemote.start()
        #endif
        // Counts the launch and, if sharing is on, says hello. Counting happens
        // either way: the follow card is scheduled off the same number and has
        // nothing to do with analytics.
        analytics.start()
        overlayController.start()
        // Does nothing at all unless the user has turned weather on, which is the
        // point: a build nobody asked for weather on makes no request, opens no
        // connection, and schedules no timer.
        weather.start()
        // Dresses the rope if a season is already under way, and puts it back if one
        // ended while the app was closed.
        seasonal.refresh()
        // Last, and only on the launch each is due. Everything else about starting
        // up has already happened before the app puts anything in front of anybody,
        // and the two cards cannot collide: one is the first launch, the other the
        // fifth at the earliest.
        welcome.offerIfDue()
        followPrompt.offerIfDue()
        Logger.app.diagnostic("\(AppConstants.appName) bootstrapped.")
    }

    /// Releases window-server and notification resources at termination.
    func shutdown() {
        #if !HANGLY_PRODUCTION
        auditRemote.stop()
        #endif
        // First, so the queue is handed over before the services it describes go.
        analytics.stop()
        overlayController.stop()
        weather.stop()
        audio.stop()
        accessibility.stop()
        Logger.app.diagnostic("\(AppConstants.appName) shut down.")
    }

    /// A collection charm without its SVG draws a placeholder bead rather than
    /// nothing; say so in the log, once, so the omission is never silent.
    #if !HANGLY_PRODUCTION
    private func reportMissingArtwork() {
        let missing = BuiltInCharms.missingArtwork
        guard !missing.isEmpty else { return }
        let names = missing.map(\.rawValue).joined(separator: ", ")
        Logger.overlay.error("Missing SVG artwork for: \(names, privacy: .public)")
    }
    #endif

    /// The login-item registry is the source of truth — a user can remove the item in
    /// System Settings without Hangly running. Trusting the persisted flag instead
    /// would leave the Settings toggle showing a state that is no longer real.
    /// Brings the login item and the stored preference into agreement.
    ///
    /// `LaunchAtLoginPolicy` decides which of the two wins; this applies the answer.
    /// A first run also writes the document out even when nothing changed, so the
    /// next launch knows it is not a first run and leaves the user's choice alone.
    private func reconcileLaunchAtLogin() {
        let decision = LaunchAtLoginPolicy.decide(
            isFirstRun: settingsStore.isFirstRun,
            stored: settingsStore.settings.launchAtLogin,
            registered: launchAtLogin.isEnabled
        )

        switch decision {
        case .doNothing:
            break

        case .register:
            do {
                try launchAtLogin.setEnabled(true)
                Logger.settings.diagnostic("Registered the login item on first run.")
            } catch {
                // Registration is refused for a build without a stable signing
                // identity, or one running from a location the system will not vouch
                // for. During development that is normal rather than a failure worth
                // interrupting anyone over, so the preference is corrected to match
                // what actually happened and Settings shows the real state.
                Logger.settings.warning(
                    "Could not register the login item: \(error.localizedDescription, privacy: .public)"
                )
                settingsStore.update { $0.launchAtLogin = false }
            }

        case .follow(let registered):
            Logger.settings.diagnostic("Reconciling launch-at-login to \(registered).")
            settingsStore.update { $0.launchAtLogin = registered }
        }

        if settingsStore.isFirstRun {
            settingsStore.save()
        }
    }
}
