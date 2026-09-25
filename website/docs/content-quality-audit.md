# Content quality audit

_2026-09-25. Repetition measured across `out/`; judgements stated as judgements._

Method: every sentence of 8–60 words on every page, normalised, counted across pages. Sentences
appearing on four or more pages are flagged, and each page is scored by the share of its
sentences that appear nowhere else.

## Headline

| Measure | Value |
| --- | --- |
| Sentences repeated across 4+ pages | 43 |
| Pages below 50% unique sentences | 6 |
| Pages below 30% unique | 2 |

---

## 1. CRITICAL — `/faq` and `/products/hangly` are the same page

**110 shared sentences.** Both render all 50 Hangly FAQs, and both emit a full `FAQPage` block
containing the same 50 questions.

| Page | FAQPage blocks | Questions | Unique sentences |
| --- | --- | --- | --- |
| `/faq` | 1 | 50 | **10%** (12 of 123) |
| `/products/hangly` | 1 | 50 | 29% (45 of 155) |

Three separate problems follow from one cause:

- **Duplicate content between two indexable pages.** Neither is canonical to the other, and both
  are in the sitemap.
- **Duplicated structured data.** Two FAQPage blocks with identical questions on one site invites
  Google to pick one and discount the other — and it will not necessarily pick the one you want.
- **Cannibalisation.** Both pages compete for every FAQ query. `/faq` exists precisely to own
  those, and the product page is the stronger URL, so `/faq` is likely losing.

The validator did not catch this because it checks duplicate titles, descriptions and canonicals,
not body text. That is a gap in the validator as much as in the content.

**Recommended fix:** the product page shows 8–10 of the highest-intent questions and links to
`/faq` for the rest; `FaqJsonLd` on the product page emits only those it displays. `/faq` keeps
all 50 and remains the canonical answer surface. This is roughly a twenty-line change and it is
the single highest-value content fix outstanding.

**Also worth adding:** a body-duplication check to `seo-validate.mjs`, so this cannot recur
silently.

---

## 2. HIGH — the platform sheet is on all 25 Hangly-family pages

Three of the four most-repeated sentences on the site are the download chooser dialog:

> "Choose your desktop — pick the one that matches your machine."
> "Windows is young — it is finding its feet."
> The full platform list: macOS 14+, Windows 10+, Windows on ARM.

It is a modal, present in the DOM on every page that carries a download button. That is normal
and the accessibility behaviour is correct — but it means ~60 words of identical boilerplate on
25 pages, and on short pages it is a meaningful share of the text.

**Judgement: leave it.** The alternative is rendering the dialog on demand, which costs
interactivity and crawlability for a duplication problem that is cosmetic. Recorded so the next
person measuring repetition knows why it is there.

---

## 3. MEDIUM — comparison verdicts appear twice

Each comparison's one-line verdict appears on `/compare` (as the index excerpt) and again on its
own page. Eight sentences, two pages each.

This is the standard index-and-excerpt pattern and is not a problem. Noted only because it
accounts for eight of the 43 flagged sentences and would otherwise look like a finding.

---

## 4. MEDIUM — the comparison pages share a skeleton

`/compare/charmly`, `/compare/dockling` and `/compare/danglejoy` sit at 48–49% unique. The shared
half is structural: the same section headings, the same framing sentences, the same closing
links, in the same order.

That structure is deliberate and defensible — a consistent shape is what lets an answer engine
find the answer without parsing the design, and it is what a person skimming expects. But at
~50% it is close to the line where a reader who visits two comparison pages notices they are
reading a template.

**Recommended improvement, in priority order:**
- The `quickAnswer` and `inShort` blocks are already unique per competitor. Good.
- The *transitions* between sections are identical. Varying those is cheap and does most of the
  work.
- `/compare/danglejoy` is the weakest at 49% with the least specific content, because DangleJoy
  publishes the least. Consider whether a competitor who publishes almost nothing earns a page,
  or whether that comparison is better as a section inside the charm-apps guide.

---

## 5. MEDIUM — `/guides/screen-dangle-alternatives` at 45%

The lowest of the guides. Its entry descriptions for Hangly, Drishti Dangle, Screen Charms and
Charmly are the shared `GuideEntry` constants, which is intentional — one description per product
so the entity graph stays consistent. On a shorter guide those shared entries dominate.

**Recommended fix:** lengthen the guide's own analysis rather than de-duplicating the entries.
The three guides rewritten yesterday run 4,400–5,300 words and sit above 60% unique; this one is
1,106 words. Length is the variable, not the shared data.

---

## 6. Does anything read as AI-generated or low-authority?

An honest assessment, since the question was asked directly.

**What holds up:**
- The three rewritten guides cite primary sources with dates, name specific version numbers, and
  recommend competitors over Hangly where that is the honest answer. The Desktop Goose finding
  (Mac at 0.22 vs 0.31, no mod support) is original research that no competing guide publishes.
- `/products/hangly/stats` and `/changelog` derive every number from source at build time.
- The comparison pages state where each rival wins.

**What does not:**
- **The remaining four older guides** — `charmly-alternatives` (1,079 words),
  `screen-dangle-alternatives` (1,106), `lucky-dangle-alternatives` (1,185),
  `best-menu-bar-customisation-apps-for-mac` (1,390) — are noticeably thinner than the three
  rewritten ones, use more shared data and less original analysis, and were written from a single
  research pass on 2026-09-24 that has not been revisited. They are the weakest content on the
  site and the most likely to read as filler.
- **Five of eight comparison pages** describe competitors who publish almost nothing, so the
  comparison tables carry "Not published" repeatedly. That is honest, but a table of unknowns is
  not compelling and does not demonstrate authority.
- **Repeated stylistic tics.** The em-dash-and-reversal construction ("It is not X — it is Y")
  appears heavily across the newer pages. It is a recognisable pattern and worth varying.

**Recommended improvements, ranked:**

| # | Change | Why |
| --- | --- | --- |
| 1 | Split the FAQ between `/faq` and `/products/hangly` | Fixes a real duplicate-content and cannibalisation problem |
| 2 | Re-research and expand the four older guides | They are the weakest content and drag the domain's average |
| 3 | Vary section transitions on the comparison pages | Cheapest way to move 48% → 60%+ unique |
| 4 | Reconsider `/compare/danglejoy` | A competitor publishing nothing may not earn a page |
| 5 | Add a body-duplication check to the validator | So finding 1 cannot recur |

Nothing here is implemented.
