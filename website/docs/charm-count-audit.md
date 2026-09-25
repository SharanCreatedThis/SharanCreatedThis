# Charm count audit

_2026-09-25. Resolves the flagged claim in `docs/content-verification-report.md`._

## The answer

**Hangly ships 75 charms.** Every one has complete artwork in both renderings — the plain
drawing and the connected one with the hanging thread ending at that charm's own loop.

```
75  charms with complete artwork          ← the number to quote
55  named across the 11 collections
20  seasonal and lucky charms, in no collection
56  surfaced anywhere on the website
```

The previous claim of **80+ was unsupported**. Nothing in the repository produced 80. It was
written by hand in commit `efe8c5e` and spread to 15 files, including comparison tables that
criticise competitors for not publishing a charm count.

## Every source traced

| Source | Count | What it actually measures |
| --- | --- | --- |
| `public/charms/*.svg` | 75 | Plain artwork, one file per charm |
| `public/charms/connected/*.svg` | 75 | Connected artwork, exact parity — no charm missing either |
| `src/components/hangly/Collections.tsx` | 55 | Charms named in the 11 collections on the product page |
| `src/data/charms.generated.ts` | 56 | Charms the site references: the 55 plus `daruma`, used by the demo |
| Seasonal / lucky set | 20 | Artwork ships, no collection names them |
| Hidden or internal charms | 0 | None found. Every SVG resolves to a real, complete charm |

The gap between 55 and 75 is the whole story. Counting the collections understated the library
by a quarter, because the seasonal and lucky charms belong to no collection — the app surfaces
them on its own as the year turns.

### The 20 charms the website never lists

Halloween — `bat`, `ghost`, `pumpkin`
Winter — `candyCane`, `snowflake`
Indian festival — `diya`, `ghanta`, `lotus`, `nimbuMirchi`, `panchangJie`, `firework`
Luck, several cultures — `horseshoe`, `luckyCoin`, `manekiNeko`, `scarab`, `daruma`, `himmeli`
Other — `bell`, `lantern`, `shazamLightning`

`shazamLightning` looks like it belongs in the DC collection and is probably an oversight rather
than a seasonal charm.

## A second stale claim, found while counting

**"Six collections lack their connected artwork" is no longer true.** Zero charms fall back to
the plain drawing — `charms.generated.ts` resolves all 56 references to connected art, and the
two directories have exact parity at 75 each. That work finished; the claim outlived it.

It appeared on `/products/hangly/roadmap`, in the Hangly FAQ, and in `ROADMAP.md`. The first two
are corrected. `ROADMAP.md` is repository documentation and is left for you.

## Single source of truth

`scripts/generate-stats.mjs` counts the artwork directories at build time and writes
`src/data/stats.generated.ts`:

```ts
CHARM_TOTAL            = 75   // quote this
CHARM_IN_COLLECTIONS   = 55
SEASONAL_COUNT         = 20
COLLECTION_COUNT       = 11
SEASONAL               = [...]  // the 20 names
```

A charm counts only when **both** renderings exist. That is deliberate: a charm with plain art
and no connected art cannot hang properly, so it is not a charm a user can have.

### A guard, because counting is only half the fix

The old figure survived months of edits because nothing checked it. `generate-stats.mjs` now
fails the build if `80+ charms`, `over eighty charms`, `eighty-plus charms` or a hardcoded
`value: '80+'` reappears anywhere under `src/`, excluding the verification register which
documents the old claim on purpose.

Verified by reintroducing the string: the build fails with the offending file named, and passes
again when reverted.

## Pages affected

Every page below previously stated or implied 80+. All now derive from `CHARM_TOTAL` or carry
prose matching it. Verified against the built HTML: **27 pages mention a charm count, and every
one says 75** — except the two that publish the breakdown deliberately.

| Page | Was | Now |
| --- | --- | --- |
| `/products/hangly` | `80+` stat tile | Derives `CHARM_TOTAL` |
| `/products/hangly/stats` | 55 + 75 unlabelled | 75 headline, 55 / 20 / 11 broken out |
| `/products/hangly/roadmap` | stale unfinished-collections section | Seasonal-set section, corrected |
| `/products` | "eighty-plus charms" | "seventy-five charms: 55 across 11 collections, plus 20 seasonal" |
| `/contact` | "over eighty charms" | Same corrected phrasing |
| `/faq` | "over eighty designs" | "seventy-five designs" |
| `/compare/*` (8 pages) | 44 occurrences across the data | "seventy-five charms across eleven collections and a seasonal set" |
| `/guides/*` (8 pages) | 19 occurrences | Same |
| `sitemap` / meta description | "80+ charms across 11 collections" | "75 charms across 11 collections" |
| Schema `SoftwareApplication` | "Over eighty charms" | "Seventy-five charms across eleven collections and a seasonal set" |

**Files changed:** 15 source files, 66 individual replacements.

## Recommendation

Give the seasonal set a home on the product page — a twelfth collection, or a labelled section
beneath the eleven. It is the cheapest remaining content work on the site and it is the only
change that makes the published count and the installed count the same number. Until then the
product page lists 55 of the 75 charms a user actually gets, which undersells the product to
exactly the visitor who is comparing charm libraries.

`shazamLightning` should probably move into the DC collection at the same time.
