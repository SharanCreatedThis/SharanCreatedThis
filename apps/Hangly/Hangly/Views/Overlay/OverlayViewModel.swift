//
//  OverlayViewModel.swift
//  Hangly
//
//  Presentation state for the overlay content.
//

import CoreGraphics
import Foundation
import Observation
import OSLog

/// Drives `OverlayRootView`.
///
/// Owns the rope simulation and republishes it to the view as an immutable
/// `RopeSnapshot` once per frame. Exactly one observable write happens per frame,
/// which is what keeps SwiftUI invalidation proportional to the display rate rather
/// than to the number of nodes.
///
/// It also owns the charm change: it notices a new selection on the next frame,
/// cross-fades the artwork and interpolates the charm's mass and size into the
/// simulation, so switching is live and never jumps.
///
/// Window size and screen position stay with `OverlayWindowController`.
@MainActor
@Observable
final class OverlayViewModel {
    /// The current frame, read by the renderer.
    private(set) var snapshot: RopeSnapshot = .empty

    /// The charms to draw this frame: one entry per place on the rope, from the
    /// anchor down, each holding two layers while that place is mid-change.
    private(set) var charmSlots: [[CharmLayer]] = []

    /// What the weather is doing to the charm and its cord.
    private(set) var weather: WeatherMood

    /// How far through a style change the cord is; the two properties below follow it.
    private var styleTransition: RopeStyleTransition

    /// The cord's look this frame, already blended across a style change.
    var ropeAppearance: RopeAppearance { styleTransition.appearance }

    /// The style or styles whose texture and beads are drawn this frame.
    var ropeStyleLayers: [RopeStyleLayer] { styleTransition.layers }

    #if !HANGLY_PRODUCTION
    /// Whether the debug overlay is drawn. See `AppConstants.Debug`.
    private(set) var isDebugEnabled = false

    /// Pre-rendered debug text, refreshed a few times a second rather than every
    /// frame so the canvas can reuse its resolved text between updates.
    private(set) var debugSummary = ""
    #endif

    /// A file is being held over the charm (Studio import mode).
    private(set) var isDropTargeted = false

    /// A file is being held over the charm (AirDrop mode).
    private(set) var isAirDropTargeted = false

    /// Which charm on the rope is targeted for the AirDrop drop, counted from
    /// the anchor. `nil` when nothing is hovering or AirDrop mode is off.
    private(set) var airDropTargetSlot: Int?

    /// Brief text drawn below the charm during an AirDrop hover. `nil` when
    /// nothing should be shown.
    private(set) var airDropLabel: String?

    /// Angle of the progress arc while an import runs; `nil` when idle.
    private(set) var importSpinnerAngle: Double?

    @ObservationIgnored private let settingsStore: SettingsStore
    @ObservationIgnored private let charmManager: CharmManager
    @ObservationIgnored private let importCoordinator: CharmImportCoordinator
    @ObservationIgnored private let audio: AudioService
    @ObservationIgnored private let accessibility: AccessibilityPreferences
    @ObservationIgnored private let weatherService: WeatherService
    @ObservationIgnored private let ambient: AmbientCoordinator
    @ObservationIgnored private let simulation: RopeSimulation
    @ObservationIgnored private(set) var analytics: AnalyticsManager?

    @ObservationIgnored private let stack: CharmStackPresenter

    /// A release slower than this is a placement, not a swing, and makes no sound.
    private static let soundSpeedThreshold = 500.0

    /// Speed at which a swing reaches full volume.
    private static let soundFullSpeed = 2600.0

    @ObservationIgnored private var elapsed: TimeInterval = 0

    /// When the clock is next worth reading; see `syncAmbient`.
    @ObservationIgnored private var nextProfileCheck: TimeInterval = 0

    /// The canvas the rope was last fitted to, so a change in rope length can re-fit
    /// it without waiting for the window to be resized.
    @ObservationIgnored private var canvasSize: CGSize = .zero
    private static let profileCheckInterval: TimeInterval = 60
    #if !HANGLY_PRODUCTION
    @ObservationIgnored private var nextDebugRefresh: TimeInterval = 0
    @ObservationIgnored private var smoothedFrameRate: Double = 0

    /// How often the debug read-out is recomputed, in seconds.
    private static let debugRefreshInterval: TimeInterval = 0.2
    #endif

    init(
        settingsStore: SettingsStore,
        charmManager: CharmManager,
        importCoordinator: CharmImportCoordinator,
        audio: AudioService,
        accessibility: AccessibilityPreferences,
        weatherService: WeatherService,
        seasonal: SeasonalCoordinator,
        analytics: AnalyticsManager? = nil,
        simulation: RopeSimulation = RopeSimulation()
    ) {
        self.settingsStore = settingsStore
        self.charmManager = charmManager
        self.importCoordinator = importCoordinator
        self.audio = audio
        self.accessibility = accessibility
        self.weatherService = weatherService
        self.analytics = analytics
        self.ambient = AmbientCoordinator(
            settingsStore: settingsStore,
            simulation: simulation,
            weather: weatherService,
            seasonal: seasonal
        )
        self.simulation = simulation
        self.weather = weatherService.mood

        self.stack = CharmStackPresenter(
            charms: settingsStore.settings.overlay.stack.charms.map(charmManager.charm(for:)),
            sizes: settingsStore.settings.overlay.stack.sizes
        )
        self.styleTransition = RopeStyleTransition(style: settingsStore.settings.overlay.ropeStyle)
    }

    /// Alpha applied to the rendered content.
    var opacity: Double {
        settingsStore.settings.overlay.opacity
    }

    var isDragging: Bool {
        simulation.isDragging
    }

    /// Whether the rope has settled. The clock drops to a low rate when it has.
    var isSleeping: Bool {
        simulation.isSleeping
    }

    /// The discs that accept a grab: one around each charm on the rope.
    var grabDiscs: [CharmGrabShape.Disc] {
        snapshot.charms.map {
            CharmGrabShape.Disc(
                center: $0.center,
                radius: $0.radius + RopeConfiguration.Layout.grabPadding
            )
        }
    }

    // MARK: - Lifecycle

    func start() {
        simulation.setCharmStack(stack.metrics)
        simulation.setBeads(stack.beads)
        simulation.setStyle(styleTransition.style)
        simulation.setTimeProfile(RopeTimeProfile.forDate(Date()))
        publishCharms()
        simulation.start()
        // With Reduce Motion on, nothing moves until the user moves it.
        if accessibility.reducesMotion {
            simulation.resetToHanging()
        }
        snapshot = simulation.snapshot()
    }

    func stop() {
        simulation.stop()
    }

    /// Re-fits the rope when the overlay's canvas changes size.
    func resize(to size: CGSize) {
        guard size.width > 0, size.height > 0 else { return }
        canvasSize = size
        simulation.ropeLength = settingsStore.settings.overlay.ropeLength
        simulation.charmSize = settingsStore.settings.overlay.charmSize
        simulation.resize(to: size)
        snapshot = simulation.snapshot()
    }

    /// Advances the simulation by one display frame.
    ///
    /// While the rope sleeps no snapshot is published, so Observation never fires
    /// and SwiftUI never redraws. That is what takes a settled overlay down to
    /// nothing: the canvas is only asked to draw when something has actually moved.
    func advance(by deltaTime: TimeInterval) {
        elapsed += deltaTime
        syncCharmStack(deltaTime: deltaTime)
        syncRopeStyle(deltaTime: deltaTime)

        // A sleeping rope publishes nothing, so a change in the weather republishes
        // the snapshot by hand to buy exactly one redraw rather than waking the
        // solver for a second.
        if ambient.update(elapsed: elapsed, canvasSize: canvasSize) {
            weather = ambient.mood
            snapshot = simulation.snapshot()
        }
        updateImportIndicator()

        let wasSleeping = simulation.isSleeping
        simulation.step(deltaTime: deltaTime)

        // Publish while awake, plus once more on the frame it falls asleep so the
        // final resting pose is drawn.
        if !simulation.isSleeping || !wasSleeping {
            snapshot = simulation.snapshot()
        }
        if simulation.isSleeping != wasSleeping {
            Logger.overlay.diagnostic("Rope \(self.simulation.isSleeping ? "asleep" : "awake").")
        }

        #if !HANGLY_PRODUCTION
        refreshDebugState(deltaTime: deltaTime)
        #endif
    }

    // MARK: - Interaction

    /// Whether a press at `location` would land on the charm.
    func canGrab(at location: CGPoint) -> Bool {
        simulation.canGrab(at: location)
    }

    func dragChanged(location: CGPoint, velocity: CGPoint) {
        if !simulation.isDragging {
            simulation.beginDrag(at: location)
        }
        simulation.updateDrag(to: location, velocity: velocity)
    }

    /// The charm being held, which with three on the rope is whichever one was
    /// grabbed rather than always the one on the end.
    private var grabbedCharm: any Charm {
        let charms = stack.charms
        guard let slot = simulation.draggedCharmSlot, charms.indices.contains(slot) else {
            return charms.last ?? CircleCharm()
        }
        return charms[slot]
    }

    /// Releasing hands the cursor's final velocity to the charm, so the rope keeps
    /// travelling instead of stopping dead. A real swing also makes the charm's sound.
    func dragEnded(location: CGPoint, velocity: CGPoint) {
        guard simulation.isDragging else { return }
        simulation.updateDrag(to: location, velocity: velocity)
        simulation.endDrag()

        let speed = velocity.magnitude
        if speed > Self.soundSpeedThreshold {
            let intensity = ((speed - Self.soundSpeedThreshold) / Self.soundFullSpeed).clamped(to: 0.25...1)
            audio.play(grabbedCharm.sound, intensity: intensity)
        }
    }

    // MARK: - Importing by drop

    func setDropTargeted(_ targeted: Bool) {
        if settingsStore.settings.overlay.airdropOnDrop {
            setAirDropTargeted(targeted)
        } else {
            guard targeted != isDropTargeted else { return }
            isDropTargeted = targeted
        }
    }

    /// Opens the first supported dropped file in the Studio, or sends it via
    /// AirDrop when that mode is enabled.
    /// - Returns: Whether the drop was accepted.
    func handleDrop(_ urls: [URL], at location: CGPoint? = nil) -> Bool {
        let airdropEnabled = settingsStore.settings.overlay.airdropOnDrop
        setDropTargeted(false)
        clearAirDropTargeting()

        if airdropEnabled {
            guard let url = urls.first(where: AirDropService.isSupported) else { return false }

            // Physics impulse — the charm swings from the impact.
            applyDropImpulse(at: location)

            analytics?.track(.airdropFileDropped(url))
            let opened = AirDropService.send(url)
            if opened {
                analytics?.track(.airdropPickerOpened)
            }
            return opened
        }

        // Existing behaviour: import into Studio.
        guard let url = urls.first(where: CharmImageProcessor.isSupported) else { return false }
        return importCoordinator.presentStudio(with: url)
    }

    // MARK: - AirDrop targeting

    private func setAirDropTargeted(_ targeted: Bool) {
        guard targeted != isAirDropTargeted else { return }
        isAirDropTargeted = targeted

        if targeted {
            // Find the nearest charm — with three on the rope, the closest one wins.
            airDropTargetSlot = (simulation.charmLayout.slots.count - 1)
            airDropLabel = "Drop to AirDrop"
            analytics?.track(.airdropDragEntered)
        } else {
            clearAirDropTargeting()
        }
    }

    private func clearAirDropTargeting() {
        guard isAirDropTargeted || airDropTargetSlot != nil || airDropLabel != nil else { return }
        isAirDropTargeted = false
        airDropTargetSlot = nil
        airDropLabel = nil
    }

    /// Gives the targeted charm a physics kick in the direction of the drop.
    private func applyDropImpulse(at location: CGPoint?) {
        // Pick the charm node — the targeted slot, or the bottom charm.
        let targetNode: Int
        if let slot = airDropTargetSlot,
           simulation.charmLayout.slots.indices.contains(slot) {
            targetNode = simulation.charmLayout.slots[slot].node
        } else {
            targetNode = simulation.points.count - 1
        }

        let impulseSpeed = 800.0
        if let location {
            let center = simulation.points.indices.contains(targetNode)
                ? simulation.points[targetNode].position
                : simulation.charmCenter
            let direction = (center - location).normalized
            simulation.applyImpulse(direction * impulseSpeed, at: targetNode)
        } else {
            // No location — nudge downward.
            simulation.applyImpulse(CGPoint(x: 0, y: impulseSpeed * 0.25), at: targetNode)
        }
    }

    /// Keeps frames flowing and the arc turning while an import runs, and stops
    /// publishing the moment it finishes so the rope can go back to sleep.
    private func updateImportIndicator() {
        if charmManager.isImporting {
            simulation.wake()
            importSpinnerAngle = (elapsed * 4.5).truncatingRemainder(dividingBy: 2 * .pi)
        } else if importSpinnerAngle != nil {
            importSpinnerAngle = nil
        }
    }

    // MARK: - Charm changes

    /// Picks up a new stack on the next frame, and carries any change in flight one
    /// frame further. Polling rather than observing keeps the change on the same
    /// clock as the animation that follows it.
    private func syncCharmStack(deltaTime: TimeInterval) {
        let places = settingsStore.settings.overlay.stack
        let chosen = places.charms
        var changed = false

        // Sizes are compared alongside identities: trimming one place of three is a
        // change to what hangs on the rope even though the same three charms hang
        // on it.
        if chosen != stack.ids || places.sizes != stack.sizes {
            let arrived = stack.apply(
                chosen.map(charmManager.charm(for:)),
                sizes: places.sizes,
                immediately: accessibility.reducesMotion
            )
            // The incoming charms' beads take over the cord at once and fade in with
            // them; the outgoing artwork is drawn on those beads until it is gone.
            simulation.setBeads(stack.beads)
            simulation.wake()
            if let announced = arrived.last {
                audio.play(announced.sound, intensity: 0.6)
            }
            changed = true
        }

        changed = stack.advance(by: deltaTime) || changed
        guard changed else { return }

        simulation.setCharmStack(stack.metrics)
        publishCharms()
    }

    private func publishCharms() {
        charmSlots = stack.layers
    }

    // MARK: - Rope style changes

    /// Picks up a new style on the next frame, the same way a charm change is picked
    /// up, so both land on the animation's own clock.
    ///
    /// The solver is told at once and the look follows. Nothing is paused, reset or
    /// waited for: the rope keeps every node's position and history across the
    /// change, so a charm that was mid-swing carries that swing into the new cord.
    private func syncRopeStyle(deltaTime: TimeInterval) {
        let selected = settingsStore.settings.overlay.ropeStyle
        if selected != styleTransition.style {
            styleTransition.begin(selected, immediately: accessibility.reducesMotion)
            simulation.setStyle(selected)
        } else if styleTransition.isRunning {
            // Guarded, because this is an observable property: advancing a
            // transition that has already finished would invalidate the overlay on
            // every frame for the rest of the session.
            styleTransition.advance(by: deltaTime)
        }
    }

    // MARK: - Debug

    // Development only. The refresh below reads `UserDefaults` five times a second
    // for as long as the rope is awake, which is not a cost a shipped ornament
    // should carry, so all of it is compiled out of production builds.
    #if !HANGLY_PRODUCTION
    private func refreshDebugState(deltaTime: TimeInterval) {
        if deltaTime > 0 {
            let instantaneous = 1 / deltaTime
            smoothedFrameRate = smoothedFrameRate == 0
                ? instantaneous
                : (smoothedFrameRate * 0.9) + (instantaneous * 0.1)
        }

        guard elapsed >= nextDebugRefresh else { return }
        nextDebugRefresh = elapsed + Self.debugRefreshInterval

        // Re-read each refresh so `defaults write` takes effect without a relaunch.
        let enabled = UserDefaults.standard.bool(forKey: AppConstants.Debug.ropeOverlayKey)
        if enabled != isDebugEnabled {
            isDebugEnabled = enabled
        }

        // Assign only on change: an unconditional write would invalidate the view
        // several times a second even with the rope asleep and debug off.
        let summary = enabled ? makeDebugSummary() : ""
        if summary != debugSummary {
            debugSummary = summary
        }
    }

    private func makeDebugSummary() -> String {
        let configuration = simulation.configuration
        let radii = simulation.charmLayout.slots.map { String(format: "%.0f", $0.radius) }.joined(separator: "/")
        let stretchPercent = max(0, (snapshot.maximumStretch - 1) * 100)
        let solverHertz = Int((1 / configuration.fixedTimeStep).rounded())

        return """
        HANGLY ROPE DEBUG
        nodes       \(snapshot.points.count) (\(configuration.segmentCount) segments)
        display     \(Int(smoothedFrameRate.rounded())) fps
        solver      \(simulation.lastStepCount) steps/frame @ \(solverHertz) Hz
        iterations  \(configuration.constraintIterations)
        max stretch +\(String(format: "%.2f", stretchPercent))%
        charms      \(stack.charms.map(\.displayName).joined(separator: ", "))
        beads       \(snapshot.beads.count) on \(String(format: "%.0f", simulation.cordLength)) pt of cord
        charm       \(radii) pt radius at size \(String(format: "%.2f", simulation.charmSize))
        dragging    \(simulation.isDragging ? "yes" : "no")
        state       \(simulation.isSleeping ? "asleep" : "running")
        """
    }
    #endif
}
