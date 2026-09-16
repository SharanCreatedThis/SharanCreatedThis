//
//  RopeStyle.swift
//  Hangly
//
//  The nine cords a charm can hang on.
//

import Foundation

/// What the rope is made of.
///
/// A style is the whole answer to "what is this charm hanging on": how the cord is
/// drawn, how thick it is, what colour it is, and — the part that makes it more than
/// a skin — how it swings. Choosing one is choosing a feel, not a texture.
///
/// Pure data on purpose. The solver reads ``physics`` and the renderer reads
/// ``appearance``; neither knows the enum exists beyond the value it was handed, so a
/// new style is a table entry rather than a change to either. The four added for the
/// collections were exactly that: four rows here and nothing else.
enum RopeStyle: String, CaseIterable, Codable, Sendable, Identifiable {
    /// The twisted gold thread Hangly has always hung its charms on.
    case thread

    /// A flat braided cord: stiffer than thread, and quicker to settle.
    case leather

    /// Linked gold. The heaviest of the five, and the slowest to swing.
    case goldChain

    /// Linked silver: a chain's weight with a little more life in it.
    case silverChain

    /// A lit filament. The lightest and the most responsive.
    case neon

    /// White silk. The thinnest cord, and the one that barely gives at all.
    case spiderThread

    /// A dark cord that swallows the light around it.
    case midnightCord

    /// Hand-twisted cotton in saffron and vermilion, the way a temple thread is tied.
    case templeThread

    /// Polished silver satin. A cord where ``silverChain`` is links.
    case silverCord

    var id: String { rawValue }

    /// Shown in the menu.
    var displayName: String {
        switch self {
        case .thread: "Thread"
        case .leather: "Leather"
        case .goldChain: "Gold Chain"
        case .silverChain: "Silver Chain"
        case .neon: "Neon"
        case .spiderThread: "Spider Thread"
        case .midnightCord: "Midnight Cord"
        case .templeThread: "Temple Thread"
        case .silverCord: "Silver Cord"
        }
    }

    /// What it is and how it behaves, for the Library.
    ///
    /// Both halves matter: a style is a look *and* a feel, and someone choosing one
    /// from a picture of a cord has been told only half of it.
    var summary: String {
        switch self {
        case .thread: "Twisted gold. The cord Hangly has always used — light, quick, and quiet."
        case .leather: "A flat braid. Stiffer than thread, and settles a little sooner."
        case .goldChain: "Linked gold. The heaviest of the five, and the slowest to swing."
        case .silverChain: "Linked silver. A chain's weight with a little more life in it."
        case .neon: "A lit filament. The lightest cord and the most responsive."
        case .spiderThread: "Spun silk. The thinnest cord of all, and stronger than anything its weight."
        case .midnightCord: "A dark braid. Heavy, quiet, and slow to give a swing up."
        case .templeThread: "Twisted cotton in saffron and vermilion. Soft, and it has some give."
        case .silverCord: "Woven silver. A chain's shine with a cord's quickness."
        }
    }

    /// The menu's icon for this style.
    var symbolName: String {
        switch self {
        case .thread: "line.diagonal"
        case .leather: "scribble"
        case .goldChain: "link"
        case .silverChain: "link.circle"
        case .neon: "bolt.fill"
        case .spiderThread: "circle.hexagongrid"
        case .midnightCord: "moon.fill"
        case .templeThread: "flame"
        case .silverCord: "line.3.horizontal"
        }
    }

    /// The shipped default, and the behaviour every build before rope styles had.
    /// The baseline. Thread is exactly `RopeConfiguration.default`, which is why
    /// every physics comparison is made against it and why this is not the same
    /// thing as the style a new install hangs.
    static let `default` = RopeStyle.thread

    /// What Hangly ships hanging. The same cord as the baseline, for now — kept as
    /// its own name because "the rope a new install gets" and "the rope the physics
    /// is measured against" are two questions that happen to share an answer.
    static let shipped = RopeStyle.thread
}

// MARK: - Physics

/// How a style swings.
///
/// Every field here is a multiplier on, or a replacement for, a value the solver
/// already had. None of them is a new force, a spring, or a second integrator: the
/// rope stays the same twenty-segment Verlet chain, solved the same way, so a style
/// cannot make it unstable and cannot make it non-deterministic.
///
/// **Why there is no mass here.** The obvious way to make a gold chain feel heavy is
/// to give the rope's nodes more mass, and in this solver that does close to nothing.
/// Gravity is applied as a positional delta of `gravity × dt²`, which is
/// mass-independent; damping scales a displacement, which is mass-independent; and a
/// distance constraint splits its correction by the *ratio* of the two nodes' inverse
/// masses, which is unchanged when every node is scaled together. Multiplying every
/// rope node's mass by four is very nearly the identity function.
///
/// So weight is expressed the way it is actually perceived instead: a heavy thing
/// accelerates slowly, swings with a long period, and keeps going. That is
/// ``gravityScale`` and ``damping``. Stiffness — how much the cord gives when the
/// charm is thrown — is ``maxStretchRatio`` and the pass budgets. And the one place a
/// literal mass does still change the picture is the single link between the last
/// rope node and the charm, because there the ratio genuinely differs: that is
/// ``charmMassScale``.
struct RopePhysicsProfile: Equatable, Sendable {
    /// Multiplier on ``RopeConfiguration/gravity``.
    ///
    /// The only knob in a pendulum that changes its period: the period goes as
    /// `1 / sqrt(gravityScale)`, so a chain at 0.72 swings about 18% slower than
    /// thread, and reaches the bottom of each swing that much later. It does not
    /// change where the rope hangs at rest — straight down is straight down at any
    /// gravity — so a style change never moves the charm, only how it travels.
    var gravityScale: Double

    /// Replaces ``RopeConfiguration/damping``. Applied per fixed step at 240 Hz, so
    /// small differences compound quickly: 0.999 keeps 79% of a swing's motion over a
    /// second where 0.9955 keeps 34%.
    var damping: Double

    /// Replaces ``RopeConfiguration/maxStretchRatio``. A chain is inextensible and a
    /// thread is not.
    var maxStretchRatio: Double

    /// Replaces ``RopeConfiguration/constraintIterations``. A cap rather than a fixed
    /// cost — relaxation exits as soon as it converges — so a stiffer style pays for
    /// its extra passes only on the frames that actually need them.
    var constraintIterations: Int

    /// Replaces ``RopeConfiguration/stretchPasses``. Tracks the iteration budget: a
    /// tighter stretch ceiling takes more sweeps to satisfy.
    var stretchPasses: Int

    /// Multiplier on the charm's mass, which sets the inverse-mass ratio of the one
    /// link that has a ratio worth changing. Above one the charm holds its line and
    /// the rope bends around it; below one the charm is flicked about by the cord.
    var charmMassScale: Double
}

extension RopeStyle {
    /// The solver values for this style.
    var physics: RopePhysicsProfile {
        switch self {
        case .thread:
            // Exactly `RopeConfiguration.default`. Thread is not a style so much as
            // the name for what the rope already did, and `RopeStyleTests` asserts
            // these five numbers against the defaults so they cannot drift apart.
            RopePhysicsProfile(
                gravityScale: 1.0,
                damping: 0.999,
                maxStretchRatio: 1.02,
                constraintIterations: 256,
                stretchPasses: 256,
                charmMassScale: 1.0
            )
        case .leather:
            // Stiffer and quicker to settle: a braided cord has real internal
            // friction, and barely stretches at all.
            RopePhysicsProfile(
                gravityScale: 1.08,
                damping: 0.9955,
                maxStretchRatio: 1.006,
                constraintIterations: 288,
                stretchPasses: 288,
                charmMassScale: 1.05
            )
        case .goldChain:
            // The heavy one. Slow to start, slow to turn round, slow to give up.
            RopePhysicsProfile(
                gravityScale: 0.72,
                damping: 0.9992,
                maxStretchRatio: 1.004,
                constraintIterations: 320,
                stretchPasses: 320,
                charmMassScale: 1.40
            )
        case .silverChain:
            // A chain, but a lighter gauge: the same character with more life in it.
            RopePhysicsProfile(
                gravityScale: 0.84,
                damping: 0.9988,
                maxStretchRatio: 1.005,
                constraintIterations: 320,
                stretchPasses: 320,
                charmMassScale: 1.25
            )
        case .neon:
            // Barely there. Quickest to react, quickest to swing, and the only style
            // with any give in it.
            RopePhysicsProfile(
                gravityScale: 1.22,
                damping: 0.9997,
                maxStretchRatio: 1.03,
                constraintIterations: 224,
                stretchPasses: 224,
                charmMassScale: 0.78
            )
        case .spiderThread:
            // Silk: a fraction of the weight of anything else here and stronger than
            // all of it. Quick like neon, but where neon is elastic this barely gives
            // at all — the tightest stretch ceiling of the nine.
            //
            // 1.004 and not 1.003: at 1.003 a hard throw measured 1.00313, because
            // the clamp is one-sided and adaptive and cannot land exactly on a
            // ceiling that tight within any pass budget worth paying for. Gold chain
            // sits at the same number for the same reason.
            RopePhysicsProfile(
                gravityScale: 1.16,
                damping: 0.9996,
                maxStretchRatio: 1.004,
                constraintIterations: 336,
                stretchPasses: 336,
                charmMassScale: 0.80
            )
        case .midnightCord:
            // Between the two chains in weight, and the most damped thing here after
            // leather: a heavy braid absorbs a swing rather than carrying it.
            RopePhysicsProfile(
                gravityScale: 0.78,
                damping: 0.9986,
                maxStretchRatio: 1.007,
                constraintIterations: 304,
                stretchPasses: 304,
                charmMassScale: 1.32
            )
        case .templeThread:
            // Cotton, hand-twisted and a little loose. The softest cord here: it has
            // the most give of the nine and it settles in its own time.
            RopePhysicsProfile(
                gravityScale: 1.04,
                damping: 0.9982,
                maxStretchRatio: 1.026,
                constraintIterations: 232,
                stretchPasses: 232,
                charmMassScale: 0.92
            )
        case .silverCord:
            // A woven cord rather than a linked chain, and it behaves like one:
            // `silverChain`'s weight less a third of it, and quicker on the turn.
            RopePhysicsProfile(
                gravityScale: 0.94,
                damping: 0.9990,
                maxStretchRatio: 1.009,
                constraintIterations: 272,
                stretchPasses: 272,
                charmMassScale: 1.08
            )
        }
    }
}

// MARK: - Appearance

/// How the length of cord between two bends is drawn.
///
/// Every case is a dash pattern or a stroke count, measured along the path the cord
/// already has, because dashes follow a bend for free and cost one more stroke rather
/// than one more offscreen layer. Nothing here is a filter; see ``RopeStyleRenderer``.
enum RopeTexture: Equatable, Sendable {
    /// Two offset dashed passes, lit on one side and shaded on the other, which reads
    /// as a spiral rather than as rungs. Lengths are multiples of the cord's width.
    case twist(pitch: Double, offset: Double)

    /// Wider, flatter bands with a visible edge: a braid rather than a twist.
    case braid(pitch: Double, offset: Double)

    /// Discrete links, drawn as a heavy dash with a lit rim and a dark gap.
    case links(pitch: Double, thickness: Double)

    /// No texture at all — the cord is one unbroken line.
    case smooth
}

/// How a style is drawn.
struct RopeAppearance: Equatable, Sendable {
    /// The cord's colours. Four stops, dark to light, used for the body gradient, the
    /// texture's lit and shaded sides, and the highlight.
    var palette: CharmPalette

    /// Cord width as a fraction of the charm's radius, so a cord stays in proportion
    /// when the overlay is rescaled.
    var widthScale: Double

    /// Floor on the drawn width, in points. Below about a point and a half a stroke
    /// stops reading as a cord and starts reading as a hairline.
    var minimumWidth: Double

    /// What is drawn along it.
    var texture: RopeTexture

    /// Strength of the halo drawn around the cord, zero for everything but neon.
    /// Built from three progressively wider, progressively fainter strokes of the
    /// same path — a real glow filter rasterises an offscreen layer every frame, and
    /// this renderer exists to avoid exactly that.
    var glowStrength: Double

    /// What the beads threaded on the cord are recoloured to, or `nil` to draw the
    /// charm's artwork exactly as it was drawn.
    ///
    /// `nil` for thread and gold chain because the artwork's beads are already that
    /// gold, and a recolour of a colour it already is can only lose detail. The other
    /// three would otherwise hang gold beads on a silver, brown or cyan cord.
    var beadTint: CharmPalette?
}

extension RopeAppearance {
    /// Blends the continuous parts of two appearances.
    ///
    /// Colour, thickness and glow are numbers and are averaged. ``texture`` and
    /// ``beadTint`` are not: a twist cannot be half a chain, and a bead is either
    /// recoloured or it is not. Those two come from the destination, and the
    /// renderer cross-fades them per layer instead — see ``RopeStyleLayer``.
    static func interpolate(from start: RopeAppearance, to end: RopeAppearance, progress: Double) -> RopeAppearance {
        let amount = progress.clamped(to: 0...1)
        func mix(_ first: Double, _ second: Double) -> Double {
            first + ((second - first) * amount)
        }
        return RopeAppearance(
            palette: .interpolate(from: start.palette, to: end.palette, progress: amount),
            widthScale: mix(start.widthScale, end.widthScale),
            minimumWidth: mix(start.minimumWidth, end.minimumWidth),
            texture: end.texture,
            glowStrength: mix(start.glowStrength, end.glowStrength),
            beadTint: end.beadTint
        )
    }
}

extension RopeStyle {
    /// The drawing values for this style.
    var appearance: RopeAppearance {
        switch self {
        case .thread:
            RopeAppearance(
                palette: Self.threadPalette,
                widthScale: 0.046,
                minimumWidth: 1.5,
                texture: .twist(pitch: 1.5, offset: 0.20),
                glowStrength: 0,
                beadTint: nil
            )
        case .leather:
            RopeAppearance(
                palette: Self.leatherPalette,
                widthScale: 0.058,
                minimumWidth: 1.7,
                texture: .braid(pitch: 2.3, offset: 0.26),
                glowStrength: 0,
                beadTint: Self.leatherPalette
            )
        case .goldChain:
            RopeAppearance(
                palette: Self.goldPalette,
                widthScale: 0.088,
                minimumWidth: 2.2,
                texture: .links(pitch: 2.05, thickness: 0.62),
                glowStrength: 0,
                beadTint: nil
            )
        case .silverChain:
            RopeAppearance(
                palette: Self.silverPalette,
                widthScale: 0.082,
                minimumWidth: 2.1,
                texture: .links(pitch: 1.95, thickness: 0.60),
                glowStrength: 0,
                beadTint: Self.silverPalette
            )
        case .neon:
            RopeAppearance(
                palette: Self.neonPalette,
                widthScale: 0.040,
                minimumWidth: 1.4,
                texture: .smooth,
                glowStrength: 1.0,
                beadTint: Self.neonPalette
            )
        case .spiderThread:
            RopeAppearance(
                palette: Self.silkPalette,
                // Thinner than anything else, including neon: silk is the one cord
                // whose whole character is that you can hardly see it. The floor
                // matters more here than the scale — at a small charm size this is
                // what stops it disappearing.
                widthScale: 0.034,
                minimumWidth: 1.4,
                // A braid, finely pitched: the woven texture of spun silk, which is
                // what a twist at this width cannot render without looking dashed.
                texture: .braid(pitch: 1.35, offset: 0.14),
                // Not a glow in neon's sense — a quarter of one. Three faint wide
                // strokes under a white cord read as light caught along it, and they
                // are also what keeps a white cord visible against a white window.
                glowStrength: 0.26,
                beadTint: Self.silkPalette
            )
        case .midnightCord:
            RopeAppearance(
                palette: Self.midnightPalette,
                widthScale: 0.068,
                minimumWidth: 1.9,
                texture: .braid(pitch: 2.1, offset: 0.24),
                glowStrength: 0,
                beadTint: Self.midnightPalette
            )
        case .templeThread:
            RopeAppearance(
                palette: Self.templePalette,
                widthScale: 0.052,
                minimumWidth: 1.6,
                // Coarser than thread's twist: cotton rolled on the palm, not drawn.
                texture: .twist(pitch: 1.15, offset: 0.26),
                glowStrength: 0,
                beadTint: Self.templePalette
            )
        case .silverCord:
            RopeAppearance(
                palette: Self.silverCordPalette,
                widthScale: 0.054,
                minimumWidth: 1.7,
                texture: .twist(pitch: 1.35, offset: 0.22),
                glowStrength: 0,
                beadTint: Self.silverCordPalette
            )
        }
    }

    /// The antique burnished gold the collection was drawn on: dark enough to read as
    /// cord against a bright desktop rather than as a drawn line. This is the exact
    /// palette that used to live on the charms themselves as `cordTint`, moved here
    /// because a cord's colour belongs to the cord.
    private static let threadPalette = CharmPalette(
        primary: CharmColor(0.47, 0.34, 0.11),
        secondary: CharmColor(0.31, 0.22, 0.06),
        deep: CharmColor(0.16, 0.11, 0.03),
        light: CharmColor(0.78, 0.62, 0.30)
    )

    private static let leatherPalette = CharmPalette(
        primary: CharmColor(0.36, 0.22, 0.13),
        secondary: CharmColor(0.25, 0.15, 0.08),
        deep: CharmColor(0.11, 0.06, 0.03),
        light: CharmColor(0.63, 0.45, 0.30)
    )

    private static let goldPalette = CharmPalette(
        primary: CharmColor(0.72, 0.55, 0.19),
        secondary: CharmColor(0.50, 0.36, 0.10),
        deep: CharmColor(0.24, 0.16, 0.04),
        light: CharmColor(0.97, 0.86, 0.53)
    )

    private static let silverPalette = CharmPalette(
        primary: CharmColor(0.69, 0.72, 0.77),
        secondary: CharmColor(0.47, 0.50, 0.55),
        deep: CharmColor(0.21, 0.23, 0.27),
        light: CharmColor(0.97, 0.98, 1.00)
    )

    private static let neonPalette = CharmPalette(
        primary: CharmColor(0.29, 0.92, 1.00),
        secondary: CharmColor(0.16, 0.60, 0.95),
        deep: CharmColor(0.05, 0.16, 0.40),
        light: CharmColor(0.88, 1.00, 1.00)
    )

    /// White silk, and the one palette here that had to be designed against the
    /// background rather than against the other cords.
    ///
    /// A white cord on a white window is nothing, and Hangly draws over whatever the
    /// user's desktop happens to be. So `deep` is a real slate rather than a pale
    /// grey — it is what the two offset shadow strokes under the cord are drawn in,
    /// and those are what give a white cord an edge on a light ground. `primary` and
    /// `light` keep it unmistakably white on a dark one.
    private static let silkPalette = CharmPalette(
        primary: CharmColor(0.94, 0.95, 0.97),
        secondary: CharmColor(0.74, 0.77, 0.82),
        deep: CharmColor(0.33, 0.36, 0.42),
        light: CharmColor(1.00, 1.00, 1.00)
    )

    private static let midnightPalette = CharmPalette(
        primary: CharmColor(0.16, 0.18, 0.29),
        secondary: CharmColor(0.09, 0.10, 0.18),
        deep: CharmColor(0.03, 0.03, 0.07),
        light: CharmColor(0.42, 0.46, 0.62)
    )

    private static let templePalette = CharmPalette(
        primary: CharmColor(0.87, 0.51, 0.09),
        secondary: CharmColor(0.66, 0.20, 0.07),
        deep: CharmColor(0.29, 0.07, 0.03),
        light: CharmColor(1.00, 0.82, 0.38)
    )

    /// Brighter and cooler than ``silverChain``'s, so the two read as different
    /// materials rather than as the same metal at two thicknesses.
    private static let silverCordPalette = CharmPalette(
        primary: CharmColor(0.80, 0.83, 0.88),
        secondary: CharmColor(0.58, 0.62, 0.69),
        deep: CharmColor(0.26, 0.28, 0.33),
        light: CharmColor(1.00, 1.00, 1.00)
    )
}
