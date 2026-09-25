# Files modified — charm count alignment

_2026-09-26. `git diff --stat` against the previous commit._

```
 package.json                               |    4 +-
 scripts/generate-stats.mjs                 |   41 +-
 scripts/validate-charm-counts.mjs          |  144 +++
 src/app/(hub)/contact/page.tsx             |    2 +-
 src/app/(hub)/products/page.tsx            |    4 +-
 src/app/install/page.tsx                   |    2 +-
 src/app/products/hangly/roadmap/page.tsx   |    1 +
 src/app/products/hangly/stats/page.tsx     |   77 +-
 src/components/hangly/Stats.tsx            |    7 +-
 src/data/hangly-faq.ts                     |   10 +-
 src/data/hangly/charm-library.shipped.json | 1232 ++++++++++++++++++++
 src/data/stats.generated.ts                |   88 +-
 src/lib/charms/charm-registry.ts           |    4 +-
 src/lib/charms/queries.ts                  |    2 +-
 src/lib/charms/routes.ts                   |    2 +-
 src/lib/comparisons/comparison-data.ts     |   76 +-
 .../guides/content/best-desktop-pets-for-mac.ts    |    2 +-
 .../guides/content/best-mac-customization-apps.ts  |    2 +-
 .../guides/content/desktop-goose-alternatives.ts   |    2 +-
 src/lib/guides/entries.ts                  |    6 +-
 src/lib/guides/guide-data.ts               |   30 +-
 src/lib/guides/guide-page.tsx              |    2 +-
 src/lib/schema/entities.ts                 |    5 +-
 src/lib/seo.ts                             |    3 +-
 src/lib/stats/hangly.ts                    |   74 ++
 25 files changed, 1690 insertions(+), 132 deletions(-)
```

## New files

| File | Purpose |
| --- | --- |
| `src/lib/stats/hangly.ts` | Central stats source. The only place a count may be written |
| `src/data/hangly/charm-library.shipped.json` | Catalogue extracted from Hangly-2.0.0.dmg. Makes 81 verifiable |
| `scripts/validate-charm-counts.mjs` | Build validator, three checks, wired into `prebuild` |
| `docs/charm-count-audit.md` | This audit |

## Modified, by replacement count

| File | Replacements |
| --- | --- |
| `scripts/validate-charm-counts.mjs` | +144 / -0 |
| `src/data/stats.generated.ts` | +83 / -5 |
| `src/app/products/hangly/stats/page.tsx` | +39 / -38 |
| `src/lib/comparisons/comparison-data.ts` | +38 / -38 |
| `scripts/generate-stats.mjs` | +33 / -8 |
| `src/lib/guides/guide-data.ts` | +15 / -15 |
| `src/data/hangly-faq.ts` | +5 / -5 |
| `src/components/hangly/Stats.tsx` | +4 / -3 |
| `src/lib/guides/entries.ts` | +3 / -3 |
| `src/lib/schema/entities.ts` | +3 / -2 |
| `src/app/(hub)/products/page.tsx` | +2 / -2 |
| `src/lib/charms/charm-registry.ts` | +2 / -2 |
| `src/lib/seo.ts` | +2 / -1 |
| `src/app/(hub)/contact/page.tsx` | +1 / -1 |
| `src/app/install/page.tsx` | +1 / -1 |
| `src/app/products/hangly/roadmap/page.tsx` | +1 / -0 |
| `src/lib/charms/queries.ts` | +1 / -1 |
| `src/lib/charms/routes.ts` | +1 / -1 |
| `src/lib/guides/content/best-desktop-pets-for-mac.ts` | +1 / -1 |
| `src/lib/guides/content/best-mac-customization-apps.ts` | +1 / -1 |
| `src/lib/guides/content/desktop-goose-alternatives.ts` | +1 / -1 |
| `src/lib/guides/guide-page.tsx` | +1 / -1 |
