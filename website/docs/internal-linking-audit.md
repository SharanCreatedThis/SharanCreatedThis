# Internal linking audit

_2026-09-25, measured from `out/`._

## Headline

| Measure | Value | Verdict |
| --- | --- | --- |
| Pages | 35 | — |
| Orphans | 0 | pass |
| Max depth from home | 2 clicks | pass |
| Median inbound links | 24 | pass |
| Commercial pages deeper than 2 clicks | **0** | pass |
| Total internal links | 704 | — |

## Every commercial page is within two clicks

| Page | Depth | Inbound |
| --- | --- | --- |
| `/products/hangly` | 1 | 31 |
| `/products` | 1 | 31 |
| `/download` | 1 | 31 |
| `/install` | 1 | 30 |
| `/compare` | 1 | 30 |
| `/faq` | 1 | 29 |
| `/products/hangly/stats` | 2 | 26 |
| `/products/hangly/roadmap` | 2 | 26 |
| `/download/windows` | 2 | 25 |
| `/download/mac` | 2 | 24 |

Depth distribution: 1 page at depth 0, 13 at depth 1, 21 at depth 2. Nothing is deeper.

## Weakest pages by inbound links

| Page | Inbound | Outbound | Depth |
| --- | --- | --- | --- |
| `/guides/charmly-alternatives` | **2** | 24 | 2 |
| `/guides/best-menu-bar-customisation-apps-for-mac` | 6 | 23 | 2 |
| `/guides/screen-dangle-alternatives` | 6 | 24 | 2 |
| `/guides/lucky-dangle-alternatives` | 7 | 24 | 2 |
| `/guides/best-mac-customization-apps` | 9 | 25 | 2 |
| `/guides/desktop-goose-alternatives` | 9 | 26 | 2 |
| `/compare/danglejoy` | 11 | 27 | 2 |

`/products/vision/docs` has 4 inbound and 1 outbound and is the weakest page on the site by
outbound links. **Excluded from recommendations per instruction.**

## Findings

### 1. `/guides/charmly-alternatives` is effectively isolated

Two inbound links against a median of 24. It is reachable, so it is not an orphan, but it has an
order of magnitude less internal support than its peers. The cause is structural: the shared
`SectionFooter` names two guides explicitly — the charm-apps guide and the desktop-pets guide —
and every other guide depends on being linked from sibling guides' "Alternatives" blocks.
Charmly's page is the least-referenced sibling.

**Fix:** add it to the `Decide` group in `SectionFooter`, or better, rotate which guides the
footer names so all eight get site-wide support rather than two.

### 2. Guide-to-guide linking is one-directional

Guides link forward through `related`, but a guide added later is never linked from one written
earlier unless someone edits it. `best-mac-customization-apps` shipped yesterday with 9 inbound;
the two older guides it links to gained nothing in return.

**Fix:** make the `Alternatives` block on each guide include the two most-recent guides
automatically, alongside the hand-picked `related` list. That is a change to `guide-page.tsx`
rather than to fifteen data files.

### 3. The comparison pages under-link the commercial pages

Each comparison page carries 27 outbound links, but they are dominated by sibling comparisons.
`/download/mac` and `/download/windows` are reached from the footer only.

**Fix:** in `comparison-page.tsx`, the platform section already discusses Windows and macOS
support. A contextual link from that paragraph to the matching download page would be natural
rather than decorative, and would give both pages ~8 additional contextual inbound links.

### 4. No page links to `/charms` because it does not exist

The single highest-value internal linking change is not a link at all — it is the charm index
recommended in `docs/authority-roadmap.md`. Every collection mention across 27 pages currently
terminates in prose. With an index, each becomes a link.

## Recommendations, ranked

| # | Change | Effort | Effect |
| --- | --- | --- | --- |
| 1 | Rotate the guides named in `SectionFooter` | S | Lifts the four weakest guides from 2–7 to ~25 inbound |
| 2 | Auto-append recent guides to each guide's `Alternatives` | S | Removes the one-directional decay permanently |
| 3 | Contextual download links from comparison platform sections | S | ~8 contextual inbound each to `/download/mac`, `/download/windows` |
| 4 | Build `/charms`, then link collection mentions to it | M | Turns 27 pages of dead prose into a hub |

None of these is implemented. Item 1 is a two-line change and would be the first thing to do.
