# Working in this repository

## The one thing that has caused real damage

**`apps/Hangly/` is a stale snapshot. It is not the shipped product.**

It was imported on 2026-09-17; Hangly 2.0.0 shipped on 2026-09-19. It is missing 32 charms and
5 categories, and its BTS charms are placeholders (`BTS Member 3` rather than `SUGA`).

An audit read it, concluded the app had 49 charms, and published that in six documents. The real
figure is 81. Thirty-one shipping charms were reported as "never built". See
`apps/Hangly/STALE.md`.

### For any question about what the product contains

Use the shipped binary, or the catalogue extracted from it:

```
website/src/data/hangly/charm-library.shipped.json     ← extracted from Hangly-2.0.0.dmg
website/src/lib/stats/hangly.ts                        ← HANGLY_STATS, the only place a count is written
```

Verify at any time:

```
cd website && npm run check:app-source     # is apps/Hangly still stale?
cd website && npm run charms:validate      # do the published counts match the shipped app?
```

## General rule this came from

**Count the artefact users install, not the one that is convenient to read.**

The charm count was published wrong three times: `80+` written by hand, `75` counted from
`website/public/charms/*.svg`, and `49` counted from `apps/Hangly/`. Each was reported
confidently. Each counted something adjacent to the product.

## Protected infrastructure — never modify

| Path | Why |
| --- | --- |
| `website/public/products/hangly/appcast.xml` | Compiled into every installed copy as `SUFeedURL` |
| `website/public/products/vision/appcast.xml` | Same, for Vision. Note: **www**, not apex |
| `website/public/products/vision/Vision-1.1.dmg` | Served to the Sparkle updater |
| `website/public/products/vision/release-notes.html` | Rendered inside the update dialog |
| `website/public/_redirects` — the `/products/*/download` rules | Published everywhere; must resolve to the newest build |

Vision is under active development and is currently out of scope for website work.

## Build validation

`npm run build` runs, in order: charm manifest, content date, download redirects, changelog,
stats, charm registry validation, charm count validation, IndexNow key — then the build, then
`check-seo` and `seo-validate`.

A failing validator is the system working. Do not route around one.
