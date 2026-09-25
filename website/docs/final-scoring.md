# Final scoring

_2026-09-25. Vision excluded per instruction._

## Scores

| Dimension | Score | Basis |
| --- | --- | --- |
| **SEO** | 10/10 | 16/16 automated checks, measured from `out/` |
| **GEO** | 10/10 | 7/7 automated checks |
| **AEO** | 10/10 | 7/7 automated checks |
| **Authority** | **5/10** | Judgement — see below |
| **Indexing readiness** | **8/10** | Technically ready; unproven in the index |
| **Conversion** | **6/10** | 3 pages with no CTA, 2 with a buried one |

**The first three deserve an immediate caveat.** They mean *every check I defined passes*. They
do not mean the site is perfect, and a 10/10 that is self-graded against self-chosen criteria is
worth exactly as much as the criteria. The checks are listed individually with their measurements
in `docs/indexability-audit.md` so you can judge whether the bar is where you would set it.

The three honest scores are the last three.

---

## What prevents a genuine 10/10

### SEO — the checks pass, two things they do not check

1. **`/faq` and `/products/hangly` are 110 shared sentences** with identical 50-question FAQPage
   blocks on both. Real duplicate content and real cannibalisation. The validator checks duplicate
   titles, descriptions and canonicals — not body text — so it passed a site with a substantial
   duplication problem. *Fix: split the FAQ, and add a body-duplication check.*
2. **Nothing has been measured on live infrastructure.** No Lighthouse run, no Core Web Vitals,
   no mobile profile. Layout inspection found no problems, but inspection is not measurement.

### GEO — the graph is clean, the entity is not yet corroborated

7/7 on structure: 119 nodes, 0 dangling, five core entities on 36/38 pages, ownership edges in
both directions. That is as good as on-site GEO gets.

What is missing is **off-site corroboration**. `sameAs` points at Instagram, LinkedIn, Behance
and GitHub. There is no Wikipedia entry, no Crunchbase, no Product Hunt listing, no press
coverage, no third-party review of either app. A knowledge graph believes an entity because
independent sources agree on it, and right now every claim about Sharan Created This originates
from Sharan Created This.

That is not a code problem and cannot be fixed in this repository.

### AEO — answerable, but not about everything

7/7 on structure. The gap is coverage, from `docs/authority-roadmap.md`:

- "What charms does Hangly include?" — **no page lists them.** 75 charms, 0 pages.
- "Does Hangly have Diwali or Halloween charms?" — we ship 20 seasonal charms and name them
  nowhere.
- "Is Hangly safe?" — answered, but on a page not titled for the question.
- "How do I uninstall it?" — an FAQ answer, not a page.

Every one of these is a thing that already exists and no page surfaces. A `/charms` index fixes
most of them.

### Authority — 5/10, and this is the real ceiling

The lowest score and the honest one.

**What is genuinely strong:**
- Original research nobody else publishes: Desktop Goose's Mac build stalled at 0.22, the
  Bartender 7 / macOS 27 split, the Cat Fidget domain correction.
- Three guides at 4,400–5,300 words with primary sources and dates.
- Every published figure derived from source at build time.
- The site now ranks 1–4 for its core category query.

**What holds it at 5:**
- **No inbound links from anywhere.** This is the single largest constraint on the entire site
  and nothing in this repository can change it.
- **Four older guides at 1,079–1,390 words** are markedly weaker than the three rewritten ones and
  drag the domain average.
- **Five of eight comparison pages** are against competitors who publish almost nothing, so the
  tables read "Not published" repeatedly. Honest, but not authoritative.
- **A self-published claim problem, now fixed but instructive.** "80+ charms" was on the live
  site in 15 files for months, including in comparison tables criticising rivals for not
  publishing counts. Search engines were surfacing that figure. It was wrong. The count is now
  derived and guarded, but the episode is the reason authority is not scored higher: authority is
  a record of being right, and that record is short.

### Indexing readiness — 8/10

Ready: 35 pages, 0 orphans, max depth 2, median 24 inbound links, all in the sitemap, IndexNow
submitting cleanly, no crawl errors.

Not yet proven: nothing has been submitted for the new URLs, no Search Console data exists for
them, and three pages changed from under 250 words to over 1,100 in a single deploy. Expect
volatility. The submission order is in `docs/search-console-submission-order.md`.

### Conversion — 6/10

From `docs/conversion-audit.md`, Hangly-only findings:
- `/products/hangly/privacy` — 742 words, one outbound link, no CTA. Read by cautious buyers who
  are close to converting.
- The home page's first download link is at 66% depth.
- The Hangly hero CTA renders as a `<button>` before platform detection resolves, so it is
  invisible to anything not executing JavaScript.
- No CTA label anywhere contains the word "free".

---

## The five things that would move the numbers most

| # | Change | Moves | Effort | In this repo? |
| --- | --- | --- | --- | --- |
| 1 | Split the FAQ between `/faq` and `/products/hangly` | SEO 10 → genuinely 10 | S | Yes |
| 2 | Build `/charms` and `/charms/seasonal` | AEO, Authority | M | Yes |
| 3 | Re-research the four older guides | Authority | L | Yes |
| 4 | Fix the three no-CTA pages and the home-page CTA depth | Conversion 6 → 8 | S | Yes |
| 5 | Earn inbound links — Product Hunt, press, a listing anywhere | Authority 5 → 7+ | — | **No** |

Item 5 is the binding constraint and the only one that cannot be done here. The site is now
technically better than its authority justifies; the work that remains is mostly not code.
