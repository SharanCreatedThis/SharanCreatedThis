//
//  AppMilestones.swift
//  Hangly
//
//  The few things the app remembers about having been used before.
//

import Foundation

/// Counters that decide when the app is allowed to ask for something.
///
/// Deliberately tiny. Nothing here is a preference; it is the record of what has
/// already happened, so that a thing designed to be asked once is asked once.
struct AppMilestones: Codable, Equatable, Sendable {
    /// How many times the app has been launched, counting this one.
    var launchCount: Int

    /// The launch the follow card was last shown on, or `nil` if it never has been.
    var followPromptShownAtLaunch: Int?

    /// Whether the card has been answered for good. Set by following, by declining,
    /// and by closing it — anything except "maybe later".
    var isFollowPromptSilenced: Bool

    /// Whether the welcome card has been put on screen. Set when it is *shown*, not
    /// when it is answered: a card whose whole promise is "once" must not come back
    /// because somebody quit the app while it was open.
    var hasSeenWelcome: Bool

    /// How many secrets the About page has given up, over the life of the install.
    ///
    /// Kept here rather than in the page because the page is rebuilt every time the
    /// window opens, and a counter that resets when you close a window is not a
    /// counter, it is a mood.
    var secretsFound: Int

    /// How many times the charm on the About page has been pushed.
    ///
    /// The one number in the app that exists purely because somebody might like to
    /// know it. Nothing reads it until it is large enough to be funny.
    var charmPushes: Int

    /// Launches before the card is offered.
    ///
    /// Five, because the ask only makes sense from somebody who has kept the app,
    /// and because an ornament is not something you form an opinion about on the
    /// first afternoon.
    static let launchesBeforeFollowPrompt = 5

    /// Launches to wait after "maybe later".
    ///
    /// The only path that shows it twice, and it exists because the person said the
    /// word "later" rather than "no".
    static let launchesBetweenReminders = 10

    init(
        launchCount: Int = 0,
        followPromptShownAtLaunch: Int? = nil,
        isFollowPromptSilenced: Bool = false,
        hasSeenWelcome: Bool = false,
        secretsFound: Int = 0,
        charmPushes: Int = 0
    ) {
        self.launchCount = max(0, launchCount)
        self.followPromptShownAtLaunch = followPromptShownAtLaunch
        self.isFollowPromptSilenced = isFollowPromptSilenced
        self.hasSeenWelcome = hasSeenWelcome
        self.secretsFound = max(0, secretsFound)
        self.charmPushes = max(0, charmPushes)
    }

    /// Whether this launch is the one that should offer the card.
    ///
    /// Pure, so the rule can be checked at every count without launching anything
    /// five times.
    var shouldOfferFollowPrompt: Bool {
        guard !isFollowPromptSilenced, launchCount >= Self.launchesBeforeFollowPrompt else { return false }
        guard let shown = followPromptShownAtLaunch else { return true }
        return launchCount >= shown + Self.launchesBetweenReminders
    }

    var isFirstLaunch: Bool {
        launchCount <= 1
    }

    /// Whether this launch should be greeted.
    ///
    /// The first one, and no other. There is deliberately no second chance and no
    /// "later": a greeting that can be postponed is an advertisement, and a greeting
    /// somebody has already read is clutter. An install that existed before this
    /// flag did is past its first launch and is left alone.
    var shouldOfferWelcome: Bool {
        !hasSeenWelcome && isFirstLaunch
    }

    /// Tolerant decoding, and the migration from when this was one flag.
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let fallback = AppMilestones()

        // `hasSeenFollowPrompt` is what builds before "maybe later" wrote. Seen meant
        // never again then, and it still does, so it maps onto being silenced.
        let legacySeen = (try? container.decodeIfPresent(Bool.self, forKey: .hasSeenFollowPrompt))
            .flatMap { $0 } ?? false

        self.init(
            launchCount: try container.decodeIfPresent(Int.self, forKey: .launchCount) ?? fallback.launchCount,
            followPromptShownAtLaunch: (try? container.decodeIfPresent(Int.self, forKey: .followPromptShownAtLaunch))
                .flatMap { $0 },
            isFollowPromptSilenced: (try? container.decodeIfPresent(Bool.self, forKey: .isFollowPromptSilenced))
                .flatMap { $0 } ?? legacySeen,
            // Absent means an install from before the card existed. Those are not
            // first launches, so the rule above declines them anyway; this only
            // spares them a greeting if they somehow are.
            hasSeenWelcome: (try? container.decodeIfPresent(Bool.self, forKey: .hasSeenWelcome))
                .flatMap { $0 } ?? false,
            secretsFound: (try? container.decodeIfPresent(Int.self, forKey: .secretsFound))
                .flatMap { $0 } ?? fallback.secretsFound,
            charmPushes: (try? container.decodeIfPresent(Int.self, forKey: .charmPushes))
                .flatMap { $0 } ?? fallback.charmPushes
        )
    }

    /// Written by hand because ``CodingKeys`` carries a key that is read and never
    /// written, which the synthesised encoder will not do.
    func encode(to encoder: any Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(launchCount, forKey: .launchCount)
        try container.encodeIfPresent(followPromptShownAtLaunch, forKey: .followPromptShownAtLaunch)
        try container.encode(isFollowPromptSilenced, forKey: .isFollowPromptSilenced)
        try container.encode(hasSeenWelcome, forKey: .hasSeenWelcome)
        try container.encode(secretsFound, forKey: .secretsFound)
        try container.encode(charmPushes, forKey: .charmPushes)
    }

    enum CodingKeys: String, CodingKey {
        case launchCount, followPromptShownAtLaunch, isFollowPromptSilenced
        case hasSeenWelcome, secretsFound, charmPushes

        /// Read, never written. See `init(from:)`.
        case hasSeenFollowPrompt
    }
}
