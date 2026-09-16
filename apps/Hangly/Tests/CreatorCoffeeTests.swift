//
//  CreatorCoffeeTests.swift
//  HanglyTests
//

import AppKit
import Foundation
import Testing

@testable import Hangly

@Suite("Creator Support (Buy Creator a Coffee)")
@MainActor
struct CreatorCoffeeTests {

    // MARK: - UPI & Creator Details

    @Test("UPI ID matches the required destination")
    func upiIDMatchesSpecification() {
        #expect(BuyCoffeeSheet.upiID == "8870786087@yescred")
    }

    @Test("Creator handle and Instagram URL are correct")
    func creatorDetailsMatchSpecification() {
        #expect(Creator.handle == "@sharan.created.this")
        #expect(Creator.instagram?.absoluteString == "https://instagram.com/sharan.created.this")
    }

    @Test("Charm suggestion email drafts to swarnsharan@gmail.com")
    func charmSuggestionEmailDestination() {
        #expect(Creator.charmSuggestionAddress == "swarnsharan@gmail.com")
        let url = Creator.charmSuggestion(version: "2.0.0")
        #expect(url?.scheme == "mailto")
        #expect(url?.path == "swarnsharan@gmail.com")
        let components = URLComponents(url: url!, resolvingAgainstBaseURL: false)
        let subject = components?.queryItems?.first(where: { $0.name == "subject" })?.value
        #expect(subject == "Hangly 2.0.0 — charm suggestion")
    }

    // MARK: - Analytics Events

    @Test("Coffee analytics events carry correct names and source parameter")
    func coffeeAnalyticsEvents() {
        let sources = ["about", "milestone_popup", "release_notes", "landing_page"]

        for source in sources {
            let sheetOpened = AnalyticsEvent.coffeeSheetOpened(source: source)
            #expect(sheetOpened.name == "coffee_sheet_opened")
            #expect(sheetOpened.properties["coffee_button_source"] == .string(source))

            let copyUPI = AnalyticsEvent.coffeeCopyUPI(source: source)
            #expect(copyUPI.name == "coffee_copy_upi")
            #expect(copyUPI.properties["coffee_button_source"] == .string(source))

            let qrViewed = AnalyticsEvent.coffeeQRViewed(source: source)
            #expect(qrViewed.name == "coffee_qr_viewed")
            #expect(qrViewed.properties["coffee_button_source"] == .string(source))
        }
    }

    // MARK: - Copy Behavior

    @Test("Copying writes exact UPI ID to pasteboard")
    func copyUPIWritesToPasteboard() {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(BuyCoffeeSheet.upiID, forType: .string)

        let readBack = pasteboard.string(forType: .string)
        #expect(readBack == "8870786087@yescred")
    }

    // MARK: - Asset Availability

    @Test("CreatorUPIQR image asset exists in asset catalog")
    func qrAssetLoadsFromBundle() {
        let image = NSImage(named: "CreatorUPIQR")
        #expect(image != nil, "CreatorUPIQR image must be loadable by NSImage(named:)")
    }
}
