# `/charms` — complete build plan

_2026-09-26. Plan only; no code written._

**Canonical source: `src/data/hangly/charm-library.shipped.json`** — extracted from
`Hangly-2.0.0.dmg` at `Contents/Resources/CharmLibrary.json`. The stale `apps/Hangly/` catalogue
is not consulted anywhere in this plan; `npm run check:app-source` reports its drift.

---

## 1. What the canonical source actually gives us

**Every field is populated for all 81 charms.** This is the finding that changes the plan.

| Field | Coverage | Example |
| --- | --- | --- |
| `id` | 81/81 | `manekiNeko` |
| `name` | 81/81 | `Maneki-neko` |
| `region` | 81/81 | `Japan` |
| `category` | 81/81 | `luck` |
| `description` | 81/81 | 61–239 chars, median 115 |
| `tags` | 81/81 | `cat, beckoning, calico, shop, fortune` |
| `previewImage` | 81/81 | `charm-preview-manekiNeko` — an Xcode asset name, **not a web path** |

Earlier planning concluded that 20 charms had no display name and that half a day of authoring
blocked everything. **That blocker does not exist.** It was an artefact of reading the website's
artwork directory. The app names, describes, regions and tags all 81.

The descriptions are publishable as they stand:

> **Horseshoe** — *Iron shaped by fire, nailed above a door for luck. Hung open end up it holds
> the luck in; open end down it pours out over everyone who passes.*

> **Lotus** — *Rooted in mud and opening clean above it, which is the whole of what it means.*

### The 14 categories

| Category | Charms | Licensed | Page? |
| --- | --- | --- | --- |
| Protection | 6 | — | in `/charms/lucky` |
| Luck & Fortune | 4 | — | in `/charms/lucky` |
| Ritual & Home | 2 | — | in `/charms/lucky` |
| Seasonal | 11 | — | `/charms/seasonal` |
| Classic | 5 | — | `/charms/classic` |
| Tamil Spiritual | 5 | — | later, needs a judgement call |
| Marvel · DC · BTS · Football Legends · Music Legends · Friends · Breaking Bad · Stranger Things | 48 | **YES** | **never** |

**33 charms are non-licensed. 48 are somebody else's IP.**

---

## 2. Page architecture

### `/charms` — the index

**Purpose.** The complete, permanent catalogue. The page every count on the site links to, and
the primary citation asset.

**Content.** All 81 charms — including the licensed ones, because a visitor deciding whether to
install wants to see them. *Displaying* a charm is not the same as *targeting* a trademark; what
licensed charms never get is a dedicated URL, an optimised title or their own schema node.

**Sections.**
1. `h1` + direct answer — *"Hangly ships 81 charms across 14 categories, free."* from `HANGLY_COPY.exactWithCategories`
2. Filter bar — category, region, tag, free-text
3. Grid of 81, grouped by category, each with artwork, name, region, description
4. A category summary table
5. Links to the three sub-pages and the product page

**Counts:** `HANGLY_STATS` only. No literal may appear — `validate-charm-counts.mjs` enforces it.

### `/charms/lucky` — luck, protection and ritual charms

**Contents: 12 charms**, spanning three shipped categories:

- **Protection (6)** — Nazar boncuğu, Hamsa, Nimbu-mirchi, Drishti bommai, Scarab, Dream Catcher
- **Luck & Fortune (4)** — Pánchángjié, Daruma, Maneki-neko, Horseshoe
- **Ritual & Home (2)** — Ghanta, Himmeli

**Why three categories on one page, and not `/charms/luck` with four.**

Four charms is too thin for a page that has to rank. More importantly, these twelve are exactly
the competitive battleground: Lucky Dangle sells eleven of them for $7.77–$11.11, Screen Charms
puts four behind a $4.99 tier from a one-charm free version, and Desk Dangle and Screen Dangle
both lead with the nazar. **Hangly ships all twelve free.** That is one argument and it belongs
on one page.

Splitting it into `/charms/luck` (4), `/charms/protection` (6) and `/charms/ritual` (2) would
create three thin pages competing for the same queries — "evil eye desktop" is served identically
by the first two — and would fragment the one claim worth making.

*If you prefer strict category fidelity, the alternative is `/charms/protection` (6) and
`/charms/luck` (6, merging Luck & Ritual). I recommend against it for the reason above.*

### `/charms/seasonal` — 11 charms in 4 packs

Structured by pack, matching `SeasonalPack.swift`:

| Pack | Charms | Window |
| --- | --- | --- |
| Halloween | Pumpkin, Ghost, Bat | 1–31 October |
| Diwali | Diya, Lotus, Lantern | **User-editable**, default 5–11 Nov |
| Christmas | Snowflake, Bell, Candy Cane | 1–26 December |
| New Year | Firework, Lucky Coin | 27 Dec – 6 Jan |

**Two things the page must get right**, both verified in the app source:

- **Seasonal charms are not date-restricted.** All 81 are selectable by hand year-round. What the
  date changes is what the app puts on the rope by default.
- **Diwali's window moves.** It follows the lunar calendar and is user-editable; the default will
  drift. The page must not state a fixed Diwali date as a product fact.

The page stays live all year. "Hangly's Diwali charms" is worth having in March.

### `/charms/classic` — 5 charms ⚠️ **blocked on artwork**

Bead, Star, Heart, Diamond, Camera. Region `Universal`. These are Hangly's own designs rather than
cultural objects, and Bead is the charm the app ships with.

**The blocker: the website has artwork for 0 of the 5.** They are drawn procedurally in Swift
(`CircleCharm.swift`, `StarCharm.swift`, `HeartCharm.swift`, `DiamondCharm.swift`,
`CameraCharm.swift`), so no SVG exists anywhere to copy. `previewImage` names an Xcode asset
catalogue entry, not a file.

Three ways forward, in order of preference:

1. **Export five SVGs from the app.** Cleanest, matches every other charm, ~an hour of design time.
2. **Draw them in inline SVG on the page.** They are a circle, a star, a heart, a diamond and a
   camera. Defensible, and honest if the page says they are representations.
3. **Ship the page without artwork**, as a described list. Weakest — a charm page with no charms
   on it undermines the whole point.

**Do not ship `/charms/classic` until one of these is done.** A 5-item page with no images is the
thinnest thing on the site.

---

## 3. Schema architecture

One `@graph` per page, joined to the existing entity graph by `@id` reference. Never re-declare
the person, organisation or website — `SiteJsonLd` already emits them on every page.

### `/charms`

```
CollectionPage  @id  /charms#page
  isPartOf   → {@id: /#website}
  about      → {@id: /products/hangly#hangly}
  mainEntity → ItemList
ItemList        @id  /charms#list
  numberOfItems 81
  itemListElement[] → ListItem → ImageObject
ImageObject     @id  /charms#<charmId>     × 81
  name, contentUrl, encodingFormat image/svg+xml
  description  ← the shipped description, verbatim
  creator      → {@id: /#person}
  copyrightHolder → {@id: /#organization}
BreadcrumbList  @id  /charms#breadcrumb
```

### `/charms/lucky` · `/charms/seasonal` · `/charms/classic`

Same shape, scoped: `CollectionPage` + `ItemList` of that page's charms + `BreadcrumbList`, plus
`FAQPage` where real questions exist.

### Rules

| Rule | Why |
| --- | --- |
| `description` comes from the catalogue, never generated | Schema asserting what the page does not say is the failure the whole stats system exists to prevent |
| No `Product` or `Offer` per charm | Charms are not separately purchasable. `SoftwareApplication.offers` on the app already states free |
| No `aggregateRating` anywhere | No reviews exist. Inventing one is a manual-action risk |
| Licensed charms get an `ImageObject` in the index only | No dedicated node, no page, no optimised title |
| Every `@id` must resolve on its own page | `seo-validate.mjs` fails the build on a dangling reference |
| One FAQPage per page, no question repeated site-wide | Enforced by the existing one-question-one-page check |

---

## 4. Filtering architecture

**Server-render everything, filter on the client.** The whole catalogue must be in the HTML before
JavaScript runs — a crawler or answer engine that sees an empty grid is the entire failure mode.

```
Server:  <CharmGrid charms={allCharms} />        ← 81 in the HTML
Client:  <CharmFilterBar />                      ← hides, never fetches
```

**Facets**, all derived from the catalogue, none hardcoded:

| Facet | Source | Values |
| --- | --- | --- |
| Category | `charm.category` | 14 |
| Region | `charm.region` | 28 distinct |
| Tag | `charm.tags[]` | ~200 |
| Season | `SeasonalPack` mapping | 4 |
| Free text | name + region + description + tags | — |

**URL policy.** Filters are **client state only** — no query strings, no filtered URLs in the
sitemap, canonical always `/charms`. A facet combination is a view, not a page; `region=Japan`
and `tag=cat` would otherwise generate hundreds of near-duplicate indexable URLs. This is the
doorway-page line and it is worth being strict about.

Existing infrastructure in `src/lib/charms/queries.ts` and `src/components/charms/` already
implements filtering, grouping and search indexing — it must be **repointed from the registry to
the shipped catalogue**, which is a data-source change rather than a rewrite.

---

## 5. Internal linking plan

### Inbound

| From | To | Anchor |
| --- | --- | --- |
| 36 pages stating the count | `/charms` | "81 charms" becomes a link |
| `/products/hangly` collections section | `/charms` | "See all 81 charms" |
| `/download`, `/download/mac`, `/download/windows` | `/charms` | One line in Key Takeaways |
| `/compare/*` × 8, charm-count row | `/charms` | Makes the claim checkable |
| `/compare/lucky-dangle` | `/charms/lucky` | **The overlap proof** |
| `/faq` — "how many charms" | `/charms` | — |
| `/products/hangly/stats` | `/charms` | Stats cites the catalogue |
| `SectionFooter` | `/charms` | Site-wide |

Target: `/charms` at 30+ inbound, depth 1. Sub-pages at depth 2.

### Outbound

Index → 3 sub-pages, product page, download, stats. Sub-pages → index, siblings, product,
download. Every page links back to `/charms` as canonical parent.

### The link that matters most

`/compare/lucky-dangle` → `/charms/lucky`. Eleven of Lucky Dangle's twelve paid charms ship free
in Hangly. **That claim is currently unverifiable** — a reader clicking to check finds nothing.
`/charms/lucky` is what makes it evidence.

---

## 6. SEO strategy

| Page | Primary query | Intent | Competition |
| --- | --- | --- | --- |
| `/charms` | "hangly charms", "desktop charm list" | Commercial investigation | None — no competitor publishes a full catalogue |
| `/charms/lucky` | "lucky charm app desktop", "nazar desktop", "maneki neko desktop" | Commercial + informational | Lucky Dangle, Screen Charms, Desk Dangle |
| `/charms/seasonal` | "halloween desktop decoration", "diwali desktop" | Informational, dated | Almost none |
| `/charms/classic` | "simple desktop charm", "minimal desktop ornament" | Commercial | Low |

**Titles and descriptions** come from `PAGES`/`dynamicPages()` in `src/lib/seo.ts`, so they reach
the sitemap automatically and `check-seo.mjs` fails the build if a page is missing.

**Cannibalisation control.** `/products/hangly` keeps a collections *teaser* and cedes
enumeration to `/charms` — the same split that resolved the `/faq` duplication. The
one-question-one-page validator already prevents FAQ overlap.

**What not to do:** no filtered URLs, no per-charm pages in the first build, no pages for the
eight licensed categories.

---

## 7. GEO / AEO strategy

### Questions these pages must answer liftably

| Question | Page | Answer source |
| --- | --- | --- |
| "How many charms does Hangly have?" | `/charms` | `HANGLY_STATS.charmCount` — 81 |
| "What charms does Hangly include?" | `/charms` | The enumerated grid |
| "Does Hangly have a nazar / maneki-neko / daruma?" | `/charms/lucky` | Named, described, pictured |
| "Does Hangly have Diwali charms?" | `/charms/seasonal` | Diya, Lotus, Lantern |
| "What's the free alternative to Lucky Dangle?" | `/charms/lucky` | The twelve, free |
| "What is a drishti bommai?" | `/charms/lucky` | Shipped description |

### Block structure, per the existing AEO components

Each page carries, in this order: `QuickAnswer` (40–80 words, the count and what it covers) →
`KeyTakeaways` (3–5 bullets) → the grid → `FAQPage` → `InShort`.

**Every FAQ answer must be visible in the page text** — `seo-validate.mjs` already fails the build
otherwise, and it caught a real violation on the Vision page once.

### The entity angle

Each charm's `region` and `tags` make the catalogue a small knowledge graph: 28 regions, ~200
tags. Surfacing region as a facet and in the schema gives an answer engine something no competitor
publishes — *which cultures a desktop charm app covers*, answerable from one page.

---

## 8. Technical specification

### Data layer

```
src/data/hangly/charm-library.shipped.json      canonical, committed, extracted from the DMG
src/lib/stats/hangly.ts                         HANGLY_STATS, HANGLY_CATEGORIES, SHIPPED_CHARMS
src/lib/charms/queries.ts                       REPOINT from charm-registry to SHIPPED_CHARMS
src/lib/charms/schema.ts                        ImageObject / ItemList emitters — reusable as-is
src/lib/charms/routes.ts                        REPOINT; keep the licensed-charm route guard
```

**`charm-registry.ts` is retired as a source.** It was generated from website artwork and
describes 75 charms that are not the product. Either regenerate it from the shipped catalogue or
delete it; it must not remain as a second answer.

### Components

```
src/components/charms/CharmCard.tsx        exists — add region + description
src/components/charms/CharmGrid.tsx        exists — reusable
src/components/charms/CharmFilters.tsx     exists — add region and tag facets
src/components/charms/CharmCategoryTable.tsx   NEW — the category summary
```

### Routes

```
src/app/charms/layout.tsx            NEW   — hangly.css, SectionFooter
src/app/charms/page.tsx              NEW   — index, 81 charms
src/app/charms/lucky/page.tsx        NEW   — 12 charms
src/app/charms/seasonal/page.tsx     NEW   — 11 charms, 4 packs
src/app/charms/classic/page.tsx      NEW   — 5 charms, BLOCKED on artwork
```

### Registration

Add all four to `dynamicPages()` in `src/lib/seo.ts`; `check-seo.mjs` fails the build otherwise.

### Build validation — already in place

| Validator | What it guarantees here |
| --- | --- |
| `validate-charm-counts.mjs` | No page states a count except through `HANGLY_STATS` |
| `seo-validate.mjs` | Canonicals, one h1, OG/Twitter, breadcrumbs, dangling `@id`, FAQ answers visible, orphans, depth |
| `check-seo.mjs` | Every exported page is in the sitemap |
| `check-app-source-freshness.mjs` | `apps/Hangly` is not quietly reintroduced as a source |

### One new check to add

**Artwork coverage.** Fail the build if a charm rendered on a `/charms` page has no artwork file.
This is what would catch `/charms/classic` shipping with five broken images, and it is the same
class of check that `generate-charm-manifest.mjs` performs for the product page.

---

## 9. Blockers and sequence

| # | Blocker | Owner | Effort |
| --- | --- | --- | --- |
| B1 | **Classic artwork — 5 SVGs do not exist** | Sharan / design | ~1 hour to export |
| B2 | Decide `/charms/lucky` scope: 12 across three categories, or strict per-category | Sharan | A decision |
| B3 | Retire or regenerate `charm-registry.ts` | Engineering | 0.5 day |

| Phase | Deliverable | Effort | Depends on |
| --- | --- | --- | --- |
| 1 | Repoint the charm layer at the shipped catalogue; retire the registry | 0.5 day | B3 |
| 2 | `/charms` index — 81 charms, filters, schema | 1 day | Phase 1 |
| 3 | `/charms/lucky` — 12 charms | 0.5 day | B2 |
| 4 | `/charms/seasonal` — 11 charms, 4 packs | 0.5 day | — |
| 5 | Internal linking — 36 pages link the count to `/charms` | 0.5 day | Phase 2 |
| 6 | `/charms/classic` | 0.25 day | **B1** |
| 7 | Artwork-coverage validator | 0.25 day | — |

**3.5 days total**, of which `/charms` and `/charms/lucky` — the two that matter — are 2 days.

## 10. What this plan deliberately excludes

- **Per-charm pages.** 81 descriptions average 122 characters. That is a good grid caption and not
  a page. Individual pages come later, only where 600 researched words exist.
- **Pages for the 8 licensed categories.** 48 charms, highest apparent traffic, unacceptable risk.
- **`/charms/tamil-divine`.** The 5 charms are real and unique in the category, but they are
  devotional symbols and the page needs a deliberate decision about what it is before it is
  written. Out of scope here, not forgotten.
- **Filtered URLs.** Views, not pages.
