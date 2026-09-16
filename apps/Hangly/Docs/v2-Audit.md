# Hangly 2.0 — Phase 0 audit

Written against `f1c5909`, before any 2.0 code. No code has been changed.

The purpose is to establish what exists, then say what a rope style system would
disturb. Three findings at the bottom change the shape of the Phase 1 design and
should be settled before implementation starts.

---

## 1. Architecture

MVVM with an explicit composition root. 12,700 lines of Swift across the app,
3,100 in tests. No third-party dependencies.

| Layer | Files | Lines | What it holds |
|---|---|---|---|
| `Models` | 20 | 1,842 | Pure value types: settings, charms, placement, snapshots. No AppKit |
| `Physics` | 10 | 1,322 | The rope solver, its configuration, beads, the cord curve, the clock |
| `Services` | 17 | 2,102 | Windows, persistence, audio, import, login item |
| `Views` | 24 | 3,549 | Overlay, Library, Studio, Settings |
| `Utilities` | 11 | 1,254 | Vector rendering, bitmaps, logging, small extensions |
| `MenuBar` | 4 | 339 | The status item and its menu |
| `App` | 3 | 275 | Entry point, delegate, `AppEnvironment` |

`AppEnvironment` builds every service once and hands them down; nothing reaches for
a global. Everything user-facing is `@MainActor`, and the project builds under
Swift 6 with `SWIFT_STRICT_CONCURRENCY: complete`.

The overlay is not a SwiftUI scene. It is an AppKit `NSPanel` owned by
`OverlayWindowController`, because a borderless, non-activating, click-through
window pinned above other apps cannot be expressed as a `Window` scene.

## 2. Physics engine

`RopeSimulation` — Verlet integration with position-based distance constraints.

Step order, and it is deliberate: pin the anchor, integrate, drive the held node,
relax constraints, clamp stretch, refresh the cord, advance beads.

| Parameter | Value | Notes |
|---|---|---|
| `segmentCount` | 20 | 21 nodes |
| `segmentLength` | fitted | `0.69 × canvas height ÷ 20` ≈ 14.5 pt |
| `gravity` | 2000 pt/s² | Applied as a positional delta |
| `damping` | 0.999 | Fraction of displacement carried forward |
| `constraintIterations` | 256 | Adaptive; exits at `convergenceTolerance` 0.05 |
| `stretchPasses` | 256 | One-sided clamp, adaptive |
| `maxStretchRatio` | 1.02 | Hard ceiling |
| `fixedTimeStep` | 1/240 s | Decoupled from the display |
| `framesBeforeSleep` | 60 | At `restSpeed` 4 pt/s |
| Cost | 0.02 ms/frame | ~0.3% of a 120 Hz budget |

Mass lives in two places. Free rope nodes have `inverseMass` 1; the anchor has 0,
which is how it stays pinned without a special case; the charm has
`1 / CharmMetrics.mass`. Beads add their weight onto the two nodes they hang
between, applied when the beads are set rather than per step.

`RopeSimulation+Beads` is a one-way dependency: it reads the rope and writes only
beads, so no bead behaviour can perturb the solver.

**Determinism.** The solver is a pure function of configuration plus input. No
randomness, no wall-clock reads, fixed timestep. `RopeSimulationTests` asserts two
120 Hz frames equal one 60 Hz frame exactly.

## 3. Rope rendering

`RopeCanvasView.drawRope`, a single `Canvas`. No filters anywhere — blur and shadow
filters rasterise an offscreen layer per frame, which was measured at tens of
megabytes and a large share of a core, and were removed in 1.0.

The cord is five stacked strokes of one path:

1. two offset low-alpha strokes for its shadow, at 2.6× and 1.5× width
2. the cord itself, under a linear gradient from anchor to charm
3. two dashed strokes offset either side for the twist
4. a hairline highlight along the lit edge

Geometry comes from `RopeCurve`, which flattens the same quadratic spline the beads
are threaded on, so what is drawn and what beads ride cannot drift apart.

Every visual constant is presently **hardcoded in the view**:

| Constant | Value | Line |
|---|---|---|
| Width | `charmRadius × 0.046` | `RopeCanvasView:123` |
| Colour | `charm.cordTint ?? charm.palette` (removed in Phase 1; now `RopeAppearance.palette`) | `:58-66` |
| Twist pitch | `width × 1.5` | `drawCordTwist` |
| Twist offset | `width × 0.20` | `drawCordTwist` |

## 4. Charm rendering

`CharmRenderer` draws three kinds of artwork through one lighting model: vector
geometry, imported bitmaps, and SVG regions. SVG charms rasterise at the display's
real pixel density, cached per size and appearance, with sizes quantised to 32 px
so a growing charm reuses one bitmap. Drop shadows are pre-rendered once per size
rather than filtered per frame.

## 5. Settings

`AppSettings` → `OverlaySettings`, one `@Observable` `SettingsStore`, persisted as
JSON in `UserDefaults` under a versioned key. Every write goes through one setter,
so autosave cannot be forgotten.

`OverlaySettings` holds ten fields today. Decoding is deliberately tolerant: a
missing key falls back to the default, an out-of-range number is clamped, and an
unrecognised enum raw value degrades to the default via `try?` rather than
discarding the whole document. **This is what makes adding a field safe.**

## 6. Menu

`MenuBarExtra(.menu)`, so SwiftUI produces a real `NSMenu`. One submenu
(`Charm`) built from `CharmManager.menuItems`, then Library, Studio, Import,
Delete, Settings, Quit. A rope style submenu has an exact precedent to copy.

## 7. Tests

168 tests in 16 suites. `swiftlint --strict` clean. CI runs lint, a Debug build,
the suite, and a Production build on `macos-15`.

| Suite | Tests | Relevance to Phase 1 |
|---|---|---|
| `RopeSimulationTests` | 22 | **High** — the behavioural contract |
| `RopeBeadTests` | 10 | **High** — beads read cord geometry |
| `CharmTests` | 19 | Medium — charm metrics feed the solver |
| `SettingsCodingTests` | 7 | **High** — defaults and tolerant decoding |
| `SettingsStoreTests` | 7 | Medium — persistence and first run |
| Others | 103 | Low |

Most rope assertions are written against `rope.configuration.X` rather than against
literals, so they follow a changed configuration rather than breaking on it. Two
exceptions pin absolutes: `segmentCount == 20`, and `dampingSettlesTheRope`, which
requires damping below 1.

## 8. Performance baseline

Production build, Apple Silicon, macOS 26. These are the numbers 2.0 must not
regress.

| State | CPU | Memory |
|---|---|---|
| Settled | 0.56–0.60% of one core | 26 MB |
| Rope moving | ~15% of one core | 33 MB |
| Launch → on screen | ~210 ms | — |
| Solver | 0.02 ms/frame | — |

The settled figure is the one that matters. Nothing redraws when nothing moves.
Of the moving figure, roughly two thirds is compositing a transparent window at the
display rate rather than anything in the simulation.

---

## Three findings that change the Phase 1 design

### A. A per-style rope mass will do nothing visible

The brief asks each style to define a mass, with Gold Chain "heavier". In this
solver that will not work the way it reads.

Gravity is applied as a positional delta, `gravity × dt²`, identical for every
node regardless of mass. Damping scales displacement, also mass-independent. And a
distance constraint splits its correction in proportion to the two nodes' inverse
masses — so for a rope↔rope link, where both nodes carry the same mass, the split
is 50/50 **whatever that mass is**.

Scaling every rope node's mass therefore changes exactly one thing: the ratio at
the single rope↔charm link, which slightly alters how much the charm's weight
pulls the last segment around. Real, but nothing anyone would call "heavier".

What does make a chain feel heavy, in this engine:

- **Damping** — lower carry, settles sooner, resists being flung
- **Segment length and count** — a coarser, shorter chain swings differently
- **The rope-to-charm mass ratio** — worth exposing as a ratio, not an absolute
- **`maxStretchRatio`** — a chain should be closer to inextensible than a thread

Recommendation: keep `mass` in the style as a *ratio against the charm*, and get
the felt weight from damping and the stretch ceiling. Phase 1 should include a test
that measures settle time and swing period per style and asserts they actually
differ — otherwise the feature ships as five names for one rope.

### B. Every collection charm already owns the cord's colour

All eleven collection charms return a gold `cordTint`, deliberately, so the
simulated cord continues the cord drawn inside their own artwork. The charm's
artwork *begins* with a gold cord and beads at the top.

So "Silver Chain" with a Daruma means a silver rope running into a gold drawn
cord and gold beads. Three options, and this is a product decision rather than a
technical one:

1. **Style wins.** Simple, and visibly wrong on the eleven collection charms.
2. **Charm wins for colour, style controls everything else** — thickness, twist,
   links, glow. Coherent, but Gold and Silver Chain then look identical on those
   charms.
3. **Style wins, and the artwork's own cord is trimmed** — the splitter already
   finds where the cord ends, so the beads could be dropped for chain styles.
   Truest result, most work, and it changes what the charms look like.

I would build (2) for the classics and (3) behind a per-charm opt-out, but this
needs your call before I write it.

### C. Neon's glow cannot use a filter

The render path has a standing rule against blur and shadow filters, for measured
reasons. A neon glow must come from stacked wide low-alpha strokes or a cached
gradient, not `.addFilter(.shadow)` or `.blur`. That is achievable and cheap — the
ambient glow behind the charm already works this way — but it constrains how the
style is expressed, and it is why "no excessive GPU usage" is not automatic.

---

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Style resets on window resize | **High** | Rope reverts silently | `resize()` calls `RopeConfiguration.fitted(to:)`, which rebuilds from `.default`. Style must flow through `fitted`, and a test must resize and re-assert |
| Style change mid-flight destabilises the rope | Medium | Visible snap | Charm metrics already interpolate on change; do the same, or apply on the next rest |
| Existing physics tests break | Medium | CI red | Thread must be byte-identical to today's defaults, and be the shipped default |
| Beads read stale cord geometry | Medium | Beads drift off the cord | Beads derive from `RopeCurve`, which derives from the same config; covered if style flows through configuration rather than being applied at draw time |
| Neon costs GPU | Medium | Idle budget blown | Measure idle and moving CPU per style before merging |
| Settled cost rises | Low | Breaks the 0.6% budget | Style is static per frame; no new per-frame work if colours are resolved once |
| Old settings documents | **Low** | — | Tolerant decoding already handles an unknown or missing style |

## Files affected

**Modified — 9:**

| File | Change |
|---|---|
| `Models/OverlaySettings.swift` | New `ropeStyle` field, default `.thread`, tolerant decode |
| `Physics/RopeConfiguration.swift` | `fitted(to:style:)`; style-driven damping, stretch, mass ratio |
| `Physics/RopeSimulation.swift` | Hold the style; `resize` must preserve it |
| `Models/RopeSnapshot.swift` | Carry the style so the renderer can draw it |
| `Physics/RopeSimulation+Snapshot.swift` | Publish it |
| `Views/Overlay/RopeCanvasView.swift` | Width, colour, twist and glow from the style |
| `MenuBar/MenuBarView.swift` | A Rope Style submenu |
| `MenuBar/MenuBarViewModel.swift` | Selection and binding |
| `Docs/Physics.md`, `Docs/Architecture.md`, `README.md`, `CHANGELOG.md` | Documentation |

**New — 3:**

| File | Purpose |
|---|---|
| `Models/RopeStyle.swift` | The enum, its physical and visual parameters |
| `Views/Overlay/RopeStyleRenderer.swift` | Per-style stroke recipes, kept out of the canvas |
| `Tests/RopeStyleTests.swift` | Parameters, persistence, determinism, and that styles measurably differ |

## Migration plan

1. **`RopeStyle` as data.** The enum plus its parameters, with Thread's values
   copied exactly from today's constants. Tests assert Thread equals the current
   defaults. Nothing else changes; the whole suite must still pass.
2. **Configuration.** Thread the style through `RopeConfiguration.fitted(to:style:)`
   and `RopeSimulation`. Verify `resize()` preserves it. Physics tests still pass
   because the default is Thread.
3. **Rendering.** Move the four hardcoded visual constants into the style, then add
   the four new appearances. Measure idle and moving CPU per style.
4. **Settings and menu.** The field, the submenu, live switching. Old documents
   decode unchanged.
5. **Behavioural tests.** Settle time and swing period per style, to prove the
   styles differ. Determinism re-checked per style.
6. **Documentation and release.** `Docs/Physics.md`, README, CHANGELOG, version.

Each phase compiles and passes the full suite before the next begins.

## Open questions — answered

1. **Finding B, the cord-colour conflict.** Option 3: the style wins for the rope
   and the beads, and no charm forces its own cord colour. `cordTint` is gone from
   the `Charm` protocol and from the collection catalogue; its gold palette is now
   Thread's, so the shipped look is unchanged. The artwork needed no trimming in the
   end — the splitter already draws only the beads and the body, never the drawn
   cord above them — so the beads were the only part left to reconcile, and they are
   recoloured to the style's metal.
2. **Switching mid-swing.** Physics apply on the next step; the look interpolates
   over 250 ms. The rope is never paused, reset or waited for.
3. **Menu or Settings.** Menu. Charm selection is menu-only too, and Settings holds
   no other content control, so this follows the app's existing line.
4. **A charm pinning a style.** No — answered by (1). A user choosing a rope style
   is choosing what the rope is made of, and a charm may not overrule them.

---

## Phase 1 outcome

Delivered as planned, in the six steps above.

- `RopeStyle` carries a `RopePhysicsProfile` and a `RopeAppearance`; Thread's profile
  is asserted equal to `RopeConfiguration.default`.
- `RopeConfiguration.applying(_:)` is idempotent and order-independent, and
  `fitted(to:style:)` takes the style so a resize cannot reset it.
- `RopeStyleRenderer` draws all five with ordinary strokes — no filter anywhere.
- `RopeStyleTransition` owns the 250 ms cross-fade as a testable value type.
- **Finding A held.** Weight is carried by `gravityScale`, `damping`, the stretch
  ceiling and the charm-mass ratio, not by the rope's own node masses.
  `RopeStyleBehaviourTests` swings all five and measures the difference.
- 187 tests in 26 suites pass; SwiftLint is clean in strict mode.
