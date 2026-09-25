# Charm runtime verification

_2026-09-26. Traced through the Hangly 2.0 source at `apps/Hangly/`._

## The loading path

```
CharmLibrary.json                 49 entries — id, name, region, category, description, tags
        ↓ CharmLibrary.bundled(in:)
CharmLibrary.entries              [CharmLibraryEntry], keyed by CharmKind
        ↓ entry(for: CharmKind)
CharmLibraryViewModel             the picker's model
        ↓
CharmLibraryView / CharmLibraryGrid / CharmFilterChips / TagCloud
```

Physics and artwork come from a parallel path — `CollectionCharmCatalog.swift` for the hand-drawn
SVG charms, `CollectionPackCatalog.swift` for Marvel/DC/Tamil Spiritual/BTS, `SeasonalCharmCatalog.swift`
for the eleven seasonal ones, and five Swift files for the Classic set, which are drawn
procedurally rather than from SVG.

`CharmKind` is the join key throughout. Its 49 cases and `CharmLibrary.json`'s 49 ids are an
**identical set** — verified by comparison, not by counting.

## What appears in the UI

**All 49 charms.** `CharmLibraryViewModel` reads `CharmLibrary.entries` with no filtering by
availability, entitlement or flag. There is no gating mechanism in the catalogue — no `hidden`,
`beta`, `experimental`, `locked` or `unlockable` field exists on `CharmLibraryEntry` or in the
JSON.

## What appears in the Charm Picker

**All 49.** The grid renders the library entries; `CharmFilterChips` and `TagCloud` narrow the
view by category and tag, and narrowing a view is not gating access.

## What appears in Collections

**22 charms, in four collections.** `CharmCollection` is an enum with exactly four cases:

```
marvel · dc · tamilSpiritual · bts
```

`CollectionPackCatalog.swift` describes them as *"Marvel, DC, Tamil Spiritual and BTS"*. The
remaining 27 charms — Protection, Luck & Fortune, Ritual & Home, Classic, Seasonal — are
categories in the library rather than collections.

**The website's eleven collections do not exist in the application.** Seven of them — Football,
Stranger Things, Friends, Breaking Bad, Singers, Dream Catcher, and the "Flash" entry in DC —
have no counterpart in `CharmCollection`, `CharmKind` or `CharmLibrary.json`.

## What appears only via special unlocks

**Nothing.** There is no unlock, purchase, entitlement, achievement or code path that gates a
charm. Every one of the 49 is reachable from the picker on first launch.

## What ships but is never reachable

**Nothing in the app.** All 49 catalogue entries resolve to a `CharmKind` and appear in the
library.

One robustness note: `SVGCharm.vector` is documented as `nil` *"when the asset is missing; the
charm then draws a placeholder bead so the rope is never bare, and the omission is reported at
launch."* So a missing asset degrades visibly and is logged rather than crashing — but no charm
is currently in that state.

**On the website, 31 SVGs ship and are unreachable as product** — they have no app charm behind
them.

## The seasonal rule — the one behaviour that changes what a user sees

`SeasonalCoordinator` puts a season's charms on the rope when the date arrives and puts back what
was there afterwards. Three properties from the source:

1. **It restores.** What was on the rope is written to settings before a pack takes over, and it
   survives a reboot because it is stored rather than held in memory.
2. **It yields.** If the user picks something else while a season is running, the rope is no
   longer "dressed as" that pack — nothing will be put back over their choice later, and nothing
   will be taken away again that year.
3. **It can be switched off or pinned.** `SeasonalSettings` carries `isAutomatic` and `pinned`.

It checks hourly, because *"a season begins at midnight and lasts weeks; an hour of lateness on a
charm is not a defect."*

**Seasonal charms are not restricted.** They are selectable by hand from the picker at any time
of year. The coordinator changes what is *on the rope by default*, not what is *available*.

## Summary

| Question | Answer | Evidence |
| --- | --- | --- |
| Appears in UI | 49 | `CharmLibrary.entries`, unfiltered |
| Appears in picker | 49 | `CharmLibraryGrid` over the same entries |
| Appears in Collections | 22 in 4 collections | `CharmCollection` enum, 4 cases |
| Behind unlocks | 0 | No gating field or code path exists |
| Ships but unreachable (app) | 0 | Every entry resolves to a `CharmKind` |
| Ships but unreachable (website) | 31 SVGs | No app charm behind them |
| Automatically applied | 11 seasonal, by date | `SeasonalCoordinator` |
