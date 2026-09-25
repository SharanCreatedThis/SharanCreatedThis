# Charm count audit

_2026-09-26. Source of truth: the shipped `Hangly-2.0.0.dmg`._

## The number

**81 charms across 14 categories.**

Read from `Contents/Resources/CharmLibrary.json` inside the shipped disk image
(`CFBundleShortVersionString 2.0.0`, `CFBundleVersion 200`) — the catalogue the running
application loads. The file is now committed at
`src/data/hangly/charm-library.shipped.json` so the figure is verifiable rather than asserted.

| Category | Charms | | Category | Charms |
| --- | --- | --- | --- | --- |
| Protection | 6 | | Marvel | 6 |
| Luck & Fortune | 4 | | DC | 5 |
| Ritual & Home | 2 | | Tamil Spiritual | 5 |
| Classic | 5 | | BTS | 7 |
| Seasonal | 11 | | Football Legends | 5 |
| | | | Music Legends | 6 |
| | | | Friends | 6 |
| | | | Breaking Bad | 7 |
| | | | Stranger Things | 6 |

## Why the number was wrong three times

| Published | Counted | Why it was wrong |
| --- | --- | --- |
| **80+** | nothing | Written by hand. Accidentally close — the real figure is 81 |
| **75** | `website/public/charms/*.svg` | Counted website artwork, not the product. The site carries art for 75 of the 81 |
| **49** | `apps/Hangly/Hangly/Assets/CharmLibrary.json` | That source is dated 2026-09-17, two days before the 2.0 build, and is missing 32 charms |

Each correction was reported confidently and each counted something adjacent to the product. The
common failure was never checking the artefact users actually install.

A related error followed from the same source: 31 charms were reported as "marketed but not
shipped". They all ship. The website uses generic ids (`breakingBad1`, `football25`, `singer20`)
where the app uses real names (`walterWhite`, `ronaldoJersey`, `billieEilish`) — an id-naming
mismatch read as missing product.

## Messaging

| Surface | Figure | Source |
| --- | --- | --- |
| Hero, promotional copy | **80+ charms** | `HANGLY_STATS.marketingCharmCount` |
| Schema, datasets, stats, comparisons, FAQ | **81 charms across 14 categories** | `HANGLY_STATS.charmCount` |
| Growth messaging, where it appears | "81 charms today, with 100+ planned" | `HANGLY_COPY.growth` |

`100+` is not used as a current product claim anywhere.

## Central source

`src/lib/stats/hangly.ts` exports `HANGLY_STATS`, `HANGLY_CATEGORIES`, `SHIPPED_CHARMS` and
`HANGLY_COPY`. Nothing else may state a count.

## Validator

`scripts/validate-charm-counts.mjs`, wired into `prebuild`. Three checks:

1. **`HANGLY_STATS` must match the shipped catalogue.** Editing the constant without the product
   changing fails the build.
2. **`marketingCharmCount` may round down, never up.** `"100+"` against a product of 81 fails.
3. **No stale count anywhere**, and **no numeric count in a component or page** — those must
   import. Prose in the comparison, guide and FAQ data files may spell the figure out, because
   check 1 already guarantees it is current and a comparison table reads better as words than as
   interpolation.

All five failure modes were verified by introducing each fault:

```
"75 charms across 11 collections"  ✗ stale count
"100+ charms"                      ✗ numeric count in a component
"80+ charms"                       ✗ numeric count in a component
"Over eighty charms"               ✗ stale count
charmCount: 120                    ✗ disagrees with the shipped catalogue (81)
marketingCharmCount: "100+"        ✗ overstates the product, which ships 81
```

The first version of check 3 exempted any line *containing* a `HANGLY_*` reference, so a
hardcoded `100+ charms` added beside a legitimate interpolation passed. It now strips the
references and checks what remains. The version before that required the number to sit beside the
word "charms", which is how `80+ across eleven collections` stayed live in production through a
sweep reported as clean.

## Remaining count references — all intentional

| Figure | Where | Why it is correct |
| --- | --- | --- |
| **75** | `/products/hangly/stats` | Website artwork files, explicitly labelled as such — 75 of the 81 |
| **55** | none in output | Removed |
| **22 charms** | 4 comparison pages | Book My Luck's catalogue, a competitor figure |
| **11 charms** | stats page | Seasonal charms, correct |
| **80+** | 1 page | The hero tile, from `marketingCharmCount` |

## Verified in the built output

```
81 charms          36 pages
eighty-one charms  17 pages
eighty-one designs  3 pages
80+ charms          1 page   (hero)
```

No stale product claim appears anywhere in `out/`.
