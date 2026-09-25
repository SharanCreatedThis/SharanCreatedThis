# Charm source-of-truth plan

_2026-09-26. Can `charm-registry.ts` be the definitive source? Verdict and migration._

## Verdict: no, not as built — and the reason matters

`src/lib/charms/charm-registry.ts` was generated from `website/public/charms/*.svg` and
`Collections.tsx`. Both are website artefacts. The registry therefore describes **the website's
picture of Hangly, which is wrong in both directions**: it contains 31 charms that do not ship and
omits 5 that do.

A source of truth derived from a source that is itself wrong is a well-formatted copy of the
error. The registry's integrity checks all pass, because they check the website against itself.

**The application is the source of truth. `CharmLibrary.json` is its expression.**

## What is right about the current registry

Worth keeping — the structure is sound, only its input is wrong:

- The honest-unknown contract: `null` where nothing is recorded, never a default
- Provenance fields distinguishing what was read from what was inferred
- The `licensed` flag gating page generation
- Four integrity checks wired into the build, each proved to fire

## The migration

### Step 1 — invert the dependency

The registry must be **generated from `apps/Hangly/Hangly/Assets/CharmLibrary.json`**, not from
website artwork. That file already carries, per charm: `id`, `name`, `region`, `category`,
`description`, `tags`, `previewImage`.

**This resolves the largest authoring blocker instantly.** The previous sprint concluded that 20
charms had no display name and that half a day of writing was required. That was true of the
website. `CharmLibrary.json` names all 49 — `Maneki-neko`, `Daruma`, `Nazar boncuğu`,
`Pánchángjié` — and gives each a description and a region.

**The names and descriptions already exist. They were never missing; they were in the app.**

### Step 2 — reconcile artwork, and report both directions

| Condition | Action |
| --- | --- |
| App charm with website artwork | Normal — 44 charms |
| App charm without website artwork | Report. The 5 Classic charms are procedural by design |
| Website artwork with no app charm | **Fail the build.** 31 today |

The third check is the one that would have caught this. It is the inverse of the existing "artwork
without a registry entry" check, and the existing check could not catch it because the artwork
*was* the registry's source.

### Step 3 — take categories from the app

Nine app categories replace the website's eleven invented collections. `CharmCollection` has four
cases; the site has eleven. Keep the app's model and let the website group for presentation if it
wants, derived rather than authored.

### Step 4 — seasonal data from `SeasonalPack.swift`

Pack membership and windows are in the app. Diwali's window is user-editable and its default
drifts — the registry should record that it is editable rather than record a date as fact.

### Step 5 — resolve the 31 orphans

A product decision, not an engineering one. For each of Breaking Bad, Stranger Things, Friends,
Football, Singers, Dream Catcher and Flash:

- **Ship them in the app**, or
- **Remove them from the website**, or
- **Mark them explicitly as unreleased** and stop counting them

Until then no charm count is safe. See `charm-count-verdict.md`.

### Step 6 — keep the guards, repoint them

The four integrity checks stay. Their reference point changes from the website's artwork directory
to the app's catalogue, and one new check is added for website-artwork-without-an-app-charm.

## Proposed shape

```
apps/Hangly/Hangly/Assets/CharmLibrary.json     SOURCE OF TRUTH (49)
apps/Hangly/Hangly/Models/SeasonalPack.swift    seasonal packs and windows
        ↓  scripts/generate-charm-registry.mjs
src/lib/charms/charm-registry.generated.ts      derived, never hand-edited
        +
src/lib/charms/charm-overrides.ts               website-only: sourceUrls, longform copy,
                                                page eligibility — the things the app has
                                                no opinion about
```

Splitting generated from authored is what keeps the registry honest: a regeneration cannot
silently drop an editor's research, and an editor cannot silently invent a charm.

## Effort

| Step | Effort |
| --- | --- |
| Generator reading `CharmLibrary.json` | 0.5 day |
| Reconciliation checks, both directions | 0.25 day |
| Seasonal import | 0.25 day |
| Overrides file and wiring | 0.25 day |
| **Total** | **~1.25 days** |

Against the previous plan's half-day of authoring plus 1.5 days of page work — and this version
produces a registry that describes the product rather than the website.

**The 31 orphans are the blocker, and they are a product decision rather than work.**
