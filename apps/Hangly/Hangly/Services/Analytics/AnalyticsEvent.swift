//
//  AnalyticsEvent.swift
//  Hangly
//
//  The things the app is allowed to say about itself.
//

import Foundation

/// A property value, as a closed set of types.
///
/// Deliberately not `Any`. An event built out of `Any` cannot be compared, cannot be
/// `Sendable`, and cannot be asserted on in a test without casting — and the whole
/// safety argument for an analytics layer is that you can look at an event and see
/// exactly what leaves the machine. This is the list of things that may.
enum AnalyticsValue: Equatable, Sendable {
    case string(String)
    case integer(Int)
    case number(Double)
    case flag(Bool)
    case list([String])

    /// The form the transport wants.
    var propertyValue: Any {
        switch self {
        case .string(let value): value
        case .integer(let value): value
        case .number(let value): value
        case .flag(let value): value
        case .list(let value): value
        }
    }
}

/// One thing that happened, and the few facts that go with it.
struct AnalyticsEvent: Equatable, Sendable {
    let name: String
    let properties: [String: AnalyticsValue]

    init(_ name: String, _ properties: [String: AnalyticsValue] = [:]) {
        self.name = name
        self.properties = properties
    }
}

extension AnalyticsEvent {
    // The whole vocabulary, in one place. Nothing else in the app is allowed to
    // invent an event name, which is what keeps the list in `PRIVACY.md` true.
    static let appFirstLaunch = AnalyticsEvent("app_first_launch")
    static let appLaunch = AnalyticsEvent("app_launch")
    static let appQuit = AnalyticsEvent("app_quit")

    static func charmAdded(_ charm: CharmID) -> AnalyticsEvent {
        AnalyticsEvent("charm_added", ["charm": .string(charm.analyticsName)])
    }

    static func charmRemoved(_ charm: CharmID) -> AnalyticsEvent {
        AnalyticsEvent("charm_removed", ["charm": .string(charm.analyticsName)])
    }

    static func charmReordered(from source: Int, to destination: Int) -> AnalyticsEvent {
        AnalyticsEvent("charm_reordered", ["from": .integer(source), "to": .integer(destination)])
    }

    /// An image brought in from a file. The file is not named, measured or described.
    static let charmImported = AnalyticsEvent("charm_imported")

    /// A charm finished in Create and kept.
    static let charmSaved = AnalyticsEvent("charm_saved")

    static func charmSelected(_ charm: CharmID) -> AnalyticsEvent {
        AnalyticsEvent("charm_selected", ["charm": .string(charm.analyticsName)])
    }

    static func ropeCountChanged(to count: Int) -> AnalyticsEvent {
        AnalyticsEvent("rope_count_changed", ["count": .integer(count)])
    }

    static func ropeStyleChanged(to style: RopeStyle) -> AnalyticsEvent {
        AnalyticsEvent("rope_style_changed", ["style": .string(style.rawValue)])
    }

    /// A setting on the Appearance page moved. The name of the setting, never a
    /// value that could describe the person's screen.
    static func appearanceChanged(_ setting: String) -> AnalyticsEvent {
        AnalyticsEvent("appearance_changed", ["setting": .string(setting)])
    }

    static func weatherEffectToggled(_ isEnabled: Bool) -> AnalyticsEvent {
        AnalyticsEvent("weather_effect_toggled", ["enabled": .flag(isEnabled)])
    }

    /// A collection was opened in the Library, however it was reached — a hero card
    /// or its chip. Reported from one place so that both routes count the same.
    static func collectionOpened(_ collection: CharmCollection) -> AnalyticsEvent {
        AnalyticsEvent("collection_opened", ["collection": .string(collection.chipName)])
    }

    /// A charm from one of the four collections was put on the rope.
    ///
    /// Reported *in addition to* `charm_selected`, not instead of it: that event is
    /// about the charm and this one is about the set it came from, and a query that
    /// wants "how often is any charm chosen" should not have to know about
    /// collections to get the right answer.
    ///
    /// Names here are the ones a person would recognise — "Marvel", "Spider-Man" —
    /// rather than the raw values `charm_selected` uses. That is what the brief
    /// specified; the cost is that renaming a charm in the UI renames it in the
    /// history too, so these two properties are display strings and not identities.
    static func collectionCharmSelected(_ collection: CharmCollection, charm: CharmKind) -> AnalyticsEvent {
        AnalyticsEvent("collection_charm_selected", [
            "collection": .string(collection.chipName),
            "charm": .string(charm.displayName)
        ])
    }

    static let followPopupShown = AnalyticsEvent("follow_popup_shown")
    static let followPopupFollowClicked = AnalyticsEvent("follow_popup_follow_clicked")
    static let followPopupMaybeLater = AnalyticsEvent("follow_popup_maybe_later")
    static let followPopupDismissed = AnalyticsEvent("follow_popup_dismissed")

    /// The Instagram link on the About page, which is a different place from the
    /// card and worth telling apart.
    static let followInstagramClicked = AnalyticsEvent("follow_instagram_clicked")

    // MARK: - AirDrop

    /// A file entered the charm's hit area while AirDrop mode is on.
    static let airdropDragEntered = AnalyticsEvent("airdrop_drag_entered")

    /// A file was released on the charm with AirDrop mode on.
    ///
    /// The extension and a coarse size bucket are the only facts that leave: no file
    /// name, no path, no AirDrop destination, no user content.
    static func airdropFileDropped(_ url: URL) -> AnalyticsEvent {
        AnalyticsEvent("airdrop_file_dropped", [
            "fileType": .string(url.pathExtension.lowercased()),
            "fileSizeBucket": .string(fileSizeBucket(for: url))
        ])
    }

    /// The native AirDrop picker was successfully presented.
    static let airdropPickerOpened = AnalyticsEvent("airdrop_picker_opened")

    private static func fileSizeBucket(for url: URL) -> String {
        guard let values = try? url.resourceValues(forKeys: [.fileSizeKey]),
              let size = values.fileSize else {
            return "unknown"
        }
        switch size {
        case ..<1_000_000:       return "<1MB"
        case ..<10_000_000:      return "1-10MB"
        case ..<100_000_000:     return "10-100MB"
        case ..<1_000_000_000:   return "100MB-1GB"
        default:                 return ">1GB"
        }
    }

    // MARK: - Creator Support / Coffee

    /// The creator support (Buy Creator a Coffee) sheet was presented.
    static func coffeeSheetOpened(source: String) -> AnalyticsEvent {
        AnalyticsEvent("coffee_sheet_opened", [
            "coffee_button_source": .string(source)
        ])
    }

    /// The user copied the creator's UPI ID.
    static func coffeeCopyUPI(source: String) -> AnalyticsEvent {
        AnalyticsEvent("coffee_copy_upi", [
            "coffee_button_source": .string(source)
        ])
    }

    /// The QR code was displayed in the coffee sheet.
    static func coffeeQRViewed(source: String) -> AnalyticsEvent {
        AnalyticsEvent("coffee_qr_viewed", [
            "coffee_button_source": .string(source)
        ])
    }
}

extension CharmID {
    /// How a charm is named in an event.
    ///
    /// Built-ins by their kind, which is a fact about Hangly. An import is reported
    /// as the word "custom" and nothing else — its identifier is unique to one
    /// person's file, and knowing that somebody imported *something* is the entire
    /// useful content of the fact.
    var analyticsName: String {
        switch self {
        case .builtIn(let kind): kind.rawValue
        case .custom: "custom"
        }
    }
}
