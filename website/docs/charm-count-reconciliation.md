# Charm count reconciliation

_2026-09-26._

## The table

| Source | Count | What it counts |
| --- | --- | --- |
| **Actual runtime** | **49** | Charms reachable in the app's picker |
| `CharmLibrary.json` | **49** | Catalogue entries |
| `CharmKind.swift` | **49** | Enum cases — an identical set to the JSON |
| App release notes v2.0.0 | **49** | "Twenty-seven charms" (16 + 11) + 22 in four collections |
| Actual artwork — app | **44 SVG + 5 procedural** | `Assets/Charms` plus five Swift-drawn charms |
| Actual artwork — website | **75** | `website/public/charms/*.svg` |
| `Collections.tsx` | **55** | Charms listed across 11 collections |
| `charm-registry.ts` | **75** | Generated from website artwork |
| Marketing copy | **75** | Stated on 20 pages |
| Appcast 2.0.0 notes | **unquantified** | Names 4 charms, 3 of which do not exist |

## Every discrepancy explained

### 49 vs 75 — the marketing gap

The website counts its own artwork directory. The app counts its catalogue. **Thirty-one website
SVGs have no charm behind them**: Breaking Bad (7), Stranger Things (6), Friends (6), Football
(5), Singers (5), Dream Catcher (1), Flash (1).

The artwork is real — 32 KB to 297 KB per file, comparable to shipping charms. It was drawn and
placed on the website but never wired into the application.

**The site's "75 charms" is not an overstatement of 5. It overstates by 26**, because it counts
31 charms that do not ship and misses 5 that do.

### 55 vs 49 — the collection gap

`Collections.tsx` lists 55 charms across 11 collections. Only **24** exist in the app. The
website's collection model was never the app's: the app has four collections, the website has
eleven.

### 44 vs 49 — the procedural five

`circle` (Bead), `star`, `heart`, `diamond` and `camera` are drawn in Swift, not from SVG. They
are fully available and have no artwork file by design. The website has no representation of them
at all.

### 24 vs 55 — what overlaps

Of the website's 55 listed charms, 24 exist in the app: Protection (3), Tamil Divine (5), Marvel
(5), DC (4 of 5 — the site lists Flash, the app has Shazam Lightning), BTS (7).

### The appcast

The 2.0 appcast names a dream catcher joining a "world collection", the RV joining "Breaking
Bad", The Weeknd joining "Music Legends", and a second Spider-Man pose. **None exists in the
application**, and the app's own `v2.0.0.md` mentions none of them.

Two documents describe the same release differently. The appcast is the one users see in the
updater. It was not modified — it is protected infrastructure — and this is reported rather than
fixed.

## Reconciled arithmetic

```
App catalogue                                     49
  hand-drawn cultural (protection/luck/ritual)     11
  classic, drawn in Swift                           5
  seasonal                                         11
  four collections (Marvel/DC/Tamil/BTS)           22

Website artwork                                   75
  matching an app charm                            44
  no app charm behind it                           31

App charms with no website artwork                  5
```

**44 charms exist in both. 31 exist only on the website. 5 exist only in the app.**
