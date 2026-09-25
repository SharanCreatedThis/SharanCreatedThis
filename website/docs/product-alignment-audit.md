# Product alignment audit

_2026-09-26. Every website claim measured against the shipped Hangly 2.0 application._

**Ground truth: the app contains 49 charms** — `CharmLibrary.json` (49 entries) and
`CharmKind.swift` (49 cases), identical sets. See `docs/charm-ground-truth-audit.md`.

**No code was modified.**

---

## Summary

| Category | Discrepancies |
| --- | --- |
| **Fix immediately** | 9 |
| **Needs product decision** | 3 |
| **Future feature — label as upcoming** | 1 |
| **Remove** | 4 |
| **Total** | **17** |

Two systemic findings sit behind most of them:

1. **31 charms are marketed and do not ship.** Breaking Bad (7), Stranger Things (6), Friends
   (6), Football (5), Singers (5), Dream Catcher (1), Flash (1).
2. **Production is seven commits behind local.** `origin/main` is `61b6895`; local is `9ea135a`.
   Everything the previous sprint fixed — the 80+ → 75 correction, the FAQ de-duplication — is
   **not live**. Production still says "80+".

---

## D1 — "80+" is live in production, in text and in schema

| | |
| --- | --- |
| **File** | `src/data/hangly-faq.ts:103` |
| **Claim** | *"80+ across eleven collections, including … BTS, Stranger Things, Friends, Breaking Bad, football and a dream catcher. Six of those collections are still being finished."* |
| **Source** | Hand-written, commit `efe8c5e` |
| **Actual** | 49 charms, 9 categories. Stranger Things, Friends, Breaking Bad, football and the dream catcher **do not exist in the app** |
| **Live** | Yes — `https://www.sharancreatedthis.in/faq`, in visible text **and inside the FAQPage schema** |
| **Action** | Rewrite to 49 and the app's real categories |
| **Category** | **Fix immediately** |

This single answer contains four separate inaccuracies: an unsupported count, five phantom
collections, and a claim that six collections are "still being finished" when they are not
started in the app.

## D2 — three further "80+" claims my previous sweep missed

| File | Line | Claim |
| --- | --- | --- |
| `src/lib/comparisons/comparison-data.ts` | 757 | "Hangly ships **80+** ready-made charms" |
| `src/lib/comparisons/comparison-data.ts` | 802 | "**Over eighty** ready-made charms across eleven collections" |
| `src/data/hangly-faq.ts` | 103 | "**80+** across eleven collections" |

**Source:** the same commit. **Actual:** 49.
**Action:** correct. **Category: Fix immediately.**

**And the guard I built does not catch them.** `generate-stats.mjs` tests
`/80\+\s*charms|\bover\s+eighty\s+charms|…/` — all three phrasings put words between the number
and "charms", or omit "charms" entirely. The guard proved it fires on `80+ charms` and gave
false confidence for everything else. It needs a looser pattern: any `80+` or `eighty` within a
short distance of "charm".

## D3 — "75 charms" across 20 pages

| | |
| --- | --- |
| **Files** | `lib/seo.ts:181`, `lib/schema/entities.ts:169,179`, `lib/comparisons/comparison-data.ts` (×14), `lib/guides/*` (×8), `data/hangly-faq.ts:179,262`, `app/(hub)/products/page.tsx:44`, `app/(hub)/contact/page.tsx:172`, `components/hangly/Stats.tsx:6`, `app/products/hangly/roadmap/page.tsx` (×4) |
| **Claim** | "75 charms across 11 collections", "seventy-five charms", `CHARM_TOTAL` |
| **Source** | `scripts/generate-stats.mjs`, counting `website/public/charms/*.svg` |
| **Actual** | 49. The 75 counts 31 SVGs with no app charm and omits 5 procedural charms that ship |
| **Live** | **No** — not yet deployed |
| **Action** | Change to 49 once the phantom charms are resolved |
| **Category** | **Fix immediately** (but see D6 — sequence matters) |

## D4 — the product page renders 31 charms that do not exist

| | |
| --- | --- |
| **File** | `src/components/hangly/Collections.tsx` |
| **Claim** | 11 collections, 55 charms, displayed with artwork on `/products/hangly` |
| **Source** | Hand-authored website component |
| **Actual** | The app has 4 collections (Marvel, DC, Tamil Spiritual, BTS) and 9 library categories. 31 of the 55 displayed charms are not in the app |
| **Live** | **Yes** — `/products/hangly`, `/products/hangly/stats`, `/faq`, `/products`, `/`, `/changelog` |
| **Action** | Remove the seven phantom collections, or label them unreleased |
| **Category** | **Needs product decision** |

This is the most consequential item. A visitor sees Breaking Bad, Stranger Things, Friends,
Football, Singers and Dream Catcher charms with artwork, installs Hangly, and finds none of them.

## D5 — "Flash" is listed in DC; the app ships Shazam Lightning

| | |
| --- | --- |
| **File** | `src/components/hangly/Collections.tsx` |
| **Claim** | DC collection contains Flash |
| **Actual** | App DC: `batmanSymbol`, `supermanShield`, `wonderWomanEmblem`, `shazamLightning`, `greenLanternRing`. No Flash |
| **Action** | Replace Flash with Shazam Lightning |
| **Category** | **Fix immediately** — a one-word correction with no product decision behind it |

## D6 — the 31 orphaned artwork files

| | |
| --- | --- |
| **Files** | `website/public/charms/{breakingBad1-7, strangerThings8-13, friends14-19, football25-29, singer20-24, dreamCatcher, flash}.svg` and their connected variants — 62 files |
| **Source** | Drawn and committed to the website; never wired into the app |
| **Actual** | Real artwork, 32–297 KB each. No app charm behind any of them |
| **Action** | Ship in the app, remove from the website, or move to a clearly-unreleased area |
| **Category** | **Needs product decision** |

**Everything else waits on this.** Until it is answered, no count is safe.

## D7 — the schema describes a product that does not exist

| | |
| --- | --- |
| **File** | `src/lib/schema/entities.ts:169,179` |
| **Claim** | `SoftwareApplication.description`: *"Seventy-five charms across eleven collections and a seasonal set"*; `featureList`: same |
| **Actual** | 49 charms, 9 categories, 4 collections |
| **Impact** | This is the node every page carries. A false product claim in structured data is the kind Google acts on |
| **Action** | Rewrite to the app's real figures |
| **Category** | **Fix immediately** |

## D8 — metadata and OpenGraph description

| | |
| --- | --- |
| **File** | `src/lib/seo.ts:181` |
| **Claim** | *"75 charms across 11 collections"* — the `<title>`/description pair and the OG description for `/products/hangly` |
| **Live** | Production currently shows the older "80+ charms across 11 collections" |
| **Action** | Rewrite to 49 |
| **Category** | **Fix immediately** |

## D9 — the statistics page publishes website counts as product facts

| | |
| --- | --- |
| **Files** | `src/app/products/hangly/stats/page.tsx`, `scripts/generate-stats.mjs`, `src/data/stats.generated.ts` |
| **Claim** | 75 charms, 55 in collections, 20 seasonal, 11 collections — under `Dataset` schema with `measurementTechnique` |
| **Actual** | 49 charms, 11 seasonal in 4 packs, 4 collections, 9 categories |
| **Why it is worse here** | This page exists to be cited and carries a provenance claim. Deriving from the wrong source makes the derivation itself misleading |
| **Action** | Repoint the generator at `apps/Hangly/Hangly/Assets/CharmLibrary.json` |
| **Category** | **Fix immediately** |

## D10 — the roadmap page describes finished work that never started

| | |
| --- | --- |
| **File** | `src/app/products/hangly/roadmap/page.tsx:33,58,181,190` |
| **Claim** | *"All 75 charms now ship both renderings"*; *"Surface the seasonal charms — 20 charms ship with complete artwork but belong to no collection"* |
| **Actual** | 44 website SVGs correspond to app charms; 11 seasonal charms exist, not 20 |
| **Action** | Rewrite against the app's inventory |
| **Category** | **Fix immediately** |

## D11 — "20 seasonal charms" is wrong; there are 11

| | |
| --- | --- |
| **Files** | `stats.generated.ts` (`SEASONAL_COUNT = 20`), roadmap page, `app/(hub)/products/page.tsx:44`, `contact/page.tsx:172` |
| **Claim** | 20 seasonal and lucky charms |
| **Actual** | **11 seasonal** in 4 packs (Halloween 3, Diwali 3, Christmas 3, New Year 2). The other 9 uncollected website charms are Protection, Luck & Fortune and Ritual & Home library categories, not seasonal |
| **Action** | Correct to 11, and stop conflating seasonal with lucky — the app's categories are exclusive |
| **Category** | **Fix immediately** |

## D12 — `luckyCoin` and `lotus` are miscategorised

| | |
| --- | --- |
| **File** | `src/lib/charms/charm-registry.ts`, and earlier planning docs |
| **Claim** | Grouped as luck / cultural charms |
| **Actual** | Both are `seasonal` in `CharmLibrary.json`. `luckyCoin` is New Year; `lotus` is Diwali |
| **Action** | Correct when the registry is regenerated |
| **Category** | **Fix immediately** |

## D13 — the charm registry describes the website, not the product

| | |
| --- | --- |
| **File** | `src/lib/charms/charm-registry.ts` — 75 entries |
| **Source** | Generated from website artwork and `Collections.tsx` |
| **Actual** | Contains 31 charms that do not ship; omits 5 that do; uses 11 invented collections instead of 9 real categories; records 20 charms as having "no display name" when the app names all 49 |
| **Action** | Regenerate from `CharmLibrary.json` — see `docs/charm-source-of-truth-plan.md` |
| **Category** | **Fix immediately** |

## D14 — the FAQ says six collections are "still being finished"

| | |
| --- | --- |
| **File** | `src/data/hangly-faq.ts:103` |
| **Claim** | *"Six of those collections are still being finished"* — football, Stranger Things, singers, Breaking Bad, Friends, dream catcher |
| **Actual** | Not "being finished". They do not exist in the app: zero source references |
| **Action** | Either state honestly that they are planned and unreleased, or remove |
| **Category** | **Future feature — label as upcoming**, if they are genuinely planned |

This is the one claim that could become true. If the artwork is destined for a future release,
saying so plainly — "drawn, not yet shipped" — is accurate and loses nothing.

## D15 — the appcast names charms that exist nowhere

| | |
| --- | --- |
| **File** | `website/public/products/hangly/appcast.xml` — **protected, not modified** |
| **Claim** | *"A dream catcher joins the world collection; the RV joins Breaking Bad; The Weeknd joins Music Legends; and Spider-Man gets a second pose"* |
| **Actual** | None exists in the app. The app's own `v2.0.0.md` never mentions them. No "world collection" or "Music Legends" in `CharmCollection` |
| **Impact** | Shown inside the updater on first launch after an update, and rendered on `/changelog` |
| **Action** | Correct in a future appcast entry. Do not edit the shipped 2.0 item — installed copies have already read it |
| **Category** | **Needs product decision** |

## D16 — the changelog republishes the appcast's false claims

| | |
| --- | --- |
| **File** | `src/data/changelog.generated.ts` → `/changelog` |
| **Source** | Generated from the appcast, correctly |
| **Actual** | Faithfully reproduces D15 |
| **Action** | No action on the generator — it is doing its job. Resolves when the appcast does |
| **Category** | **Remove** (resolves upstream) |

## D17 — guides and comparisons name phantom collections

| | |
| --- | --- |
| **Files** | `lib/comparisons/comparison-data.ts:109`, `lib/guides/entries.ts`, `data/hangly-faq.ts:219` |
| **Claim** | "protection charms, Tamil Divine symbols, Marvel, DC, BTS and more"; "eleven themed collections" |
| **Actual** | The named ones are real. "Eleven collections" is not — the app has 4 collections and 9 categories |
| **Action** | Change "eleven collections" to the app's structure |
| **Category** | **Fix immediately** |

---

## By category

**Fix immediately (9):** D1, D2, D3, D5, D7, D8, D9, D10, D11, D12, D13, D17
**Needs product decision (3):** D4, D6, D15
**Future feature — label as upcoming (1):** D14
**Remove / resolves upstream (4):** D16, plus the 62 orphaned artwork files if D6 goes that way

## What is NOT wrong

Worth recording, so the correction does not overreach:

- **Every competitor claim** — prices, catalogues, platforms — verified 2026-09-25 and unaffected
- **The Lucky Dangle overlap argument** — all eleven charms it sells are real Hangly charms
- **Platform claims** — macOS 14+, Windows 10+, native ARM64
- **Version claims** — macOS 2.0, Windows 0.9.4
- **Privacy, physics, click-through and focus behaviour** — consistent with the source
- **The competitive position** — 49 still exceeds DangleJoy's 30+, Book My Luck's 22, Lucky
  Dangle's 12
