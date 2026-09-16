# Changelog

All notable changes to Hangly are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-09-14

The rope release. 1.0 hung one charm on one cord, and had three windows to change
it in. 2.0 makes the charm, the cord and the number of them a choice, brings a
season that arrives on its own, and replaces the three windows with one.

### Added

- **Rope styles.** The charm can hang on one of five cords — Thread, Leather, Gold
  Chain, Silver Chain or Neon — chosen from **Rope** in the menu bar and remembered
  between launches. Each is a different rope, not a different colour: Gold Chain
  swings slowly and heavily, Leather is stiff and settles fast, Neon is the lightest
  and quickest. Changing style applies on the next simulation step, mid-swing, with
  no reset and no loss of momentum; the cord's look cross-fades over 250 ms.
- The beads threaded above a charm take the style's metal, so a silver chain does
  not carry gold beads.
- **One, two or three charms on the same rope.** They hang in a line down a single
  cord — it is still one twenty-segment rope, with each charm centred on a node of
  it — and each contributes its own weight, so a loaded rope hangs straighter and
  swings slower. Set the number and pick each charm from **Charms** in the menu bar
  or in the Library; the choice is remembered.
- Charms cannot pass through one another. A hard throw folds the rope and used to
  bring two charms eighty points into each other; a minimum-distance constraint now
  solved alongside the links leaves that at nothing.
- Each charm's beads hang above that charm and stay in its stretch of cord.
- **Seasonal packs.** Eleven new charms in four sets — Halloween (bat, ghost,
  pumpkin), Diwali (lotus, lantern, diya), Christmas (snowflake, candy cane, bell)
  and New Year (firework, lucky coin). They hang, swing, split into beads and take
  the weather exactly as the collection does, and they are in the Library with
  descriptions, tags and favourites like everything else.
- **A season dresses the rope on its own**, and puts back what was there when it
  ends — including across a relaunch, and including when one season hands over to
  the next. Choose a charm yourself and the season gives way for the rest of the
  year. Off, or pinned to any pack, in **Season** in the menu bar. Diwali's dates
  are editable, because they move with the lunar calendar.
- **The rope keeps the time.** It holds a swing about a fifth longer in the morning
  than at night and starts a little wider; the afternoon is the rope exactly as it
  shipped. Gravity, length and stiffness are untouched, so the period and the shape
  of the swing never change — only how long the motion lasts. Automatic by default,
  switching at five, noon and six; pick an hour by hand in **Rope → Time of Day**.
  Measured: Thread settles in 44.4s, 37.1s and 28.8s across the three.
- **Weather, if you want it.** The charm can take on the sky: warmer in sun,
  drained under cloud, wet in rain, frosted in snow, charged in a storm. The
  effects work on the shading the artwork already carries rather than being laid
  over it, so a charm stays recognisably itself — and they are baked into the
  bitmap that was already cached, so they cost nothing per frame. **Off by
  default.** Turn it on in **Weather** in the menu bar or in **Appearance**, and
  pick a condition by hand there too.
- Weather comes from [Open-Meteo](https://open-meteo.com): no account, no API key,
  no SDK and no entitlement, so it works in any build anyone makes of this
  repository. It asks about the city named by your system time zone, or one you
  type; macOS is never asked where you are, and coordinates are rounded to about a
  kilometre before being sent or stored. Updated every half hour, cached between
  launches, and it keeps wearing the last reading when the network is gone.
- **A welcome card on the first launch**, once, saying what the app is and offering
  the Library. It is never shown again.
- **Anonymous usage sharing**, on by default and a single switch in **About**.
  Which features get used, on which version of macOS. Never a charm, a picture, a
  file or anything typed. Turning it off deletes the identifier.
- **Hangly can take itself off the screen while a film plays full screen** and come
  back when it ends. Off by default; turn it on in **Appearance**.
- A card on the fifth launch asking, once, whether you would like to follow the
  person who makes this.

### Changed

- **One window instead of three.** A tabbed Settings, a Charm Library and an AI
  Studio became **Customize**, with four pages in a sidebar: Library, Create,
  Appearance and About. Everything that was in the three is in the one, and the
  menu bar mirrors it rather than owning anything of its own.
- The cord's colour now comes from the rope style rather than from the charm. A
  charm no longer has any say in what it hangs on.
- **The app icon has two masters.** The 16, 32 and 64 pixel slots are the nazar
  alone, filling the frame on a plain ground; 128 and up keep the scene. A scene
  does not reduce, and 16 px — Finder list views, Spotlight, Get Info — is where an
  icon appears most often.

### Fixed

- **Closing Customize gives back what it can.** The window used to be a SwiftUI
  `Window` scene, which hides rather than closes and keeps its view tree, its
  hosting view and its backing store; with the artwork its pages had rasterised,
  that left about 37 MB resident behind a closed window in an app that idles at 23.
  Customize is now an `NSWindow` that releases its content on close, and the
  Library, About and Create bitmaps are released with it — the rope's own artwork
  is tagged and kept, so nothing re-renders on the next frame. Measured, a visit
  now settles at 52 MB rather than 61. The remainder is not the caches and does not
  come back: see `Docs/RC2-Audit.md` §2.
- The app loaded every charm's artwork at launch whether or not anything drew it,
  because building the charm registry asked each one whether its asset existed and
  asking opens the file. Artwork is now opened when it is first drawn: settled
  memory went from 70 MB to **25 MB**, which is below where it was before the
  seasonal charms were added.
- Menu options are buttons rather than picker rows. Three times during development a
  setting was found changed to the last option of a menu nobody had clicked in; it
  was never reproducible and may have been the accessibility scripting used to
  inspect the menus, but a button has no selection to write back.

### Removed

- The separate Charm Library and Settings windows, and the plumbing that opened
  them. Both were unreachable once Customize replaced them.

## [1.0.0] — 2026-09-12

First public release.

### The app

- **A charm hangs from your menu bar on a simulated rope.** Twenty segments,
  twenty-one nodes, anchored at the top and weighted at the charm.
- **Menu bar only.** No Dock icon, no main window. The overlay is transparent,
  click-through everywhere except the charm, and floats above other apps.
- **Settings** for overlay visibility, size, opacity, position, offsets,
  click-through, Spaces behaviour, sound and launch at login.

### Physics

- Verlet integration with Gauss-Seidel distance-constraint relaxation.
- Fixed 240 Hz timestep, so behaviour is identical at 60 Hz, 120 Hz and
  ProMotion's variable rates.
- Inextensible: no link exceeds 1.02× its rest length under any reachable input.
- Grab, drag and throw, with momentum preserved on release.
- Beads above each charm simulated as their own particles — they ride the cord,
  keep their spacing, and slide as the rope moves.
- Sleeps after 60 still frames and stops drawing entirely.

### Charms

- Eleven collection charms drawn as SVG: Nazar boncuğu, Hamsa, Nimbu-mirchi,
  Ghanta, Drishti bommai, Pánchángjié, Daruma, Maneki-neko, Horseshoe, Scarab
  and Himmeli.
- Five geometric classics: Bead, Camera, Star, Heart and Diamond.
- Each with its own mass, size, sound and palette, feeding straight into the
  solver — a heavy bell hangs steeper than a straw himmeli.
- Artwork rendered from vector at the display's real pixel density and cached
  per size.
- Charm and beads separated by measuring the artwork rather than editing it.

### Charm Library and Studio

- Browsable library with search, categories, favourites, live previews and
  one-click switching.
- Import any PNG, JPEG, WebP or HEIC by dropping it on the charm or opening the
  Studio. Background removal via Vision's foreground segmentation, with a flood
  fill fallback for flat backgrounds.
- Staged import with subject detection, method choice, live preview on a rope,
  and undo.

### Craft

- Synthesized per-material sounds — bell, metal, glass, wood, soft — with a
  volume control. Nothing plays unless you moved something.
- Reduce Motion honoured live. VoiceOver labels and full keyboard access.
- Recovery from corrupt settings, corrupt manifests and missing charm files.
- 0.6% of one core and 26 MB when settled.

### Known limitations

- **Not signed with an Apple Developer ID.** macOS will refuse the first launch;
  right-click → Open once to get past it.
- **Apple Silicon only.** Intel Macs are not supported.
- **macOS 14 or later.**
- The rope debug overlay exists in Debug and Release builds only.
- On macOS 26, large icon sizes are drawn inside the system's icon container,
  which double-frames an icon that has its own rounded background.

[2.0.0]: https://github.com/sharancreatedthis/Hangly/releases/tag/v2.0.0
[1.0.0]: https://github.com/sharancreatedthis/Hangly/releases/tag/v1.0.0
