# Charm conversion opportunities

_2026-09-26. Where the catalogue advantage should and should not appear._

## Current state

The charm count appears on **20 of 35 pages**. Coverage is not the problem.

| Surface | States a count | Shows the charms |
| --- | --- | --- |
| `/` home | No | No |
| `/products/hangly` | Yes | 55 of 75, as a carousel |
| `/products` | Yes | No |
| `/compare/*` (7 of 8) | Yes | No |
| `/guides/*` (7 of 8) | Yes | No |
| `/faq` | Yes | No |
| `/download`, `/download/mac`, `/download/windows` | **No** | No |
| `/install` | **No** | No |
| `/products/hangly/stats` | Yes, broken down | No |
| `/contact` | Yes | No |

**The gap is not that the number is missing. It is that the number is unverifiable.** Twenty
pages assert 75 charms and exactly one page shows any of them, and that one shows 55.

## Where it should appear and does not

### 1. The download pages — highest conversion value

`/download`, `/download/mac` and `/download/windows` state **no charm count at all**. These are
the last pages before the decision, they carry 24–31 inbound links each, and they are where a
visitor who has already decided *to install something* chooses *what*.

**Recommendation:** one line in the Key Takeaways block — "75 charms across 11 collections and a
seasonal set, free" — and once `/charms` exists, a link to it. Not a grid; these pages convert by
being fast.

### 2. The home page

No charm count, no charm artwork, no link to Hangly's charms. The first download CTA is at 66%
depth. A visitor arriving on a product-intent query sees an editorial portfolio page.

**Recommendation:** the existing product section should carry the count and, once it exists, a
link to `/charms`. This is the weakest link in the funnel and it has been flagged in the
conversion audit since the first pass.

### 3. `/install`

No count. Lower priority — someone reading install steps has already downloaded.

## Where it should NOT appear

Stated because adding it everywhere is the obvious mistake.

| Surface | Why not |
| --- | --- |
| `/portfolio`, `/about`, `/contact` beyond what is there | These are about Sharan, not Hangly. `/contact` already mentions it once, which is enough |
| `/changelog` | It records what changed, and the count is not a change |
| The comparison pages, more than once each | Seven already state it. Repeating it inside every table row reads as insecurity |
| Vision pages | Out of scope, and unrelated |
| The 404 page | No |

## Where users currently miss the value

Ranked by how much is lost.

### 1. The 20 invisible charms are the conversion argument, and nobody sees them

Eleven of Lucky Dangle's twelve paid charms ship free in Hangly. Eight of those eleven are
invisible. A visitor comparing the two sees "75 charms" as an unverifiable claim against Lucky
Dangle's twelve *named and pictured* charms.

**An enumerated list of twelve beats an unverified claim of seventy-five.** That is the single
largest conversion loss in the ecosystem, and `/charms/lucky` is the fix.

### 2. The product page shows 55 of 75 and calls it the collection

Someone evaluating charm variety counts what they see. They see 55, in eleven collections, of
which eight are licensed characters. The cultural luck charms — the ones with cross-cultural
appeal and the ones competitors charge for — are almost entirely absent from that view.

### 3. "Free" is never in a CTA label

Every download button says "Download". None says "free". Competitors charge $4.99–$11.11; free is
the strongest single word available and it appears only in supporting text.

**Recommendation:** test "Download free for Mac". Cheap, reversible, and the one change here with
a measurable outcome.

### 4. Custom charms are an FAQ answer

"Any image becomes a charm" is a differentiator Screen Charms charges $4.99 for. It is currently
answered in the FAQ and mentioned in passing on the product page. It deserves `/charms/custom`.

### 5. The comparison pages claim a number they cannot evidence

Seven comparison pages state 75 charms. None links to a page showing them, because none exists.
A sceptical reader has nowhere to go.

## Sequenced recommendations

| # | Change | Effort | Conversion impact | Blocked on |
| --- | --- | --- | --- | --- |
| 1 | Build `/charms` and `/charms/lucky` | M | **High** — makes every existing claim verifiable | 20 display names |
| 2 | Link the 20 pages that state a count to `/charms` | S | **High** — one line each, turns assertion into evidence | 1 |
| 3 | Add the count + link to the three download pages | S | **High** | 1 |
| 4 | Home page: count and link in the product section | S | Medium-high | 1 |
| 5 | "Download free for Mac" CTA test | S | Medium | — |
| 6 | Build `/charms/custom` | S | Medium | 1 |
| 7 | Show more of the catalogue on `/products/hangly` | M | Medium | 20 display names |

**Items 2, 3 and 4 are the same change applied in three places and are nearly free once `/charms`
exists.** Everything here is blocked on the same half-day of authoring.

## One thing to avoid

Do not put a 75-charm grid on the product page, the download pages or the home page. The
catalogue belongs on `/charms`; everywhere else needs a number and a link. A grid on a conversion
page adds weight and moves the CTA further down, which is the problem the home page already has.
