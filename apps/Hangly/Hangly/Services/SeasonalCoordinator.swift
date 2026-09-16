//
//  SeasonalCoordinator.swift
//  Hangly
//
//  Dressing the rope for the season, and undressing it afterwards.
//

import Foundation
import Observation
import OSLog

/// Puts a season's charms on the rope when it comes round, and puts back what was
/// there when it goes.
///
/// The undressing is the part that makes the dressing acceptable. Changing what
/// somebody chose is a liberty; changing it back on the first of November is the
/// thing that turns it into a decoration rather than a nuisance — so what was on the
/// rope is written into settings before a pack takes over, and it survives a reboot
/// because it is stored rather than remembered.
///
/// It also gives way. If the season is running and the user picks something else,
/// the rope is no longer "dressed as" that pack, so nothing will be put back over
/// their choice later and nothing will take it away again this year.
@MainActor
@Observable
final class SeasonalCoordinator {
    /// How often the calendar is worth consulting. A season begins at midnight and
    /// lasts weeks; an hour of lateness on a charm is not a defect, and a check that
    /// ran more often would be looking for something that cannot have happened.
    static let checkInterval: TimeInterval = 60 * 60

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let now: @Sendable () -> Date
    @ObservationIgnored private var nextCheck: TimeInterval = 0

    init(settingsStore: SettingsStore, now: @escaping @Sendable () -> Date = Date.init) {
        self.settingsStore = settingsStore
        self.now = now
    }

    /// The pack the calendar says it is, or the one pinned by hand.
    var activePack: SeasonalPack? {
        let settings = settingsStore.settings.seasonal
        if let pinned = settings.pinned { return pinned }
        guard settings.isAutomatic else { return nil }
        return SeasonalPack.active(on: now(), diwali: settings.diwaliWindow)
    }

    /// Whether the rope is currently wearing a season rather than the user's own
    /// choice. Drives the menu's wording.
    var isDressed: Bool {
        settingsStore.settings.seasonal.dressedAs != nil
    }

    /// Called from the overlay's own tick; does nothing but compare two dates until
    /// an hour has passed.
    func refreshIfDue(elapsed: TimeInterval) {
        guard elapsed >= nextCheck else { return }
        nextCheck = elapsed + Self.checkInterval
        refresh()
    }

    /// Brings the rope in line with the season.
    func refresh() {
        let settings = settingsStore.settings.seasonal
        let wanted = activePack

        // The season is over: whatever was borrowed goes back, and any season the
        // user turned down is forgiven so next year can offer it again.
        guard let wanted else {
            if settings.dressedAs != nil || settings.overruled != nil { undress(from: settings) }
            return
        }
        // Already wearing it, or already told no. Both mean there is nothing to do —
        // and the second is what stops this and the user taking turns every hour for
        // the rest of October.
        guard wanted != settings.dressedAs, wanted != settings.overruled else { return }

        dress(in: wanted, over: settings)
    }

    // MARK: - Putting a pack on and taking it off

    private func dress(in pack: SeasonalPack, over settings: SeasonalSettings) {
        settingsStore.update { document in
            // Only the *first* season to take over remembers what it replaced. A
            // pack handing over to the next one — Christmas to New Year — must not
            // record the Christmas charms as the thing to put back in January.
            if document.seasonal.restore == nil {
                document.seasonal.restore = document.overlay.stack.charms
            }
            document.seasonal.dressedAs = pack
            document.overlay.stack = CharmStack(pack.charms.map(CharmID.builtIn))
        }
        Logger.overlay.diagnostic("Dressed the rope for \(pack.rawValue).")
    }

    private func undress(from settings: SeasonalSettings) {
        settingsStore.update { document in
            if let restore = document.seasonal.restore, !restore.isEmpty {
                document.overlay.stack = CharmStack(restore)
            }
            document.seasonal.restore = nil
            document.seasonal.dressedAs = nil
            document.seasonal.overruled = nil
        }
        Logger.overlay.diagnostic("Put the rope back the way it was.")
    }

    /// Notices that the user has chosen something themselves, and gets out of the
    /// way: the season stops owning the rope, and what it was going to put back is
    /// forgotten rather than dropped on top of their choice weeks later.
    func noteManualChoice() {
        guard let dressed = settingsStore.settings.seasonal.dressedAs else { return }
        settingsStore.update {
            $0.seasonal.restore = nil
            $0.seasonal.dressedAs = nil
            $0.seasonal.overruled = dressed
        }
        Logger.overlay.diagnostic("Season gave way to a charm chosen by hand.")
    }
}
