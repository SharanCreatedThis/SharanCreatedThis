//
//  AirDropTests.swift
//  HanglyTests
//

import CoreGraphics
import Foundation
import Testing
import UniformTypeIdentifiers

@testable import Hangly

@Suite("AirDrop feature")
@MainActor
struct AirDropTests {

    // MARK: - AirDropService URL Support

    @Test("Rejects non-file URLs")
    func rejectsNonFileURLs() {
        let webURL = URL(string: "https://apple.com/airdrop")!
        #expect(!AirDropService.isSupported(webURL))

        let ftpURL = URL(string: "ftp://example.com/file.zip")!
        #expect(!AirDropService.isSupported(ftpURL))
    }

    @Test("Rejects non-existent file paths")
    func rejectsNonExistentFiles() {
        let nonExistent = URL(fileURLWithPath: "/tmp/non_existent_file_\(UUID().uuidString).png")
        #expect(!AirDropService.isSupported(nonExistent))
    }

    @Test("Accepts existing temporary files and directories")
    func acceptsExistingFilesAndDirectories() throws {
        let tempDir = FileManager.default.temporaryDirectory
        #expect(AirDropService.isSupported(tempDir))

        let tempFile = tempDir.appendingPathComponent("hangly_airdrop_test_\(UUID().uuidString).png")
        try Data("dummy content".utf8).write(to: tempFile)
        defer { try? FileManager.default.removeItem(at: tempFile) }

        #expect(AirDropService.isSupported(tempFile))
        #expect(AirDropService.rejectionReason(for: tempFile) == nil)
    }

    @Test("Rejection reason is provided for unsupported items")
    func rejectionReasonForNonFiles() {
        let webURL = URL(string: "https://apple.com")!
        #expect(AirDropService.rejectionReason(for: webURL) == "Unsupported item")
    }

    // MARK: - Settings Persistence

    @Test("airdropOnDrop defaults to true")
    func airdropDefaultsToTrue() {
        let settings = OverlaySettings()
        #expect(settings.airdropOnDrop == true)
    }

    @Test("airdropOnDrop decodes properly from JSON")
    func airdropDecodesFromJSON() throws {
        let jsonDisabled = #"{"airdropOnDrop": false}"#
        let decodedDisabled = try JSONDecoder().decode(OverlaySettings.self, from: Data(jsonDisabled.utf8))
        #expect(decodedDisabled.airdropOnDrop == false)

        let jsonEnabled = #"{"airdropOnDrop": true}"#
        let decodedEnabled = try JSONDecoder().decode(OverlaySettings.self, from: Data(jsonEnabled.utf8))
        #expect(decodedEnabled.airdropOnDrop == true)
    }

    @Test("airdropOnDrop survives encode and decode roundtrip")
    func airdropRoundtrip() throws {
        var original = OverlaySettings()
        original.airdropOnDrop = false

        let encoded = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(OverlaySettings.self, from: encoded)
        #expect(decoded.airdropOnDrop == false)
    }

    // MARK: - Physics Impulse

    @Test("Applying impulse wakes the rope and moves the target node")
    func applyImpulseWakesAndMovesRope() {
        let anchor = CGPoint(x: 200, y: 0)
        let rope = RopeSimulation(configuration: .default, anchor: anchor)
        rope.start()

        // Let the rope step a bit so initial transients settle
        for _ in 0..<60 {
            rope.step(deltaTime: 1.0 / 60.0)
        }

        let charmNodeIndex = rope.points.count - 1
        let posBefore = rope.points[charmNodeIndex].position

        // Apply a rightward impulse
        let impulse = CGPoint(x: 500, y: 0)
        rope.applyImpulse(impulse, at: charmNodeIndex)

        // Step one frame
        rope.step(deltaTime: 1.0 / 60.0)
        let posAfter = rope.points[charmNodeIndex].position

        // Target node should have shifted in the direction of the impulse
        #expect(posAfter.x > posBefore.x)
    }

    @Test("Applying impulse to pinned root node does nothing")
    func applyImpulseToPinnedNodeIsIgnored() {
        let anchor = CGPoint(x: 200, y: 0)
        let rope = RopeSimulation(configuration: .default, anchor: anchor)
        rope.start()

        let rootIndex = 0
        #expect(rope.points[rootIndex].isPinned)

        let posBefore = rope.points[rootIndex].position
        rope.applyImpulse(CGPoint(x: 500, y: 0), at: rootIndex)
        rope.step(deltaTime: 1.0 / 60.0)

        #expect(rope.points[rootIndex].position == posBefore)
    }

    // MARK: - Analytics Events

    @Test("AirDrop analytics event payloads are valid")
    func airdropAnalyticsEvents() {
        let dragEntered = AnalyticsEvent.airdropDragEntered
        #expect(dragEntered.name == "airdrop_drag_entered")

        let pickerOpened = AnalyticsEvent.airdropPickerOpened
        #expect(pickerOpened.name == "airdrop_picker_opened")

        let testURL = URL(fileURLWithPath: "/Users/test/Documents/photo.png")
        let dropEvent = AnalyticsEvent.airdropFileDropped(testURL)
        #expect(dropEvent.name == "airdrop_file_dropped")
        #expect(dropEvent.properties["fileType"] == .string("png"))
    }
}
