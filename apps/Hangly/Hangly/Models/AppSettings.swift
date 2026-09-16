//
//  AppSettings.swift
//  Hangly
//
//  Root persisted settings document.
//

import Foundation

/// The complete, persistable state of the app's preferences.
///
/// `schemaVersion` is written on every save so that a future release can migrate
/// an older document deliberately instead of guessing.
struct AppSettings: Codable, Equatable, Sendable {
    /// Version of the persisted document produced by this build.
    static let currentSchemaVersion = 1

    var schemaVersion: Int
    var overlay: OverlaySettings

    /// Mirrors the registered login-item state. The system is the source of truth
    /// from the second launch onward; this is reconciled against `SMAppService` at
    /// every launch but the first, where the shipped default is applied instead.
    var launchAtLogin: Bool

    /// Charms starred in the Library. Stored as identifier strings.
    var favoriteCharms: Set<CharmID>

    /// Whether charms make a sound when swung or switched. Sounds only ever play
    /// in response to the user's own action, which is why this can default on.
    var soundEffectsEnabled: Bool

    /// 0...1. Kept quiet by default: an ornament should not announce itself.
    var soundVolume: Double

    /// Whether, and how, the charm follows the weather.
    var weather: WeatherSettings

    /// Whether, and how, the rope dresses for the season.
    var seasonal: SeasonalSettings

    /// Rope styles starred in the Library.
    var favoriteRopes: Set<RopeStyle>

    /// What the app may know about how it is used.
    var privacy: PrivacySettings

    /// What it remembers about having been used before.
    var milestones: AppMilestones

    static let soundVolumeRange: ClosedRange<Double> = 0...1

    init(
        schemaVersion: Int = AppSettings.currentSchemaVersion,
        overlay: OverlaySettings = OverlaySettings(),
        launchAtLogin: Bool = true,
        favoriteCharms: Set<CharmID> = [],
        soundEffectsEnabled: Bool = true,
        soundVolume: Double = 0.14,
        weather: WeatherSettings = WeatherSettings(),
        seasonal: SeasonalSettings = SeasonalSettings(),
        favoriteRopes: Set<RopeStyle> = [],
        privacy: PrivacySettings = PrivacySettings(),
        milestones: AppMilestones = AppMilestones()
    ) {
        self.schemaVersion = schemaVersion
        self.overlay = overlay
        self.launchAtLogin = launchAtLogin
        self.favoriteCharms = favoriteCharms
        self.soundEffectsEnabled = soundEffectsEnabled
        self.soundVolume = soundVolume.clamped(to: Self.soundVolumeRange)
        self.weather = weather
        self.seasonal = seasonal
        self.favoriteRopes = favoriteRopes
        self.privacy = privacy
        self.milestones = milestones
    }

    /// Tolerant decoding — see `OverlaySettings.init(from:)`.
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let fallback = AppSettings()

        // Favourites decode one identifier at a time, so a single unrecognised
        // entry drops itself rather than the whole set.
        let favoriteStrings = (try? container.decodeIfPresent([String].self, forKey: .favoriteCharms)) ?? []
        let favorites = Set(favoriteStrings.compactMap(CharmID.init(storageValue:)))

        self.init(
            schemaVersion: try container.decodeIfPresent(Int.self, forKey: .schemaVersion) ?? fallback.schemaVersion,
            overlay: try container.decodeIfPresent(OverlaySettings.self, forKey: .overlay) ?? fallback.overlay,
            launchAtLogin: try container.decodeIfPresent(Bool.self, forKey: .launchAtLogin) ?? fallback.launchAtLogin,
            favoriteCharms: favorites,
            soundEffectsEnabled: try container.decodeIfPresent(Bool.self, forKey: .soundEffectsEnabled)
                ?? fallback.soundEffectsEnabled,
            soundVolume: try container.decodeIfPresent(Double.self, forKey: .soundVolume) ?? fallback.soundVolume,
            weather: (try? container.decodeIfPresent(WeatherSettings.self, forKey: .weather)) ?? fallback.weather,
            seasonal: (try? container.decodeIfPresent(SeasonalSettings.self, forKey: .seasonal))
                .flatMap { $0 } ?? fallback.seasonal,
            // One unreadable style drops itself rather than the whole set, the same
            // way favourite charms do.
            favoriteRopes: Set(
                ((try? container.decodeIfPresent([String].self, forKey: .favoriteRopes)) ?? [])
                    .compactMap(RopeStyle.init(rawValue:))
            ),
            privacy: (try? container.decodeIfPresent(PrivacySettings.self, forKey: .privacy))
                .flatMap { $0 } ?? fallback.privacy,
            milestones: (try? container.decodeIfPresent(AppMilestones.self, forKey: .milestones))
                .flatMap { $0 } ?? fallback.milestones
        )
    }
}
