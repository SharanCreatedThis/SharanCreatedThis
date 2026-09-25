# Charm build priority

_2026-09-26. Impact ratings are relative judgements, stated as such. Effort is in working days._

## Blockers before anything ships

Three, and two are yours.

| # | Blocker | Owner | Effort | Blocks |
| --- | --- | --- | --- | --- |
| B1 | **20 charms have no display name** | Sharan — authoring | 0.5 day | Everything |
| B2 | **The app's real charm count and collection names** | Sharan — product knowledge | minutes | Any published count |
| B3 | **Artwork licence decision** | Sharan | a decision | The visual archive only |

B2 is new evidence from this sprint: the 2.0 release notes name a The Weeknd charm and a second
Spider-Man pose that have no artwork here, and collections — "Music Legends", "world collection"
— that the site does not have. **The application contains at least 77 charms; the website knows
75.** A page publishing "75 charms" as a product claim would be understating, which is the
opposite of the problem the last sprint fixed.

## Build order

### Tier 1 — makes existing claims verifiable

| # | Item | SEO | GEO | Authority | Conversion | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `/charms` index — all 75, filterable | High | **Very high** | High | **High** | 1.5d |
| 2 | `/charms/lucky` — the 12 cultural charms | **Very high** | High | **Very high** | **Very high** | 1d |
| 3 | Link the 20 count-stating pages to `/charms` | Medium | High | Medium | **High** | 0.5d |
| 4 | Count + link on the three download pages | Low | Medium | Low | **High** | 0.25d |

**Why this order.** Twenty pages currently assert "75 charms" and none can evidence it. Eight of
the eleven charms that prove the strongest competitive claim are invisible. Items 1 and 2 convert
an unverifiable assertion into a checkable fact, and items 3 and 4 route existing traffic to it.

Infrastructure for all four already exists — registry, filtering, grouping, schema, components —
so this is page assembly, not system building.

### Tier 2 — low-effort citation assets

| # | Item | SEO | GEO | Authority | Conversion | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| 5 | Category price index | Medium | High | **High** | Medium | 0.5d |
| 6 | Connected-artwork engineering note | Low | Medium | **High** | None | 0.5d |
| 7 | `/charms/archive` visual archive | Medium | Medium | **High** | Low | 1d |
| 8 | `/charms/custom` | Medium | **High** | Medium | Medium | 0.5d |
| 9 | Rewrite `/compare/lucky-dangle` with the overlap | **High** | Medium | High | High | 0.5d |
| 10 | Correct DangleJoy and Book My Luck entries | Low | Medium | **High** | Low | 0.25d |

Item 9 must follow item 2. The page cannot credibly claim the eleven-charm overlap while eight of
those charms are invisible — a reader who clicks to verify finds nothing.

Item 10 is accuracy debt: the site records "See their site" for two competitors whose prices and
catalogues are now known. DangleJoy is the second-largest catalogue in the category and the site
does not say so.

### Tier 3 — the slow, high-ceiling work

| # | Item | SEO | GEO | Authority | Conversion | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| 11 | `/charms/tamil-divine` | Medium | **High** | **Very high** | Low | 1.5d |
| 12 | Cultural symbolism reference — 12 charms | **High** | **Very high** | **Highest** | Low | 10d |
| 13 | `/charms/seasonal` + Diwali + Halloween | Medium | Medium | Medium | Low | 1.5d |
| 14 | Individual charm pages, ~10 | Medium | High | High | Low | subsumed by 12 |
| 15 | Physics and animation documentation | Low | Medium | Medium | Low | 1d |

Item 11 needs the judgement call in `charm-ia-final.md` made first — these are devotional symbols
and the page must decide what it is before it can be written well.

Item 13 is blocked on B2: nobody knows which eleven charms are the seasonal ones. The 2.0 notes
say eleven; the site has twenty uncollected.

Item 12 is the highest-ceiling work on the list and the wrong thing to start now. A fortnight of
cultural research on a domain with zero inbound links is correct work at the wrong time. Start it
once tiers 1 and 2 are earning attention.

## Never build

| Item | Reason |
| --- | --- |
| `/charms/marvel` and seven siblings | 47 licensed charms. An indexed page carrying someone else's trademark is a different artefact from a charm inside an app |
| `/charms/protection` as a separate URL | Four of its charms are also luck charms; it would cannibalise `/charms/lucky` |
| `/charms/dream-catcher` as a collection | One charm. As a collection page it is its own duplicate |
| `/charms/mythology`, `/charms/symbols` | Re-slice charms already listed elsewhere |
| 75 individual charm pages | About 10 have 600 honest words behind them |
| A charm count on `/charms` stated as a product total | Until B2 is answered, the site does not know it |

## Totals

| Tier | Days | Delivers |
| --- | --- | --- |
| Blockers | 0.5 (yours) | Unblocks everything |
| Tier 1 | 3.25 | Every existing claim becomes verifiable |
| Tier 2 | 3.25 | First three genuinely linkable assets |
| Tier 3 | 15 | The authority position |

**Tier 1 plus tier 2 is about 6.5 working days** and moves the site from asserting a catalogue to
showing one, with three assets someone might link to. That is the whole of the near-term
opportunity.

## What to measure

- **After tier 1:** does `/charms` get indexed? Do the comparison pages' bounce rates change now
  that the claim is checkable?
- **After tier 2:** any inbound link at all from a domain that is not a directory. That is the
  metric that moves authority from 5/10, and nothing before it matters much.
- **Before tier 3:** whether anything from tier 2 earned attention. If not, ten more days of
  writing will not fix that — the problem would be distribution, not content.

## One honest caveat on impact ratings

The SEO, GEO, authority and conversion columns are my judgement, not measurements. This site has
no Search Console history for any charm page, because no charm page exists. The ratings reflect
query intent, competitive gaps and the strength of the underlying evidence — all of which are
real — but the ranking outcome is a prediction and should be treated as one.

The parts of this plan that are *not* predictions: the charm counts, the competitor prices and
catalogues, the overlap, and which charms are invisible. Those are measured, and they are what
the plan rests on.
