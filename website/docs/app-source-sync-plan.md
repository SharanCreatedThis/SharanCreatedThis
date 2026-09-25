# `apps/Hangly` synchronisation plan and verification

_2026-09-26._

## Audit

`apps/Hangly/Hangly/Assets/CharmLibrary.json` against the catalogue extracted from
`Hangly-2.0.0.dmg`.

| | `apps/Hangly` | Shipped 2.0.0 | Delta |
| --- | --- | --- | --- |
| Charms | 49 | 81 | **−32** |
| Categories | 9 | 14 | **−5** |
| Charms present in repo but not shipped | 0 | — | — |
| Shared charms with different metadata | 7 | — | BTS placeholders |

**Missing charms (32):** `dreamCatcher`, `spiderManSwinging`, `rv`, `theWeeknd`, the five Football
Legends, the five remaining Music Legends, all six Friends, all six Stranger Things, and six of
the seven Breaking Bad.

**Missing categories (5):** `footballLegends`, `musicLegends`, `friends`, `breakingBad`,
`strangerThings`.

**Renamed since the snapshot (7):** `BTS Member 1`…`7` → `RM`, `Jin`, `SUGA`, `j-hope`, `Jimin`,
`V`, `Jungkook`. Descriptions and tags differ too — the snapshot has generic placeholder copy
where the shipped app has written biography.

`MARKETING_VERSION` reads `2.0` in both, which is what made the snapshot look current. It is the
version it was *heading for*, not the one that shipped.

## Options considered

### A — Update `apps/Hangly` to match the shipped build ❌ **Rejected**

The shipped `CharmLibrary.json` carries charm metadata — id, name, region, category, description,
tags, preview image. It does **not** carry the Swift side: `mass`, `radiusRatio`, `palette`,
`sound`, `beadCount`, `bodyRun`. The source comments record that palettes are *sampled from the
artwork* (`primary` is the mean of its most saturated tenth) and that bead counts differ per
collection because of how each charm is drawn.

Reconstructing 32 charms of Swift from the catalogue would mean inventing all of that. The result
would compile, look authoritative, sit in version control — and be wrong in ways nobody could see.
**That is precisely the failure this whole exercise is correcting**, reproduced deliberately.

Rejected on the grounds that a second plausible-looking wrong source is worse than an obviously
stale one.

### B — Archive or delete ❌ **Rejected**

The directory holds real, current, useful source: the physics, the seasonal coordinator, the
artwork splitter, the manifest resolver. Only the *catalogue* is stale; the *architecture* is not.

Moving or deleting it also risks displacing work whose canonical home is not established from
inside this repository. Reversible in git, but disruptive for no safety gain over option C.

### C — Mark as stale, and make the staleness measurable ✅ **Implemented**

Chosen because it removes the hazard without destroying anything and without fabricating
anything. The hazard is not that the files exist; it is that they read as authoritative.

## Implemented

| Change | Purpose |
| --- | --- |
| `apps/Hangly/STALE.md` | Full explanation beside the source: what is missing, why the warning exists, what to use instead, and why not to reconstruct it |
| `CLAUDE.md` (new, repo root) | The first file an agent reads. Leads with the stale-source warning and the general rule it came from |
| `README.md` | Hangly section annotated with the warning and the correct source |
| `scripts/check-app-source-freshness.mjs` | Measures the drift. Warns in `postbuild`; `npm run check:app-source` exits non-zero |

**No file under `apps/Hangly/` was modified.** Only `STALE.md` was added beside them. The Swift
sources, the catalogue and the project file are untouched, so nothing about building the app
changes.

## Why documentation alone was not enough

The audit that published "49 charms" never opened a README. A warning that depends on being read
protects nobody, so the drift is now measured on every website build:

```
  app source freshness  apps/Hangly vs shipped Hangly 2.0.0

    charms      repo  49   shipped  81
    categories  repo   9   shipped  14

  STALE — apps/Hangly does not match the shipped application
    32 charms missing from apps/Hangly: …
    7 charms renamed since the snapshot: BTS Member 3 → SUGA …
```

It warns and exits 0 during `postbuild`, because a stale copy of the app is not a reason to fail
a website build. `npm run check:app-source` runs the same check with `--strict` and exits 1.

It also self-retires: when `apps/Hangly` is refreshed, the check prints `in sync` and the warning
stops. Nobody has to remember to remove it.

## Verification

| Check | Result |
| --- | --- |
| `apps/Hangly/` source files modified | **0** |
| Freshness check, default | warns, exit 0 |
| Freshness check, `--strict` | exit 1 |
| Reports the correct app version | 2.0.0, read from `HANGLY_STATS` — the first version printed the website's `1.0.0`, now fixed |
| Handles a missing catalogue | exits 0 with "nothing to drift" |
| Full build | 35 pages, 70 JSON-LD blocks, 0 orphans, 0 errors, 0 warnings |
| Charm counts still correct | 81 charms, 14 categories, no hardcoded counts |
| Vision files touched | none |

## What remains for you

1. **Refresh `apps/Hangly` from the real application repository**, if one exists elsewhere. The
   freshness check will confirm it and go quiet.
2. **Or confirm this monorepo is the app's home**, in which case the 2.0.0 work was built
   somewhere else and should be committed here.

Either resolves it. Leaving it marked is safe in the meantime — which is the point of choosing
option C.
