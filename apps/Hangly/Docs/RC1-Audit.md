# RC1 audit

Measured on the **Production** configuration — the one the disk image ships —
on an Apple M2, 16 GB, macOS 26.6.2.

Two notes on method, because both changed the numbers:

- **Memory is `phys_footprint`**, which is what Activity Monitor's "Memory"
  column shows. `ps -o rss` counts shared framework pages and reads about three
  times higher: 74 MB where the footprint is 23 MB. Nothing here is RSS.
- **CPU is instantaneous**, sampled from `top`'s third one-second interval.
  `ps %cpu` is an average over the process's whole life and says nothing about
  what it is doing now.

CPU is expressed the way `top` expresses it: 100% is one core.

## CPU

| State | CPU |
| --- | --- |
| Settled, one charm | 0.6% |
| Settled, three charms | 0.7% |
| Settled, weather on | 0.6% |
| Five minutes idle | 0.6% |
| Swinging, one charm | 15.3% |
| Swinging, three charms | 18.5% |
| Library open | 0.9% |
| Create open | 0.6% |
| Appearance open | 0.7% |
| About open, live rope | 0.7% |

**Ropes sleep.** A swing costs 15–18% while it is moving and returns to 0.6%
within thirty seconds, and stays there: sampled at +15 s, +60 s, +120 s and
+240 s after the last interaction the readings were 0.6, 0.6, 0.6 and 0.9%.

An earlier run of this audit recorded 19.1% thirty seconds after closing a
window and it was a measurement fault, not a defect: the rope takes about
forty-four seconds to settle, so thirty seconds is inside the swing.

**Weather costs nothing at rest**, which confirms the effects are baked into the
bitmap that was already cached rather than computed per frame.

## Memory

| State | Footprint |
| --- | --- |
| Idle, one charm | 23 MB |
| Idle, three charms | 29 MB |
| Idle, weather on | 24 MB |
| Five minutes idle | 23 MB |
| Library open | 69 MB |
| Create open | 61 MB |
| Appearance open | 64 MB |
| About open | 63 MB |

**Idle does not leak.** 24 → 23 → 23 MB across five minutes, and the peak
footprint stays at its launch value of 37 MB.

### The one finding: the window's memory is never given back

> **Closed in 2.0**, in part. Customize is no longer a `Window` scene, and the
> artwork its pages rasterise is released when it closes: a visit costs 28 MB for
> the rest of the run rather than 37, flat. The remainder is not the caches and is
> not the app's to free. See [`RC2-Audit.md`](RC2-Audit.md) §2.


Opening Customize costs about **+45 MB, and closing it returns none of it**. An
isolated probe: 23 MB before, 49 MB with About open, 48 MB still held four
minutes after the window was closed.

It is bounded rather than unbounded — it is the cost of the pages you have
visited, and four open/close cycles moved it from 63 to 68 MB, not to 200 — but
a menu bar ornament that idles at 23 MB holding three times that because
somebody once opened a window is worth fixing.

**It is not the charm render caches.** That was the obvious suspect: browsing the
Library rasterises all twenty-seven charms at card size, and each `VectorImage`
keeps up to twenty-four rendered sizes. A purge of every off-rope charm's cache
on window close was written and measured, and it recovered **8 MB of the 50** —
and left the second open/close cycle slightly worse than before, because
reopening the Library then had to rasterise the collection again. It was
reverted. The cache limit itself was deliberately left alone: the source records
that doubling it once took the settled overlay from 33 MB to 108 MB.

What is left holding the memory is SwiftUI's `Window` scene, which hides its
window rather than destroying it and keeps the view tree and its backing store
alive for the next time. Anything that actually fixes this changes how the window
is presented, which is not an RC1 change.

## Stability

Walked on a wiped install of the Production build.

| Flow | Result |
| --- | --- |
| First launch | Welcome card appears |
| Onboarding → Explore Library | Card dismisses, Library opens |
| Library / Create / Appearance / About | All four render, no hangs |
| Analytics | Enabled by default, anonymous identifier minted on first send |
| Follow prompt | Appears on launch five, three buttons |
| Full-screen auto-hide | Overlay disappears under QuickTime full screen and returns when it quits |
| Crash reports | None, for any run in this pass |
| System log | No errors or faults from the process |

## App icon

Every slot macOS asks for is present at the right pixel dimensions — 16, 32,
128, 256 and 512, each at 1× and 2×, which is where the 64 px and 1024 px images
come from. The generator places the artwork on Apple's 824-of-1024 grid, so it
sits at the same visual size as its neighbours in the Dock.

> **Closed in 2.0.** The icon has two masters; see [`RC2-Audit.md`](RC2-Audit.md) §3.

**At 16 px and 32 px the icon is not legible.** The artwork is a scene — a charm
in front of a sunset window, with a skyline behind it — and a scene does not
reduce. At 16 px it is an indistinct blue and orange smear with no readable
subject; at 32 px the charm is just findable. From 64 px up it reads well.

The downscales themselves are clean: no ringing, no clipped alpha, no halo. This
is the artwork carrying more detail than sixteen pixels can hold, and 16 px is
where an icon appears most often — Finder list views, Spotlight, Get Info.

The fix is a second master for the small slots: the charm alone, much larger in
frame, on a plain ground, with the scene kept for 128 px and up. The generator
already writes each slot separately, so it can take two masters.
