//
//  SettingsViewModel.swift
//  Hangly
//
//  Presentation state for the Settings window.
//

import Foundation
import SwiftUI
import Observation
import OSLog

/// Backs every tab of the Settings window.
///
/// The properties below are deliberately flat proxies onto `SettingsStore`: reads go
/// straight through (so Observation tracks them and the UI stays live) and writes go
/// through `update`, which persists atomically. The view therefore never sees
/// `AppSettings`, only the individual values it renders.
@MainActor
@Observable
final class SettingsViewModel {
    /// Set when `SMAppService` refuses a change, e.g. for an unsigned debug build.
    /// Surfaced inline rather than as an alert so the toggle and the reason stay together.
    var launchAtLoginError: String?

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let launchAtLogin: any LaunchAtLoginManaging
    @ObservationIgnored private let charmManager: CharmManager
    @ObservationIgnored private let weatherService: WeatherService

    /// The metadata document. Read only by the About page, which tells you
    /// something about the charm you are looking at when you push it.
    @ObservationIgnored private let library: CharmLibrary

    @ObservationIgnored private let analytics: AnalyticsManager?

    init(
        settingsStore: SettingsStore,
        launchAtLogin: any LaunchAtLoginManaging,
        charmManager: CharmManager,
        weather: WeatherService,
        analytics: AnalyticsManager? = nil,
        library: CharmLibrary = .bundled()
    ) {
        self.charmManager = charmManager
        self.weatherService = weather
        self.library = library
        self.settingsStore = settingsStore
        self.launchAtLogin = launchAtLogin
        self.analytics = analytics
    }

    // MARK: - Privacy

    /// Whether anonymous usage is shared. Off takes effect on the next line.
    var analyticsEnabled: Bool {
        get { settingsStore.settings.privacy.analyticsEnabled }
        set { analytics?.setEnabled(newValue) }
    }

    /// Reports that the Instagram button was pressed. The link itself is opened by
    /// the view; this only counts it.
    func reportFollowClicked() {
        analytics?.track(.followInstagramClicked)
    }

    /// Reports that a setting on this page moved, by name and never by value.
    ///
    /// Which controls people reach for is the useful fact; where they ended up
    /// putting their charm is theirs.
    func reportAppearanceChange(_ setting: String) {
        analytics?.track(.appearanceChanged(setting))
    }

    // MARK: - General

    var isOverlayVisible: Bool {
        get { settingsStore.settings.overlay.isEnabled }
        set { settingsStore.update { $0.overlay.isEnabled = newValue } }
    }

    var launchesAtLogin: Bool {
        get { settingsStore.settings.launchAtLogin }
        set { applyLaunchAtLogin(newValue) }
    }

    // MARK: - Sound

    var soundEffectsEnabled: Bool {
        get { settingsStore.settings.soundEffectsEnabled }
        set { settingsStore.update { $0.soundEffectsEnabled = newValue } }
    }

    var soundVolume: Double {
        get { settingsStore.settings.soundVolume }
        set { settingsStore.update { $0.soundVolume = newValue.clamped(to: AppSettings.soundVolumeRange) } }
    }

    var soundVolumeRange: ClosedRange<Double> { AppSettings.soundVolumeRange }
    var soundVolumeDescription: String { percentString(soundVolume) }

    // MARK: - Overlay

    var anchor: OverlayAnchor {
        get { settingsStore.settings.overlay.anchor }
        set { settingsStore.update { $0.overlay.anchor = newValue } }
    }

    /// How big the charm is drawn. The canvas follows it, so a bigger charm gets
    /// more room rather than a more crowded frame.
    var charmSize: Double {
        get { settingsStore.settings.overlay.charmSize }
        set {
            settingsStore.update { $0.overlay.charmSize = newValue.clamped(to: Self.charmSizeRange) }
            analytics?.track(.appearanceChanged("charm_size"))
        }
    }

    /// How far it hangs.
    /// Whether the ornament steps aside during full-screen video.
    var hidesDuringFullscreenVideo: Bool {
        get { settingsStore.settings.overlay.hidesDuringFullscreenVideo }
        set {
            settingsStore.update { $0.overlay.hidesDuringFullscreenVideo = newValue }
            analytics?.track(.appearanceChanged("fullscreen_autohide"))
        }
    }

    /// Whether dropping a file on a charm opens the AirDrop picker.
    var airdropOnDrop: Bool {
        get { settingsStore.settings.overlay.airdropOnDrop }
        set {
            settingsStore.update { $0.overlay.airdropOnDrop = newValue }
            analytics?.track(.appearanceChanged("airdrop_on_drop"))
        }
    }

    var ropeLength: Double {
        get { settingsStore.settings.overlay.ropeLength }
        set {
            settingsStore.update { $0.overlay.ropeLength = newValue.clamped(to: Self.ropeLengthRange) }
            analytics?.track(.appearanceChanged("rope_length"))
        }
    }

    static let charmSizeRange = OverlaySettings.Limits.charmSize
    static let ropeLengthRange = OverlaySettings.Limits.ropeLength

    var opacity: Double {
        get { settingsStore.settings.overlay.opacity }
        set { settingsStore.update { $0.overlay.opacity = newValue.clamped(to: opacityRange) } }
    }

    var horizontalOffset: Double {
        get { settingsStore.settings.overlay.horizontalOffset }
        set { settingsStore.update { $0.overlay.horizontalOffset = newValue.clamped(to: horizontalOffsetRange) } }
    }

    var verticalOffset: Double {
        get { settingsStore.settings.overlay.verticalOffset }
        set { settingsStore.update { $0.overlay.verticalOffset = newValue.clamped(to: verticalOffsetRange) } }
    }

    // MARK: - Weather

    var weatherEnabled: Bool {
        get { settingsStore.settings.weather.isEnabled }
        set {
            settingsStore.update { $0.weather.isEnabled = newValue }
            weatherService.start()
            analytics?.track(.weatherEffectToggled(newValue))
        }
    }

    /// The city to ask about. Empty follows the system time zone, which names one.
    var weatherLocation: String {
        get { settingsStore.settings.weather.locationName }
        set {
            guard newValue != weatherLocation else { return }
            settingsStore.update { $0.weather.locationName = newValue }
            weatherService.refreshNow()
        }
    }

    /// A glyph for whatever the sky is doing, or a struck-through cloud when there
    /// is nothing to show.
    var weatherSymbol: String {
        guard weatherEnabled else { return "cloud.slash" }
        switch weatherService.status {
        case .locating, .refreshing: return "arrow.triangle.2.circlepath"
        case .unavailable: return "exclamationmark.triangle"
        case .idle, .ready:
            return weatherService.condition?.symbolName ?? "cloud.slash"
        }
    }

    /// What the weather is, said as a sentence rather than as a setting. The place
    /// is in it because the place is the thing that can be wrong.
    var weatherSummary: String {
        guard weatherEnabled else { return "The charm is drawn in its own colours." }
        switch weatherService.status {
        case .locating: return "Finding your location…"
        case .refreshing: return "Checking the weather…"
        case .unavailable(let reason): return reason
        case .idle, .ready:
            guard let reading = weatherService.reading else { return "No reading yet." }
            guard !weatherService.isStale else {
                return "The last reading from \(reading.place.name) is too old to use."
            }
            return "\(reading.condition.displayName) in \(reading.place.name)"
        }
    }

    /// The charm on the end of the rope, for the position preview. The preview is
    /// a picture of what is actually hanging, not a generic dot: knowing where it
    /// will sit is most of what the control is for.
    var previewCharm: any Charm {
        charmManager.current
    }

    // MARK: - Ranges for the UI

    var opacityRange: ClosedRange<Double> { OverlaySettings.Limits.opacity }
    var horizontalOffsetRange: ClosedRange<Double> { OverlaySettings.Limits.horizontalOffset }
    var verticalOffsetRange: ClosedRange<Double> { OverlaySettings.Limits.verticalOffset }

    // MARK: - Formatted values

    var opacityDescription: String { percentString(opacity) }
    var horizontalOffsetDescription: String { pointString(horizontalOffset) }
    var verticalOffsetDescription: String { pointString(verticalOffset) }

    // MARK: - About

    var appName: String { AppConstants.appName }
    var versionDescription: String { "Version \(AppConstants.shortVersion) (\(AppConstants.buildNumber))" }
    var copyright: String { AppConstants.copyright }

    // MARK: - Commands

    /// Restores overlay appearance and placement, leaving startup preferences alone.
    func resetOverlaySettings() {
        settingsStore.update { settings in
            let wasEnabled = settings.overlay.isEnabled
            settings.overlay = OverlaySettings()
            settings.overlay.isEnabled = wasEnabled
        }
    }

    /// Restores every preference, including the login item — which means restoring
    /// it to the shipped default rather than to off, so a reset leaves the app in
    /// the state a fresh install would be in.
    func resetAllSettings() {
        settingsStore.resetToDefaults()
        applyLaunchAtLogin(settingsStore.settings.launchAtLogin)
    }

    private func applyLaunchAtLogin(_ enabled: Bool) {
        do {
            try launchAtLogin.setEnabled(enabled)
            launchAtLoginError = nil
            settingsStore.update { $0.launchAtLogin = enabled }
        } catch {
            // Re-read the registry so the toggle snaps back to reality instead of
            // showing a state the system rejected.
            Logger.settings.error("Login item change failed: \(error.localizedDescription, privacy: .public)")
            launchAtLoginError = error.localizedDescription
            settingsStore.update { $0.launchAtLogin = launchAtLogin.isEnabled }
        }
    }

    private func percentString(_ value: Double) -> String {
        value.formatted(.percent.precision(.fractionLength(0)))
    }

    private func pointString(_ value: Double) -> String {
        "\(Int(value.rounded())) pt"
    }
}

// MARK: - About

/// What the About page knows, which is nothing anybody else needs.
///
/// An extension rather than more properties on the type: these are counters and one
/// piece of trivia, and putting them in the body would file them alongside the
/// settings they have nothing to do with.
extension SettingsViewModel {
    /// Every charm installed — the ones that ship with the app and everything
    /// imported since.
    var charmCount: Int {
        charmManager.menuItems.count
    }

    /// How many times the app has been started, counting this one.
    var launchCount: Int {
        settingsStore.settings.milestones.launchCount
    }

    /// How many secrets this install has been told, ever.
    var secretsFound: Int {
        settingsStore.settings.milestones.secretsFound
    }

    /// How many times the About page's charm has been pushed, ever.
    var charmPushes: Int {
        settingsStore.settings.milestones.charmPushes
    }

    /// Records that a secret has been asked for.
    ///
    /// - Returns: Which secret it is in the life of this install, counting this one.
    ///   The creator notes are due on exact counts, so the caller needs the number
    ///   rather than just the fact that it went up.
    @discardableResult
    func recordSecretFound() -> Int {
        settingsStore.update { $0.milestones.secretsFound += 1 }
        return secretsFound
    }

    /// Records a push of the charm. Costs a write and buys a number that is funny
    /// at about a hundred.
    func recordCharmPush() {
        settingsStore.update { $0.milestones.charmPushes += 1 }
    }

    /// One true thing about the charm currently hanging.
    ///
    /// Taken from the same metadata document the Library reads, so a charm's fact is
    /// written once and is the same wherever it appears. Imports have no entry and
    /// no fact — nobody needs to be told about their own picture.
    var currentCharmFact: String? {
        guard case .builtIn(let kind) = charmManager.selection,
              let entry = library.entry(for: kind) else { return nil }
        return "\(entry.name) · \(entry.region) — \(entry.description)"
    }
}
