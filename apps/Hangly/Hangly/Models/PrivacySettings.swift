//
//  PrivacySettings.swift
//  Hangly
//
//  What the app is allowed to know about how it is used.
//

import Foundation

/// Whether anonymous usage is shared, and the only identifier that goes with it.
///
/// The identifier is a random value made on this machine and never left anywhere
/// else. It is not derived from the hardware, the user, the account or the network,
/// so it cannot be joined to anything: turning analytics off and on again produces a
/// different person as far as any server is concerned, and that is the intended
/// property rather than a limitation.
struct PrivacySettings: Codable, Equatable, Sendable {
    /// Shipped on. Everything sent is described in the app, and switching this off
    /// stops it at the source rather than filtering it later.
    var analyticsEnabled: Bool

    /// A random identifier for this installation, or `nil` until one is needed.
    ///
    /// Nil by default, and minted the first time something is actually sent — so an
    /// install that never sends anything never has an identifier to send. Cleared
    /// when analytics is turned off, so a session that has been opted out of cannot
    /// be stitched to one that comes after it.
    ///
    /// It also has to be nil by default for a duller reason: a default value
    /// containing fresh randomness is not equal to itself, and "settings that have
    /// been reset are the default settings" is a thing several tests check.
    var anonymousID: UUID?

    init(analyticsEnabled: Bool = true, anonymousID: UUID? = nil) {
        self.analyticsEnabled = analyticsEnabled
        self.anonymousID = anonymousID
    }

    /// Turns sharing on or off, breaking the identifier on the way out.
    mutating func setAnalyticsEnabled(_ isEnabled: Bool) {
        guard isEnabled != analyticsEnabled else { return }
        analyticsEnabled = isEnabled
        if !isEnabled {
            anonymousID = nil
        }
    }

    /// The identifier to send with, minting one if this is the first time.
    mutating func identifier() -> UUID {
        if let anonymousID { return anonymousID }
        let minted = UUID()
        anonymousID = minted
        return minted
    }

    /// Tolerant decoding, matching every other settings type: a missing or unreadable
    /// field falls back rather than discarding the document.
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let fallback = PrivacySettings()
        self.init(
            analyticsEnabled: try container.decodeIfPresent(Bool.self, forKey: .analyticsEnabled)
                ?? fallback.analyticsEnabled,
            anonymousID: (try? container.decodeIfPresent(UUID.self, forKey: .anonymousID)).flatMap { $0 }
        )
    }
}
