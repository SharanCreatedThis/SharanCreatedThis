//
//  AmbientCoordinator.swift
//  Hangly
//
//  The three things the rope follows but does not control.
//

import CoreGraphics
import Foundation

/// Keeps the rope in line with the calendar, the clock and the sky.
///
/// All three are *ambient*: nobody chooses them, and after the redesign nobody can.
/// What they have in common is the reason they live together here — each is read on
/// its own slow schedule and none of them may wake a sleeping rope. A style change
/// is something a person just asked for and should see at once; noon arriving, or a
/// shower starting, is not.
///
/// Split out of `OverlayViewModel` because it is a coherent job with its own state,
/// and because the view model should be about presenting a rope rather than about
/// what time it is.
@MainActor
final class AmbientCoordinator {
    /// How often the clock is read. Reading a `Date()` a hundred and twenty times a
    /// second to learn something that changes twice a day is the definition of idle
    /// work.
    private static let profileInterval: TimeInterval = 60

    /// What the weather is doing to the charm's colours.
    private(set) var mood: WeatherMood = .clear

    private let settingsStore: SettingsStore
    private let simulation: RopeSimulation
    private let weather: WeatherService
    private let seasonal: SeasonalCoordinator

    private var nextProfileCheck: TimeInterval = 0

    init(
        settingsStore: SettingsStore,
        simulation: RopeSimulation,
        weather: WeatherService,
        seasonal: SeasonalCoordinator
    ) {
        self.settingsStore = settingsStore
        self.simulation = simulation
        self.weather = weather
        self.seasonal = seasonal
        mood = weather.mood
    }

    /// Brings the rope up to date.
    /// - Returns: Whether the weather changed, which is the only one of the three
    ///   that needs a redraw the solver would not otherwise produce.
    func update(elapsed: TimeInterval, canvasSize: CGSize) -> Bool {
        seasonal.refreshIfDue(elapsed: elapsed)

        if elapsed >= nextProfileCheck {
            nextProfileCheck = elapsed + Self.profileInterval
            // What the clock implies. There is no way to override it: a rope that
            // keeps the time is to be noticed, not configured.
            simulation.setTimeProfile(RopeTimeProfile.forDate(Date()))
        }

        // Dragging either slider re-fits the rope, which makes the change happen
        // rather than jump: the links lengthen and the solver pulls the chain down
        // over the next few frames, or the charm swells where it hangs.
        let overlay = settingsStore.settings.overlay
        if canvasSize.height > 0 {
            simulation.setRopeLength(overlay.ropeLength, in: canvasSize)
            simulation.setCharmSize(overlay.charmSize, in: canvasSize)
        }

        guard weather.mood != mood else { return false }
        mood = weather.mood
        return true
    }
}
