# FAQ duplication — before and after

_2026-09-25. Measured from `out/` before and after the change._

## The problem

`/faq` and `/products/hangly` rendered the same fifty questions and answers, and each emitted a
`FAQPage` node containing all fifty. Three consequences followed from one cause:

- **Duplicate content.** 110 shared sentences between two indexable pages, neither canonical to
  the other, both in the sitemap.
- **Duplicate structured data.** Two FAQPage entities, same fifty questions. Google picks one and
  discounts the other, and not necessarily the one you want.
- **Cannibalisation.** Both pages competed for every FAQ query. `/faq` exists to own them;
  `/products/hangly` is the stronger URL, so `/faq` was likely losing.

## Before / after

| Measure | Before | After |
| --- | --- | --- |
| FAQPage blocks site-wide | 26 | **25** |
| Questions appearing in schema on more than one page | **51** | **0** |
| FAQPage blocks on `/products/hangly` | 1 (50 questions) | **0** |
| FAQPage blocks on `/faq` | 1 (50 questions) | 1 (**44** questions) |
| Sentences shared by `/faq` and `/products/hangly` | **110** | **3** |
| `/faq` unique sentences | 10% | **96%** |
| `/products/hangly` unique sentences | 29% | **94%** |

The 3 remaining shared sentences are the platform-chooser dialog, which is present in the DOM on
every page carrying a download button. That is site chrome, not content.

## What changed

### 1. `/faq` is the single canonical owner

It keeps 44 questions with full answers and the only FAQPage schema for them. Each question now
carries a stable anchor derived from its text, so any page can link to one answer rather than
restating it — `faqSlug()` in `src/data/hangly-faq.ts`.

### 2. `/products/hangly` no longer restates the FAQ

`Faq.tsx` was fifty questions and answers; it is now a signpost linking into `/faq` by section,
with a question count per section. It deliberately contains **no question text and no answers** —
a question repeated there would cannibalise the page it points at, which is the problem being
fixed rather than a smaller version of it.

`FaqJsonLd.tsx` is deleted. There is exactly one FAQPage for these questions and it is on `/faq`.

### 3. Six questions moved to the page written for them

One rule: **the most specific page owns the question.** A fifty-item list is not the best home
for a question that has a whole page devoted to it.

| Question | Now owned by |
| --- | --- |
| How large is the download? | `/products/hangly/stats` |
| What is the difference between a desktop charm and a desktop pet? | `/guides/best-desktop-charm-apps-for-mac` |
| Is Hangly a good Desktop Goose alternative? | `/compare/desktop-goose` |
| Is Hangly a Shimeji alternative? | `/compare/shimeji` |
| Is Hangly a RunCat alternative? | `/compare/runcat` |
| How do I uninstall Hangly? | `/install` |

These are marked `ownedBy` in the FAQ data. `ALL_FAQS` — which builds the schema — filters them
out, so the schema and the ownership rule cannot drift apart. On `/faq` each still appears as a
heading with a link to the page that answers it, so a reader scanning the FAQ is not sent to a
dead end. The answer and the schema entry exist once.

### 4. Two further duplicates resolved

- **`/contact`** carried "Is Hangly free?", also on `/faq`. Replaced with a question only the
  contact page would answer — what to include in a bug report — which is more useful there anyway.
- **`/compare/screen-dangle`** and **`/guides/screen-dangle-alternatives`** both asked "Is there a
  Screen Dangle alternative with ready-made charms?". The guide keeps it; the comparison now asks
  the inverse question, which is the one a reader on that page actually has.

### 5. A check, so it cannot come back

`seo-validate.mjs` now fails the build when:
- the same question appears in FAQPage schema on more than one page, or
- any page emits more than one FAQPage node.

Verified by injecting a duplicate question into a built page: the build fails naming both pages
and the question. Passes clean on restore.

The first version of this check was written but never proved, which is how the original problem
survived — the existing validator compared titles, descriptions and canonicals, and never looked
inside the structured data.

## Verification

| Requirement | Result |
| --- | --- |
| No duplicate FAQPage entities | 25 blocks, each with a unique `@id`, one per page |
| No duplicate FAQ structured data | 0 questions appear in schema on more than one page |
| No duplicate answer blocks | 110 → 3 shared sentences, all 3 being the platform dialog |
| No cannibalisation between the two pages | `/products/hangly` has no FAQ content or schema |
| Internal linking preserved | `/products/hangly` links into `/faq` five times by section plus a full-FAQ CTA; `/faq` links out to the six owning pages |
| Every question on one canonical page | Enforced at build time |

Build after the change: 35 pages, 70 JSON-LD blocks, 0 orphans, max depth 2, median 24 inbound
links, **0 errors**. SEO 16/16, GEO 7/7, AEO 7/7. No page under 250 words.

## Note

`/products/hangly` dropped from roughly 2,900 words to 1,134. That is the fifty FAQ answers
leaving, and it is the intended outcome — the page is now about the product rather than being an
FAQ with a product page attached. It remains well above any thinness threshold and every answer
it used to carry is one click away.
