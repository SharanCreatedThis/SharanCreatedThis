# 1 — `/charms` information architecture

_Design only. No pages built._

## Principle

**Categories are facets, not folders.** A charm has one canonical URL and can appear in many
listings. `nazar` is protection, cultural, a symbol and a luck charm all at once; giving it four
URLs would create the doorway pages this sprint was told to avoid.

So: one canonical page per *indexable* grouping, one canonical page per charm that earns one, and
every other grouping is a filter on `/charms` that does not get its own URL.

## The taxonomy applied to all 75

Six facets, as requested. A charm may carry several.

### Collections (55 charms, 11 collections)

| Collection | n | IP status |
| --- | --- | --- |
| Protection | 3 | Safe — cultural |
| Tamil Divine | 5 | Safe — cultural |
| Dream Catcher | 1 | Safe — cultural |
| Marvel | 5 | **Licensed** |
| DC | 5 | **Licensed** |
| BTS | 7 | **Licensed / personality** |
| Football | 5 | **Personality + club marks** |
| Stranger Things | 6 | **Licensed** |
| Singers | 5 | **Personality** |
| Breaking Bad | 7 | **Licensed** |
| Friends | 6 | **Licensed** |

### Seasonal (8)
`bat`, `ghost`, `pumpkin` — Halloween
`candyCane`, `snowflake` — winter
`diya`, `firework`, `lantern` — Diwali and celebration

### Protection / apotropaic (4)
`nazar`, `drishtiBommai`, `hamsa` *(in Protection)*, `nimbuMirchi`

### Cultural / ritual (7)
`diya`, `ghanta`, `lotus`, `lantern`, `bell`, `panchangJie`, `himmeli`

### Mythology / deity (6)
`vel`, `vinayagarCoin`, `karuppuStatue`, `omSymbol`, `templeBell` *(Tamil Divine)*, `dreamCatcher`

### Luck / symbols (8)
`daruma`, `manekiNeko`, `horseshoe`, `luckyCoin`, `scarab`, `panchangJie`, `himmeli`, `hamsa`

### Misclassified (1)
`shazamLightning` — DC Comics, currently loose in the seasonal set. Belongs in the DC collection.

## The URL structure

```
/charms                               INDEX — all 75, filterable. Canonical for every charm.
│
├── /charms/lucky                      INDEXABLE — 12 luck & protection charms
├── /charms/protection                 INDEXABLE — nazar, drishti bommai, hamsa, nimbu-mirchi
├── /charms/tamil-divine               INDEXABLE — vel, vinayagar, om, karuppu, temple bell
├── /charms/seasonal                   INDEXABLE — hub for the 8 dated charms
│   ├── /charms/seasonal/diwali        INDEXABLE — diya, ghanta, lotus, firework, lantern
│   ├── /charms/seasonal/halloween     INDEXABLE — bat, ghost, pumpkin
│   └── /charms/seasonal/winter        INDEXABLE — candy cane, snowflake, bell
├── /charms/custom                     INDEXABLE — any image as a charm
│
└── /charms/<slug>                     INDIVIDUAL — only where 600 honest words exist
    ├── /charms/nazar
    ├── /charms/maneki-neko
    ├── /charms/daruma
    ├── /charms/drishti-bommai
    ├── /charms/hamsa
    ├── /charms/nimbu-mirchi
    ├── /charms/scarab
    ├── /charms/horseshoe
    ├── /charms/vel
    └── /charms/vinayagar
```

**Individual charm URLs are flat** — `/charms/nazar`, not `/charms/protection/nazar`. A charm
belongs to several facets; nesting it under one asserts a hierarchy that is not true, and it
makes the canonical ambiguous the moment the charm also appears under `/charms/lucky`.

## Which groupings get indexable pages

| Page | Indexable | Why |
| --- | --- | --- |
| `/charms` | **Yes** | The database. The primary citation asset |
| `/charms/lucky` | **Yes** | 12 charms rivals charge for. Highest-value page on the list |
| `/charms/protection` | **Yes** | Real subject matter; nazar and drishti bommai have genuine demand |
| `/charms/tamil-divine` | **Yes** | Nothing else in the category serves this at all |
| `/charms/seasonal` + 3 children | **Yes** | Dated, recurring, and each has 3–5 real charms |
| `/charms/custom` | **Yes** | The strongest differentiator, currently an FAQ answer |
| 10 individual charm pages | **Yes** | Each has 600+ honest words of history behind it |
| **The 8 licensed collections** | **No — do not build** | Marvel, DC, BTS, Football, Stranger Things, Singers, Breaking Bad, Friends |
| `/charms/mythology` | **No** | Overlaps Tamil Divine almost entirely. A filter, not a page |
| `/charms/symbols` | **No** | Overlaps lucky and protection. A filter, not a page |
| Per-charm pages for the other 65 | **No** | Nothing honest to say beyond "it exists" |

**Total indexable: 18 pages.** Nineteen if `/charms/dream-catcher` earns one, which it might —
the Ojibwe origin is genuinely interesting and widely misunderstood.

### Why `mythology` and `symbols` are filters rather than pages

Both were requested as categories. Neither earns a URL:

- `/charms/mythology` would contain `vel`, `vinayagar`, `karuppu`, `om`, `temple bell`,
  `dreamCatcher` — five of which are already `/charms/tamil-divine`. The page would be 80% a
  duplicate of its sibling and would compete with it.
- `/charms/symbols` would contain charms already listed under lucky and protection. Same problem.

They remain as **filter states on `/charms`** — `/charms?facet=mythology` — which is useful in
the interface, carries `noindex` via the canonical pointing at `/charms`, and creates no
competing URL.

This is the doorway-page line: a grouping earns a URL when it has content that no other page has.
Re-slicing the same charms does not.

## `/charms` page structure

1. **H1 and a direct answer.** "Hangly ships 75 charms across 11 collections and a seasonal set.
   Every one is free." — the count derived, never typed.
2. **Facet filters** — collection, type, origin, season. Client-side over a fully server-rendered
   list, so every charm is in the HTML before JavaScript runs.
3. **The full grid** — all 75, artwork, display name, collection, one-line meaning where one
   exists.
4. **Licensed collections shown but not linked out.** They appear in the grid because a user
   deciding whether to install wants to see them. They get no dedicated page and no optimised
   title. Displaying is not the same as targeting.
5. **The comparison line.** What competitors charge for the equivalent, with dates.
6. **Download CTA**, and links to the indexable sub-pages.

**Schema:** `CollectionPage` + `ItemList` of 75 `ImageObject` entries, `BreadcrumbList`.

## Collection page structure (`/charms/lucky` and siblings)

- 300–500 words on the tradition these charms come from — real content, not a grid caption
- Each charm: artwork, name, origin, one line of meaning, link to its page where it has one
- Where verifiable: what competitors charge for the same charm
- Schema: `CollectionPage` + `ItemList`, `BreadcrumbList`

## Individual charm page structure

- 600–900 words: origin, meaning, regional variation, common misconceptions
- The artwork as Hangly draws it, plain and connected side by side
- Two lines on using it in the app — not the focus
- Related charms across facets
- Schema: `Article`, `BreadcrumbList`, `FAQPage` only where real questions exist

**The rule: no page without 600 honest words.** That reduces 75 charms to 10. This is the whole
defence against doorway pages, and it should be applied ruthlessly — if the research turns out
thin for `horseshoe`, it does not get a page and it lives on `/charms/lucky` instead.

## Build order

| Phase | Pages | Blocked on |
| --- | --- | --- |
| 1 | `/charms` | Display names for the 20 |
| 2 | `/charms/lucky`, `/charms/custom` | Phase 1 |
| 3 | `/charms/nazar`, `/maneki-neko`, `/daruma` | Research |
| 4 | `/charms/protection`, `/charms/tamil-divine` | Phase 1 |
| 5 | `/charms/seasonal` + 3 children | Ship ahead of each season |
| 6 | Remaining individual pages, only where the words exist | Research |

Stop after phase 2 and measure before committing to phases 3–6.
