# Remaining count references

_2026-09-26. Every number still adjacent to the word "charm" anywhere in source or output, and
why each is correct._

## In the built output

| Phrase | Pages | Status |
| --- | --- | --- |
| `81 charms` | 36 | **Correct** — exact figure, from `HANGLY_STATS.charmCount` |
| `eighty-one charms` | 17 | **Correct** — same figure, spelled, in prose data files |
| `eighty-one designs` | 3 | **Correct** — same figure, different noun |
| `80+ charms` | 1 | **Correct** — hero tile, `marketingCharmCount`, rounds down |
| `11 charms` | 1 | **Correct** — seasonal charms, `seasonalCharmCount` |
| `22 charms` | 4 | **Correct** — Book My Luck's published catalogue, a competitor |
| `75` (artwork) | 1 | **Correct** — labelled "website artwork files", 75 of the 81 |

**No stale product claim remains.** `49`, `55`, `69`, `100+` appear nowhere as a Hangly count.

## In source, outside `HANGLY_STATS`

Five files are on the validator's allow-list, each for a stated reason:

| File | Why allowed |
| --- | --- |
| `src/lib/stats/hangly.ts` | The source of truth itself |
| `src/data/hangly/charm-library.shipped.json` | Extracted from the shipped app; the thing the constants are checked against |
| `src/data/stats.generated.ts` | Generated from the catalogue at build time |
| `src/lib/charms/charm-registry.ts` | Generated |
| `src/lib/verification/claims.ts` | Documents the historical wrong claims deliberately |

## Two figures that are not the charm count and should not be conflated

**Website artwork: 75.** The site carries SVGs for 75 of the 81 charms. Five Classic charms
(`circle`/Bead, `star`, `heart`, `diamond`, `camera`) are drawn in code rather than from vectors,
and `spiderManSwinging` and `theWeeknd` have not been copied across. One extra file, `flash.svg`,
is artwork for a charm that is not in the catalogue.

This is a real gap worth closing, and it is not a count error — the stats page states it
explicitly and labels it.

**Website collections: 11.** `Collections.tsx` groups charms into 11 collections; the shipped
catalogue has 14 categories. The site now publishes 14 everywhere. The component's own grouping
has not been restructured, which is a separate piece of work.

## Known follow-ups

| # | Item | Impact |
| --- | --- | --- |
| 1 | Copy artwork for `spiderManSwinging` and `theWeeknd` to the website | 75 → 77 |
| 2 | Decide whether Classic charms need website artwork | Would take it to 82 |
| 3 | Remove `flash.svg`, which matches no charm | Cleanup |
| 4 | Restructure `Collections.tsx` to the app's 14 categories | Consistency |
| 5 | `apps/Hangly/` is stale and two days behind the shipped build | **A trap for the next audit** |

Item 5 is the one that matters beyond this task. The in-repo app source caused a wrong count to
be published with confidence. Either refresh it or mark it clearly as an archived snapshot.
