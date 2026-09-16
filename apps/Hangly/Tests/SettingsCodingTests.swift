//
//  SettingsCodingTests.swift
//  HanglyTests
//

import Foundation
import Testing

@testable import Hangly

/// The settings document is written to disk, so it must survive being written by a
/// different build of the app. These tests pin the tolerant-decoding behaviour.
@Suite("Settings coding")
struct SettingsCodingTests {
    private func decodeOverlay(_ json: String) throws -> OverlaySettings {
        try JSONDecoder().decode(OverlaySettings.self, from: Data(json.utf8))
    }

    @Test("An empty document decodes to the shipped defaults")
    func emptyDocumentUsesDefaults() throws {
        let decoded = try decodeOverlay("{}")

        #expect(decoded == OverlaySettings())
    }

    @Test("A partial document keeps the stored value and defaults the rest")
    func partialDocumentDefaultsMissingKeys() throws {
        let decoded = try decodeOverlay(#"{"opacity": 0.5}"#)

        #expect(decoded.opacity == 0.5)
        #expect(decoded.anchor == OverlaySettings().anchor)
        #expect(decoded.charmSize == OverlaySettings().charmSize)
    }

    @Test("Keys written by a newer build are ignored instead of throwing")
    func unknownKeysAreIgnored() throws {
        let decoded = try decodeOverlay(#"{"ropeSegmentCount": 24, "opacity": 0.8}"#)

        #expect(decoded.opacity == 0.8)
    }

    @Test("Out-of-range numbers are clamped to the supported range")
    func outOfRangeValuesAreClamped() throws {
        let tooBig = try decodeOverlay(#"{"charmSize": 99, "ropeLength": 9, "opacity": 4}"#)
        let tooSmall = try decodeOverlay(#"{"charmSize": -99, "ropeLength": -9, "opacity": -4}"#)

        #expect(tooBig.charmSize == OverlaySettings.Limits.charmSize.upperBound)
        #expect(tooBig.ropeLength == OverlaySettings.Limits.ropeLength.upperBound)
        #expect(tooBig.opacity == OverlaySettings.Limits.opacity.upperBound)
        #expect(tooSmall.charmSize == OverlaySettings.Limits.charmSize.lowerBound)
        #expect(tooSmall.ropeLength == OverlaySettings.Limits.ropeLength.lowerBound)
        #expect(tooSmall.opacity == OverlaySettings.Limits.opacity.lowerBound)
    }

    @Test("Encoding then decoding returns an identical value")
    func roundTripIsLossless() throws {
        let original = AppSettings(
            overlay: OverlaySettings(
                isEnabled: false,
                anchor: .topTrailing,
                charmSize: 1.4,
                ropeLength: 1.2,
                opacity: 0.6,
                horizontalOffset: -120,
                verticalOffset: 48
            ),
            launchAtLogin: true
        )

        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(AppSettings.self, from: data)

        #expect(decoded == original)
    }

    @Test("Sound settings default on at a gentle volume and clamp when decoded")
    func soundSettingsDecode() throws {
        let defaults = try JSONDecoder().decode(AppSettings.self, from: Data("{}".utf8))
        #expect(defaults.soundEffectsEnabled)
        #expect(defaults.soundVolume > 0.05)
        #expect(defaults.soundVolume < 0.3)

        let loud = try JSONDecoder().decode(AppSettings.self, from: Data(#"{"soundVolume": 9}"#.utf8))
        #expect(loud.soundVolume == 1)

        let off = try JSONDecoder().decode(AppSettings.self, from: Data(#"{"soundEffectsEnabled": false}"#.utf8))
        #expect(off.soundEffectsEnabled == false)
    }

    @Test("A document with no schema version is treated as the current schema")
    func missingSchemaVersionDefaults() throws {
        let decoded = try JSONDecoder().decode(AppSettings.self, from: Data("{}".utf8))

        #expect(decoded.schemaVersion == AppSettings.currentSchemaVersion)
        #expect(decoded.overlay == OverlaySettings())
        #expect(decoded.launchAtLogin == AppSettings().launchAtLogin)
    }

    @Test("A document written before the redesign keeps the size it had")
    func sizeMigratesToCharmSize() throws {
        // "Size" was one slider that made the whole assembly bigger, which is
        // exactly what charm size means now — so a document from then opens at the
        // size its owner chose rather than snapping back to the default.
        let old = try decodeOverlay(#"{"scale": 1.35, "opacity": 0.9}"#)

        #expect(old.charmSize == 1.35)
        #expect(old.ropeLength == OverlaySettings().ropeLength)
        #expect(old.opacity == 0.9)

        // And the three toggles the redesign removed are ignored rather than fatal.
        let withToggles = try decodeOverlay(
            #"{"scale": 1.1, "isClickThrough": false, "joinsAllSpaces": false, "anchorsToScreenEdge": false}"#
        )
        #expect(withToggles.charmSize == 1.1)
    }

    @Test("Only the new keys are written")
    func removedKeysAreNotWritten() throws {
        let data = try JSONEncoder().encode(OverlaySettings())
        let json = try #require(String(data: data, encoding: .utf8))

        #expect(json.contains("charmSize"))
        #expect(json.contains("ropeLength"))
        for gone in ["\"scale\"", "isClickThrough", "joinsAllSpaces", "anchorsToScreenEdge", "ropeProfile"] {
            #expect(!json.contains(gone), "\(gone) is still being written")
        }
    }
}
