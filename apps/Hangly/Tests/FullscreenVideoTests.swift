//
//  FullscreenVideoTests.swift
//  HanglyTests
//

import CoreGraphics
import Testing

@testable import Hangly

/// "A film is on" is two facts, and the suite is mostly about why one is not enough.
@Suite("Fullscreen video")
struct FullscreenVideoTests {
    private let us = AppConstants.appName

    @Test("A Space owned by one other app is a full-screen Space")
    func fullScreenSpace() {
        #expect(FullscreenVideoWatcher.isFullScreenSpace(owners: ["TextEdit"], appName: us))
        // Our own overlay is on every Space and never counts towards the one.
        #expect(FullscreenVideoWatcher.isFullScreenSpace(owners: ["TextEdit", us], appName: us))
    }

    @Test("An ordinary desktop is not, however few windows are open")
    func ordinaryDesktop() {
        #expect(FullscreenVideoWatcher.isFullScreenSpace(owners: ["Safari", "Finder"], appName: us) == false)
        #expect(FullscreenVideoWatcher.isFullScreenSpace(owners: [], appName: us) == false)
        #expect(FullscreenVideoWatcher.isFullScreenSpace(owners: [us], appName: us) == false)
    }

    @Test("Something must actually be playing")
    func playbackIsRequired() {
        // The half of the rule that stops a single maximised window from hiding the
        // ornament: a window that is merely large holds no display assertion. This
        // matters because macOS reports a maximised window and a full-screen one
        // with identical bounds — measured, not assumed.
        #expect(FullscreenVideoWatcher.othersHoldingDisplayAssertion([]).isEmpty)
        #expect(FullscreenVideoWatcher.othersHoldingDisplayAssertion(["Brave Browser"]).isEmpty == false)
    }

    @Test("Hangly keeping its own display awake would not count")
    func weDoNotCountOurselves() {
        #expect(FullscreenVideoWatcher.othersHoldingDisplayAssertion([us]).isEmpty)
        #expect(FullscreenVideoWatcher.othersHoldingDisplayAssertion([us, "VLC"]) == ["VLC"])
    }

    @Test("VLC's own full screen counts, because it never gets a Space")
    func nonNativeFullScreen() {
        let screen = CGRect(x: 0, y: 0, width: 1710, height: 1107)
        // Measured: VLC full screen covers the menu bar; a maximised window does
        // not, and that strip is the only thing that tells them apart.
        let vlc = ScreenWindow(owner: "VLC", frame: CGRect(x: 0, y: 0, width: 1710, height: 1107))
        let maximised = ScreenWindow(owner: "Brave Browser", frame: CGRect(x: 0, y: 34, width: 1710, height: 1073))

        #expect(FullscreenVideoWatcher.coversWholeScreen(windows: [vlc], screens: [screen], appName: us))
        #expect(FullscreenVideoWatcher.coversWholeScreen(windows: [maximised], screens: [screen], appName: us) == false)

        // Immersive either way: VLC on a shared Space, or a Space of one app.
        #expect(FullscreenVideoWatcher.isImmersive(windows: [vlc, maximised], screens: [screen], appName: us))
    }

    @Test("Our own overlay never makes the screen look taken over")
    func ourWindowIsNotImmersive() {
        let screen = CGRect(x: 0, y: 0, width: 1710, height: 1107)
        let ours = ScreenWindow(owner: us, frame: screen)
        #expect(FullscreenVideoWatcher.coversWholeScreen(windows: [ours], screens: [screen], appName: us) == false)
    }

    @Test("Both halves together, across the cases that matter")
    func theWholeRule() {
        func hides(owners: Set<String>, playing: Set<String>) -> Bool {
            let screen = CGRect(x: 0, y: 0, width: 1710, height: 1107)
            let windows = owners.map {
                ScreenWindow(owner: $0, frame: CGRect(x: 0, y: 34, width: 1710, height: 1073))
            }
            return FullscreenVideoWatcher.isImmersive(windows: windows, screens: [screen], appName: us)
                && !FullscreenVideoWatcher.othersHoldingDisplayAssertion(playing).isEmpty
        }

        // A film, full screen.
        #expect(hides(owners: ["Brave Browser", us], playing: ["Brave Browser Helper"]))
        // A film in a small window, while working. Not immersive; leave it alone.
        #expect(hides(owners: ["Brave Browser", "Xcode", us], playing: ["Brave Browser Helper"]) == false)
        // A maximised editor, nothing playing. The false positive this rule exists
        // to avoid.
        #expect(hides(owners: ["Xcode", us], playing: []) == false)
        // Full-screen editor with a film paused.
        #expect(hides(owners: ["Xcode", us], playing: []) == false)
    }

    @Test("Reading the system answers rather than crashing")
    func systemReadsAreSafe() {
        // Both are permissionless reads — the same information `pmset -g assertions`
        // prints, and window bounds, neither of which needs an entitlement. Neither
        // may throw, and an empty answer is an answer.
        _ = FullscreenVideoWatcher.activeSpaceWindows()
        _ = FullscreenVideoWatcher.displayAssertionHolders()
    }

    @Test("The whole feature is off until it is asked for")
    func offByDefault() {
        #expect(OverlaySettings().hidesDuringFullscreenVideo == false)
    }
}
