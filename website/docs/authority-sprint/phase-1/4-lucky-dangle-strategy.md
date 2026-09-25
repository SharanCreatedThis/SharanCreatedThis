# 4 — `/compare/lucky-dangle` rewrite strategy

_Recommendations only. Both products read from their own sites; Lucky Dangle on 2026-09-25,
Hangly counted from its artwork at build time._

## Why this page first

It already ranks, and it is wrong. Every other comparison page is a new URL that has to earn its
position; this one has the position and is currently making a weaker case than the facts support.

## Verified charm overlap

Lucky Dangle publishes twelve charms. **Eleven of them ship in Hangly, free.**

| Lucky Dangle charm | In Hangly | Hangly id | Currently visible on our site |
| --- | --- | --- | --- |
| Nazar boncuğu | Yes | `nazar` | Yes — Protection collection |
| Hamsa | Yes | `hamsa` | Yes — Protection collection |
| Drishti bommai | Yes | `drishtiBommai` | Yes — Protection collection |
| Nimbu-mirchi | Yes | `nimbuMirchi` | **Artwork only, never named** |
| Ghanta | Yes | `ghanta` | **Invisible** |
| Páncháng jié | Yes | `panchangJie` | **Invisible** |
| Daruma | Yes | `daruma` | Partially — named in the demo |
| Maneki-neko | Yes | `manekiNeko` | **Invisible** |
| Horseshoe | Yes | `horseshoe` | **Invisible** |
| Scarab | Yes | `scarab` | **Invisible** |
| Himmeli | Yes | `himmeli` | **Invisible** |
| Emoji option | No — Hangly takes any image instead | — | — |

**Seven of the eleven are invisible or near-invisible on our own site.** That is the headline
finding and it is why this page currently understates the case: we cannot credibly claim a charm
we have never listed.

## Pricing, verified

| | Hangly | Lucky Dangle |
| --- | --- | --- |
| Price | **Free** | **$7.77** (₹777) / **$11.11** (₹1,111) |
| What the tiers mean | No tiers | "Lucky" and "Extra Lucky" |
| Charms | **75** | 12 |
| Custom images | Any image | Emoji only |
| Platforms | macOS 14+, Windows 10+ **x64 and native ARM64** | macOS 14+, Windows 10/11 |
| One purchase covers both platforms | n/a — free | Yes |

## Outdated or misleading claims on the current page

| Current claim | Status | Correction |
| --- | --- | --- |
| Price: "See their site" | **Outdated** | $7.77 / $11.11, one purchase covers both platforms |
| "Does not publish a charm count" | **Wrong** | They publish twelve, named individually |
| "Hangly ships over eighty charms" | **Fixed** in the count pass | 75 |
| No mention of the catalogue overlap | **Omission** | Eleven of their twelve ship free in Hangly |
| "Choose Lucky Dangle if its curated set is what you want" | **Weak** | Their set is *a subset of ours* — the honest reason to choose them is different |

That last row is the important one. The current page concedes a reason to pick Lucky Dangle that
does not survive the facts: you cannot prefer their curated set for its contents when we ship all
of it. The page needs a *truthful* reason to choose them, or it becomes an advertisement — which
is the failure mode every comparison on this site was written to avoid.

## Honest reasons to choose Lucky Dangle

Found by looking rather than assumed:

1. **One purchase covers Mac and Windows**, and some people prefer paying once to using something
   free from a developer they do not know.
2. **A twelve-charm catalogue is a complete, curated thing.** Seventy-five charms across eleven
   collections is more choice than some people want, and most of ours are film and music
   characters rather than luck charms. If you want *only* cultural luck charms, their catalogue is
   focused in a way ours is not.
3. **The emoji option is instant.** Hangly's any-image support is more capable and slower — you
   need an image.

Point 2 is the strong one and it is genuinely true. It should lead their side of the page.

## What Hangly can claim, and what it cannot yet

**Can claim now:**
- 75 charms against 12, both counts published and derived
- Free against $7.77–$11.11
- Any image as a charm, against emoji only
- Native Windows ARM64 — nothing in the category else has this
- Every figure on our side counted from source at build time, with a dated statistics page

**Cannot credibly claim until `/charms/lucky` ships:**
- That we include their eleven charms. The claim is true, and a reader clicking through to verify
  finds nothing. **Publishing the overlap before the page exists invites the obvious rebuttal.**

## Recommended sequence

| Step | Action |
| --- | --- |
| 1 | Author display names and meanings for the 20 invisible charms |
| 2 | Ship `/charms/lucky` listing all twelve overlapping charms with artwork |
| 3 | **Then** rewrite `/compare/lucky-dangle` with pricing, the count, and the overlap linked to proof |
| 4 | Update `LUCKY_DANGLE` in `entries.ts` — price, charm count, custom-image support |

Doing step 3 before step 2 is the one sequencing mistake available here.

## Recommended structure for the rewritten page

- **Quick answer** — both hang a cultural charm; Hangly is free with 75 charms including all
  twelve of theirs; Lucky Dangle is $7.77 and more focused
- **The overlap table** — their twelve, ours, linked to `/charms/lucky`
- **Pricing** — stated plainly, no editorialising
- **Where Lucky Dangle genuinely wins** — the curated-set argument, given properly
- **Where Hangly wins** — count, price, custom images, ARM64
- **Direct answers** and FAQ, per the existing template
- **Checked date**, as every comparison carries

## One caution on tone

The overlap is a strong fact and it would be easy to write it as an accusation. It should not be.
There is no evidence about who drew what first, these are public-domain cultural symbols that any
charm app would reasonably include, and the same eleven appear across Screen Charms, Desk Dangle
and Screen Dangle too.

The fact worth stating is narrow and defensible: **these twelve charms are what this category
competes on, Hangly ships all of them free, and here they are.** Anything beyond that is
speculation the page cannot support.
