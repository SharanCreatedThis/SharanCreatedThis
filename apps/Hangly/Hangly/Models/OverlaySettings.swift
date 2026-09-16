//
//  OverlaySettings.swift
//  Hangly
//
//  Value type describing how the floating overlay should be presented.
//

import Foundation

/// Everything the overlay window controller needs in order to present the overlay.
///
/// This is a pure value type: no AppKit, no observation, no persistence. It is the
/// single source of truth that flows from `SettingsStore` down to the window layer.
struct OverlaySettings: Codable, Equatable, Sendable {
    /// Valid ranges for the tunable values, shared by the decoder and the Settings UI.
    enum Limits {
        /// How large the charm is drawn. The overlay's canvas scales with it, so a
        /// bigger charm gets more room to swing in rather than a more crowded one.
        static let charmSize: ClosedRange<Double> = 0.5...2.0

        /// How far the charm hangs, as a multiple of the shipped rope length.
        /// Clamped where it is applied so a long rope still leaves the charm room
        /// inside the canvas.
        static let ropeLength: ClosedRange<Double> = 0.7...1.3

        static let opacity: ClosedRange<Double> = 0.2...1.0
        /// Wide enough to reach either edge of a large display.
        ///
        /// These stopped being nudges when the position control became positional:
        /// an offset is now whatever it takes to put the charm where it was dropped,
        /// so the range has to cover a screen rather than a fidget. Six hundred
        /// points was not enough to cross a 27-inch display, which is why dragging
        /// to the far edge used to stop short.
        static let horizontalOffset: ClosedRange<Double> = -1600...1600
        static let verticalOffset: ClosedRange<Double> = -400...1200
    }

    /// Whether the overlay window should exist at all.
    var isEnabled: Bool

    /// Which screen edge the overlay hangs from.
    var anchor: OverlayAnchor

    /// How large the charm is drawn — the multiplier applied to
    /// `AppConstants.Overlay.baseSize`, and so to everything hanging in it.
    ///
    /// Called "Size" until the redesign, which is the problem it had: size of what?
    /// A person wanting a bigger charm and a person wanting it to hang lower were
    /// reaching for the same slider and neither was getting what they meant. This
    /// one now answers only the first question, and ``ropeLength`` answers the
    /// second.
    var charmSize: Double

    /// How far the charm hangs down, as a multiple of the shipped rope length.
    var ropeLength: Double

    /// Window alpha, applied by the SwiftUI content.
    var opacity: Double

    /// Points to shift the overlay horizontally. Positive moves right.
    var horizontalOffset: Double

    /// Points to shift the overlay vertically. Positive moves down.
    var verticalOffset: Double

    /// What hangs on the rope, from the anchor down.
    var stack: CharmStack

    /// Which charm hangs on the end of the rope.
    ///
    /// Kept as the name it always had, because every part of the app that predates
    /// stacks — the Library, the Studio, an import, the menu's picker — means this
    /// one when it says "the charm", and none of them had to learn a new word.
    var charm: CharmID {
        get { stack.bottom }
        set { stack.bottom = newValue }
    }

    /// Used when a settings document names no charm at all, and when a stack would
    /// otherwise be left empty.
    static let fallbackCharm = CharmID.builtIn(.nazar)

    /// What a first run hangs.
    ///
    /// One charm, so that the places put away are copies of it and growing the rope
    /// gives something recognisable rather than something arbitrary.
    static var shippedStack: CharmStack {
        CharmStack(fallbackCharm)
    }

    /// What the rope is made of.
    var ropeStyle: RopeStyle

    /// Whether the ornament steps out of the way during full-screen video.
    ///
    /// Off by default, and that is deliberate rather than timid. Telling a
    /// full-screen film from a full-screen anything-else needs a heuristic, a
    /// heuristic is occasionally wrong, and an ornament that disappears for reasons
    /// the user cannot see is worse than one that stays put. Whoever wants it can
    /// ask for it; nobody is surprised by it.
    var hidesDuringFullscreenVideo: Bool

    /// Whether dropping a file on a charm opens the native AirDrop picker.
    ///
    /// Off by default, because the overlay sits above everything on the screen and
    /// should not unexpectedly become a file target. When off, dropping an image on
    /// a charm opens the Studio instead, which is the behaviour that has always
    /// existed.
    var airdropOnDrop: Bool

    /// The shipped defaults: one charm on a thread cord, hanging near the top-right
    /// of the display, a little short and a little in from the corner.
    ///
    /// These are measured rather than chosen — they are the values the app was
    /// actually being used at — which is why they are not round numbers.
    init(
        isEnabled: Bool = true,
        anchor: OverlayAnchor = .topTrailing,
        charmSize: Double = 0.96,
        ropeLength: Double = 0.78,
        opacity: Double = 1.0,
        horizontalOffset: Double = 192,
        verticalOffset: Double = -12,
        charm: CharmID? = nil,
        stack: CharmStack? = nil,
        ropeStyle: RopeStyle = .shipped,
        hidesDuringFullscreenVideo: Bool = false,
        airdropOnDrop: Bool = true
    ) {
        self.isEnabled = isEnabled
        self.anchor = anchor
        self.charmSize = charmSize.clamped(to: Limits.charmSize)
        self.ropeLength = ropeLength.clamped(to: Limits.ropeLength)
        self.opacity = opacity.clamped(to: Limits.opacity)
        self.horizontalOffset = horizontalOffset.clamped(to: Limits.horizontalOffset)
        self.verticalOffset = verticalOffset.clamped(to: Limits.verticalOffset)
        // Three ways in, in order of how much the caller has said. A stack wins; a
        // single charm means exactly that one charm, which is what a settings
        // document from before stacks is saying; and naming neither is a first run,
        // which gets the rope the app ships with.
        self.stack = stack ?? charm.map(CharmStack.init) ?? Self.shippedStack
        self.ropeStyle = ropeStyle
        self.hidesDuringFullscreenVideo = hidesDuringFullscreenVideo
        self.airdropOnDrop = airdropOnDrop
    }

    /// Tolerant decoding: unknown or missing keys fall back to the default value and
    /// out-of-range numbers are clamped, so a settings file written by an older (or
    /// newer) build can never crash or corrupt the running app.
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let fallback = OverlaySettings()

        self.init(
            isEnabled: try container.decodeIfPresent(Bool.self, forKey: .isEnabled) ?? fallback.isEnabled,
            // `try?` rather than `try`: an unrecognised case throws, and a raw value
            // written by a newer build must degrade to the default rather than
            // discarding every other preference alongside it.
            anchor: (try? container.decodeIfPresent(OverlayAnchor.self, forKey: .anchor)) ?? fallback.anchor,
            // `charmSize` is what this build writes. `scale` is what every build
            // before the redesign wrote, and it meant exactly this — one slider
            // that made the whole assembly bigger — so a document from then keeps
            // the size it had rather than jumping back to the default.
            charmSize: try container.decodeIfPresent(Double.self, forKey: .charmSize)
                ?? container.decodeIfPresent(Double.self, forKey: .scale)
                ?? fallback.charmSize,
            ropeLength: try container.decodeIfPresent(Double.self, forKey: .ropeLength)
                ?? fallback.ropeLength,
            opacity: try container.decodeIfPresent(Double.self, forKey: .opacity) ?? fallback.opacity,
            horizontalOffset: try container.decodeIfPresent(Double.self, forKey: .horizontalOffset)
                ?? fallback.horizontalOffset,
            verticalOffset: try container.decodeIfPresent(Double.self, forKey: .verticalOffset)
                ?? fallback.verticalOffset,
            // Deliberately not falling back to a charm here: a document that names
            // none is a document with nothing to say about the rope, and the rope it
            // gets is the shipped one. Substituting a charm would quietly turn that
            // into a one-charm rope.
            charm: (try? container.decodeIfPresent(CharmID.self, forKey: .charm)).flatMap { $0 },
            // `charms` is what this build writes; `charm` is what every build before
            // stacks wrote, and is also written below so that downgrading keeps a
            // charm on the rope rather than falling back to the default one. A
            // document holding an unreadable charm in one slot loses the whole
            // stack rather than a slot, because a stack with a hole in it is not a
            // thing this app can draw.
            stack: Self.decodeStack(from: container),
            ropeStyle: (try? container.decodeIfPresent(RopeStyle.self, forKey: .ropeStyle)) ?? fallback.ropeStyle,
            hidesDuringFullscreenVideo: try container.decodeIfPresent(
                Bool.self, forKey: .hidesDuringFullscreenVideo
            ) ?? fallback.hidesDuringFullscreenVideo,
            airdropOnDrop: try container.decodeIfPresent(
                Bool.self, forKey: .airdropOnDrop
            ) ?? fallback.airdropOnDrop
        )
    }
}

extension OverlaySettings {
    private enum CodingKeys: String, CodingKey {
        case isEnabled, anchor, opacity, horizontalOffset, verticalOffset
        case charmSize, ropeLength, charm, charms, charmSlots, charmSizes, ropeStyle
        case hidesDuringFullscreenVideo, airdropOnDrop

        /// Read, never written. The redesign replaced one ambiguous "Size" with a
        /// charm size and a rope length; this is how a document from before it keeps
        /// the size it had.
        case scale
    }

    /// Writes the stack, and the bottom charm beside it under the key older builds
    /// read. The duplication is deliberate and costs one short string: a user who
    /// installs a build from before stacks should find their charm still on the
    /// rope, not the shipped default.
    func encode(to encoder: any Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(isEnabled, forKey: .isEnabled)
        try container.encode(anchor, forKey: .anchor)
        try container.encode(charmSize, forKey: .charmSize)
        try container.encode(ropeLength, forKey: .ropeLength)
        try container.encode(opacity, forKey: .opacity)
        try container.encode(horizontalOffset, forKey: .horizontalOffset)
        try container.encode(verticalOffset, forKey: .verticalOffset)
        try container.encode(charm, forKey: .charm)
        try container.encode(stack.charms, forKey: .charms)
        // The places not currently hanging, so that going down to one charm and back
        // up tomorrow returns the same rope rather than three copies of one charm.
        // Written as two arrays rather than one array of pairs so that the key a
        // build from before per-place sizing reads still holds what that build
        // expects to find under it.
        try container.encode(stack.storedSlots.map(\.charm), forKey: .charmSlots)
        try container.encode(stack.storedSlots.map(\.size), forKey: .charmSizes)
        try container.encode(ropeStyle, forKey: .ropeStyle)
        try container.encode(hidesDuringFullscreenVideo, forKey: .hidesDuringFullscreenVideo)
        try container.encode(airdropOnDrop, forKey: .airdropOnDrop)
    }
}

extension OverlaySettings {
    /// Rebuilds the stack from whichever of the three keys a document happens to
    /// carry: the full set of places, the ones hanging, or the single charm every
    /// build before stacks wrote.
    private static func decodeStack(from container: KeyedDecodingContainer<CodingKeys>) -> CharmStack? {
        let hanging = (try? container.decodeIfPresent([CharmID].self, forKey: .charms)).flatMap { $0 }
        guard let hanging, !hanging.isEmpty else { return nil }

        let slots = (try? container.decodeIfPresent([CharmID].self, forKey: .charmSlots)).flatMap { $0 }
        guard let slots, slots.count >= hanging.count else { return CharmStack(hanging) }

        // Absent in every document written before places could be sized, and absent
        // for any place a shorter array does not reach: both mean "the size the
        // artwork asks for", which is what the rope looked like when it was written.
        let sizes = (try? container.decodeIfPresent([Double].self, forKey: .charmSizes)).flatMap { $0 } ?? []
        let places = slots.enumerated().map { index, charm in
            RopeCharm(charm, size: sizes.indices.contains(index) ? sizes[index] : 1)
        }
        return CharmStack(slots: places, count: hanging.count)
    }
}
