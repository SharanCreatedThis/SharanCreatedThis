# ⚠️ This source is STALE — do not treat it as the shipped product

**Last synchronised with a build: never.** These files were imported into the monorepo on
2026-09-17. Hangly 2.0.0 was built and released on 2026-09-19, and this directory does not
contain those changes.

## What is out of date

| | This directory | Shipped Hangly 2.0.0 |
| --- | --- | --- |
| Charms | **49** | **81** |
| Categories | **9** | **14** |
| BTS charm names | `BTS Member 1`…`7` | `Jin`, `SUGA`, `j-hope`, `RM`, `Jimin`, `V`, `Jungkook` |

**32 charms are missing** — the whole of Breaking Bad, Stranger Things, Friends, Football
Legends and Music Legends, plus `dreamCatcher`, `rv`, `spiderManSwinging` and `theWeeknd`.

**Five categories are missing:** `breakingBad`, `strangerThings`, `friends`, `footballLegends`,
`musicLegends`.

## Why this warning exists

In September 2026 an audit of the website's charm count read this directory, concluded the
product contained 49 charms, and published that conclusion in six documents. It was wrong by 32
charms. On the strength of it, work was halted and thirty-one real, shipping charms were
described as "marketed but never built".

The source looked authoritative. It is version-controlled, it is internally consistent, it sits
in a directory called `apps/Hangly`, and `MARKETING_VERSION` reads `2.0` — which is true of the
release it predates. Nothing about it announced that it was a snapshot.

## What to use instead

**The shipped binary is the source of truth for anything a user can see.**

```
website/public/products/hangly/releases/Hangly-2.0.0.dmg
  └── Hangly.app/Contents/Resources/CharmLibrary.json     ← the catalogue the app loads
```

A copy is committed for convenience, and every published figure derives from it:

```
website/src/data/hangly/charm-library.shipped.json
website/src/lib/stats/hangly.ts                            ← HANGLY_STATS
```

To check this directory against the shipped build:

```
cd website && npm run check:app-source
```

## What this directory is still good for

Reading how the app works — the physics, the seasonal coordinator, the artwork splitter, the
architecture. The *design* is current even where the *catalogue* is not. It is a poor source for
any question of the form "how many" or "which ones".

## Before deleting or refreshing this

Do not overwrite it with reconstructed source. The shipped `CharmLibrary.json` carries charm
metadata but not the Swift-side physics — mass, radius ratio, palette, bead count — which are
sampled from artwork per charm. Regenerating those from the catalogue would produce a second
authoritative-looking wrong source, which is the failure this file exists to prevent.

Refresh it from the real application repository, or leave it marked.
