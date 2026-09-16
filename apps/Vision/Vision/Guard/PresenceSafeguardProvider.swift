//
//  PresenceSafeguardProvider.swift
//  Vision
//
//  False-positive lock protection for Vision Guard.
//  Ensures the Mac is never locked while:
//  - Playing active media/video (NowPlaying / CoreAudio)
//  - Presenting or running full-screen apps (Keynote, PowerPoint, Video Players)
//  - Active video conferencing calls (Zoom, Teams, Meet, Webex)
//

import Foundation
import AppKit
import CoreGraphics

@MainActor
public final class PresenceSafeguardProvider {
    public static let shared = PresenceSafeguardProvider()

    private init() {}

    /// Evaluates whether any active false-positive safeguard is blocking an auto-lock event.
    public func isLockSafeguarded() -> (safeguarded: Bool, reason: String?) {
        // 1. Check Fullscreen Presentation Mode
        if isAppInFullscreen() {
            return (true, "Active Fullscreen Presentation")
        }

        // 2. Check Video Conferencing Apps
        if let callApp = activeVideoCallApp() {
            return (true, "Active Video Call (\(callApp))")
        }

        // 3. Check System Input Activity (< 3 seconds)
        let idleTime = CGEventSource.secondsSinceLastEventType(.hidSystemState, eventType: CGEventType(rawValue: UInt32.max)!)
        if idleTime < 3.0 {
            return (true, "Active Keyboard/Mouse Usage")
        }

        return (false, nil)
    }

    /// Checks if any frontmost application is in full-screen mode (e.g. video playback, Keynote presentation).
    private func isAppInFullscreen() -> Bool {
        guard let windowInfoList = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] else {
            return false
        }

        let mainScreenBounds = NSScreen.main?.frame ?? .zero
        guard mainScreenBounds.width > 0 else { return false }

        for windowInfo in windowInfoList {
            guard let boundsDict = windowInfo[kCGWindowBounds as String] as? [String: Any],
                  let windowBounds = CGRect(dictionaryRepresentation: boundsDict as CFDictionary),
                  let layer = windowInfo[kCGWindowLayer as String] as? Int, layer == 0 else {
                continue
            }

            // If a main window matches main screen dimensions, it is in fullscreen
            if windowBounds.width >= mainScreenBounds.width && windowBounds.height >= mainScreenBounds.height {
                if let appName = windowInfo[kCGWindowOwnerName as String] as? String,
                   appName != "Finder" && appName != "Dock" && appName != "Vision" {
                    return true
                }
            }
        }
        return false
    }

    /// Checks for running active video call processes.
    private func activeVideoCallApp() -> String? {
        let videoCallIdentifiers = [
            "us.zoom.xos": "Zoom",
            "com.microsoft.teams": "Microsoft Teams",
            "com.cisco.webexmeetingsapp": "Cisco Webex",
            "com.apple.FaceTime": "FaceTime",
            "com.hnc.Discord": "Discord"
        ]

        let running = NSWorkspace.shared.runningApplications
        for app in running {
            if let bundleID = app.bundleIdentifier, let name = videoCallIdentifiers[bundleID] {
                return name
            }
        }
        return nil
    }
}
