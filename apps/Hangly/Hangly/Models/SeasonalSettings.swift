//
//  SeasonalSettings.swift
//  Hangly
//
//  Whether the charm dresses for the season.
//

import Foundation

/// The user's side of the seasonal packs.
struct SeasonalSettings: Codable, Equatable, Sendable {
    /// Whether a season may dress the rope on its own. On by default: a pumpkin
    /// appearing on the first of October is the entire point, and it is safe to
    /// default on precisely because it is undone again — see ``restore``.
    var isAutomatic: Bool

    /// A pack worn regardless of the date. `nil` follows the calendar.
    var pinned: SeasonalPack?

    /// When Diwali falls. Editable because it moves with the lunar calendar and no
    /// fixed date could be right two years running.
    var diwaliWindow: SeasonWindow

    /// What was on the rope before a season took it over, and which season did.
    ///
    /// Kept in settings rather than in memory so that a season that arrives on
    /// Monday is still undone on the Monday after a reboot. Without it, automatic
    /// dressing would be a feature that quietly eats the charm you chose.
    var restore: [CharmID]?
    var dressedAs: SeasonalPack?

    /// A season the user has already overruled by choosing a charm themselves.
    ///
    /// Without it, "put my own charm back on" and "dress the rope for the season"
    /// take turns every hour for the rest of October. Cleared the moment the season
    /// ends, so next year's Halloween is offered afresh rather than being declined
    /// for ever on the strength of one afternoon.
    var overruled: SeasonalPack?

    init(
        isAutomatic: Bool = true,
        pinned: SeasonalPack? = nil,
        diwaliWindow: SeasonWindow = SeasonalPack.defaultDiwaliWindow,
        restore: [CharmID]? = nil,
        dressedAs: SeasonalPack? = nil,
        overruled: SeasonalPack? = nil
    ) {
        self.isAutomatic = isAutomatic
        self.pinned = pinned
        self.diwaliWindow = diwaliWindow
        self.restore = restore
        self.dressedAs = dressedAs
        self.overruled = overruled
    }

    /// Tolerant decoding, like every other settings type here.
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let fallback = SeasonalSettings()

        self.init(
            isAutomatic: (try? container.decodeIfPresent(Bool.self, forKey: .isAutomatic))
                .flatMap { $0 } ?? fallback.isAutomatic,
            pinned: (try? container.decodeIfPresent(SeasonalPack.self, forKey: .pinned)).flatMap { $0 },
            diwaliWindow: (try? container.decodeIfPresent(SeasonWindow.self, forKey: .diwaliWindow))
                .flatMap { $0 } ?? fallback.diwaliWindow,
            restore: (try? container.decodeIfPresent([CharmID].self, forKey: .restore)).flatMap { $0 },
            dressedAs: (try? container.decodeIfPresent(SeasonalPack.self, forKey: .dressedAs)).flatMap { $0 },
            overruled: (try? container.decodeIfPresent(SeasonalPack.self, forKey: .overruled)).flatMap { $0 }
        )
    }
}
