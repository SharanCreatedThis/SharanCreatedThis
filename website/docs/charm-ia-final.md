# Charm information architecture — final

_2026-09-26. Every proposed URL evaluated against whether it should exist at all._

## The test

A URL earns existence when it has **content no other URL has**. Re-slicing the same charms under
a new heading produces a doorway page, and the fact that a grouping is conceptually tidy is not
evidence that it is a page.

Three further constraints, all evidenced elsewhere:

- **Licensed charms never get a targeted page.** 47 of 75 — see `charm-product-audit.md`.
- **A charm with no display name cannot appear anywhere.** 20 of 75 — see the discoverability audit.
- **A charm count must not be published as a product claim** until the app's real figure is known.

---

## `/charms`

**Purpose.** The complete, permanent record of every charm the website ships. The primary
citation asset, and the parent every other charm URL hangs from.

**Target intent.** Commercial investigation — "what charms does Hangly have", "desktop charm
list", plus long-tail charm names once names exist.

**Unique content.** All 75 charms with artwork, names, collections, meanings. Nothing else on the
site or in the category lists a full catalogue: the largest competitor catalogue published is
DangleJoy's 30+, and Book My Luck's 22 is the only one enumerated.

**Overlap risk.** Low. `/products/hangly` shows collections as a marketing section, not a
catalogue.

**Cannibalisation risk.** Moderate and manageable. Both `/charms` and `/products/hangly` could
rank for "hangly charms". Mitigate the way `/faq` was mitigated: the product page keeps a
collections *teaser* linking here, and `/charms` owns the enumeration.

**Recommendation: BUILD — highest priority.**
Caveat: it must not assert a product charm total until the app figure is confirmed. "The charms
shown here" is accurate; "Hangly ships 75 charms" currently is not demonstrably so.

---

## `/charms/lucky`

**Purpose.** The cultural luck and protection charms — the set every competitor in the category
competes on.

**Target intent.** Commercial and informational — "free lucky charm app", "nazar desktop",
"maneki neko desktop".

**Unique content.** Strong, and this is the single most valuable page in the ecosystem.
Evidenced: Lucky Dangle sells twelve cultural charms at $7.77–$11.11 and eleven of them ship free
in Hangly. Screen Charms puts four behind a $4.99 tier from a one-charm free version. Desk Dangle
and Screen Dangle both lead with the nazar. No competitor gives this set away, and Hangly does.

**Overlap risk.** Moderate with `/charms/protection` — `nazar`, `hamsa`, `drishtiBommai` and
`nimbuMirchi` belong to both concepts.

**Cannibalisation risk.** **Real.** Two pages about overlapping cultural charms will compete.

**Recommendation: BUILD — but merge with protection.** See below.

---

## `/charms/protection`

**Purpose.** The apotropaic charms: nazar, drishti bommai, hamsa, nimbu-mirchi.

**Overlap risk.** **High.** All four are also luck charms and would appear on `/charms/lucky`.

**Cannibalisation risk.** **High.** The queries overlap almost entirely — someone searching "evil
eye desktop" is served identically by either page, and the two would split the signal.

**Recommendation: DO NOT BUILD as a separate URL.**

Merge into a single `/charms/lucky` covering all twelve cultural luck-and-protection charms, with
protection as a section within it. One page with twelve charms and a coherent argument beats two
pages with four and twelve overlapping.

This overturns the earlier architecture, which proposed both. The earlier plan was drawn before
the Lucky Dangle overlap was verified; with that evidence, the twelve-charm set is obviously one
page, because it is one competitive story.

---

## `/charms/tamil-divine`

**Purpose.** Vel, Vinayagar, Om, Karuppu, Temple Bell.

**Target intent.** Informational, and largely non-commercial — people looking up what a vel is.

**Unique content.** The strongest on the site by one measure: **nothing else in this category
ships Tamil devotional charms at all.** Verified across nine competitors.

**Overlap risk.** Low. No other page covers these.

**Cannibalisation risk.** Low.

**Recommendation: BUILD — second priority after `/charms/lucky`.**

**One judgement to make first, which is yours rather than mine.** These are Hindu devotional
symbols — Vinayagar is Ganesha, the vel is Murugan's spear, Om is sacred. A page optimised to
rank for them, ending in a download button for a desktop ornament, is a different proposition
from the same charms sitting in an app. It can be done respectfully — leading with what the
symbol means and treating the app as a footnote — or it can read as devotional iconography used
as SEO bait.

You are Tamil and this is your tradition, so the call is properly yours. I raise it because the
page cannot be written well without the decision being made deliberately.

---

## `/charms/dream-catcher`

**Purpose.** One charm. The site's "Dream Catcher" collection contains exactly `dreamCatcher`.

**Unique content.** Thin as a collection page — one item. Potentially strong as a *charm* page,
since the Ojibwe origin is genuinely interesting and widely misunderstood.

**Overlap risk.** Total. A collection page with one charm and an individual charm page for that
charm are the same page.

**Cannibalisation risk.** Certain, if both exist.

**Recommendation: DO NOT BUILD as a collection URL.**

If it earns anything, it is `/charms/dream-catcher` as a **single charm page**, not a collection.
And there is a second consideration: the dream catcher is a sacred Ojibwe object, and its
commercial reproduction is a live cultural-appropriation discussion. A page explaining the origin
honestly and naming that discussion would be genuinely good. A page treating it as a cute
decoration would be the kind of thing that attracts criticism rather than links.

Also worth resolving: the 2.0 notes say the dream catcher joined the app's **"world collection"**,
while the site gives it a collection of its own. The site's grouping appears to be an invention.

---

## Additional URLs evaluated

| URL | Verdict | Reason |
| --- | --- | --- |
| `/charms/seasonal` | **BUILD, later** | 11 charms per the app, 8 inferable from filenames. Blocked: nobody knows which eleven |
| `/charms/seasonal/diwali` | **BUILD, later** | `diya`, `firework`, `lantern`, `lotus`, `ghanta` — dated, recurring, culturally specific |
| `/charms/seasonal/halloween` | **BUILD, later** | `bat`, `ghost`, `pumpkin`. Thin but seasonal demand is real |
| `/charms/seasonal/winter` | **DEFER** | `candyCane`, `snowflake`, `bell`. Thinnest of the three |
| `/charms/custom` | **BUILD** | Any image as a charm. Strongest differentiator, currently an FAQ answer |
| `/charms/archive` | **BUILD, after licence decision** | The visual archive |
| `/charms/mythology` | **DO NOT BUILD** | Would contain Tamil Divine plus dream catcher — 80% duplicate of its sibling |
| `/charms/symbols` | **DO NOT BUILD** | Would contain charms already on lucky and tamil-divine |
| `/charms/marvel` and 7 others | **NEVER** | Licensed IP |
| 75 individual charm pages | **NO** | ~10 have 600 honest words behind them |

---

## Final architecture

```
/charms                          INDEX — all 75, filterable. Canonical for every charm.
├── /charms/lucky                12 cultural luck & protection charms (protection merged in)
├── /charms/tamil-divine         5 Tamil devotional charms — pending your judgement
├── /charms/custom               any image as a charm
├── /charms/seasonal             blocked: which eleven?
│   ├── /charms/seasonal/diwali
│   └── /charms/seasonal/halloween
├── /charms/archive              visual archive — blocked on the licence decision
└── /charms/<slug>               individual pages, ~10 max, only with 600 sourced words
```

**Seven group URLs, not the eleven previously proposed.** Protection folded into lucky,
dream-catcher demoted from a collection to a possible charm page, mythology and symbols dropped
as filters.

## What changed from the previous architecture, and why

| Previously | Now | Evidence |
| --- | --- | --- |
| `/charms/protection` as its own page | Merged into `/charms/lucky` | Four of its charms are also luck charms; queries overlap almost entirely |
| `/charms/dream-catcher` as a collection | Not a collection; possibly a charm page | It contains one charm, and the app calls it "world collection" |
| `/charms` publishes the charm total | Publishes the charms shown, not a product count | The app has ≥77 charms; the site knows 75 |
| Tamil Divine treated as straightforwardly safe | Safe legally; a judgement call culturally | Devotional symbols, commercial page, download CTA |
