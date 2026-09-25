# Search Console — manual submission order

_2026-09-25. Ranked by expected indexing value, not by how new the page is._

URL Inspection → Request Indexing has a limited daily quota, so order matters. Value here is
**commercial intent × content strength × likelihood Google has not already fetched it**.

Vision URLs are excluded per instruction.

## Tier 1 — submit first

Pages that convert, and pages whose content changed materially enough that the previously
crawled version misrepresents them.

| # | URL | Why | Status |
| --- | --- | --- | --- |
| 1 | `/products/hangly` | Highest-intent page on the site. Charm count changed from an unsupported 80+ to a derived 75 | Changed |
| 2 | `/download` | Primary conversion route, 31 inbound | New-ish |
| 3 | `/download/windows` | Owns "windows arm64" and "smartscreen" queries, low competition | New-ish |
| 4 | `/products` | 161 → 1,250 words; the crawled version is thin and misleading | **Changed heavily** |
| 5 | `/products/hangly/stats` | Brand new. Built to be cited — derived figures with a Dataset schema | **New** |
| 6 | `/install` | HowTo schema, two sets of steps, strong objection coverage | New-ish |
| 7 | `/download/mac` | Conversion, FAQPage schema | New-ish |

## Tier 2 — submit next

Editorial pages with genuine research behind them. These earn links and citations rather than
direct conversions.

| # | URL | Why | Status |
| --- | --- | --- | --- |
| 8 | `/guides/best-mac-customization-apps` | 4,515 words, 11 products read live, entirely new URL | **New** |
| 9 | `/guides/best-desktop-pets-for-mac` | 1,590 → 5,256 words. Crawled version is a different page | **Changed heavily** |
| 10 | `/guides/desktop-goose-alternatives` | 1,313 → 4,395 words, carries a finding nobody else publishes | **Changed heavily** |
| 11 | `/products/hangly/roadmap` | Brand new, TechArticle | **New** |
| 12 | `/contact` | 93 → 1,131 words. Was thin enough to be a quality signal against the domain | **Changed heavily** |
| 13 | `/portfolio` | 230 → 1,172 words | **Changed heavily** |
| 14 | `/changelog` | New-ish, now with filters and per-release anchors | Changed |

## Tier 3 — let the sitemap handle these

Already indexed, unchanged or changed only in wording. Submitting them wastes quota.

`/faq`, `/compare`, `/guides`, the eight `/compare/*` pages, the four unchanged `/guides/*`
pages, `/about`, `/products/hangly/privacy`.

The charm-count wording changed on most of these, but a phrase edit is not a reason to spend a
submission. The sitemap `lastmod` will carry it.

## Sequence

1. **Submit the sitemap first**, before any individual URL. `https://www.sharancreatedthis.in/sitemap.xml`
2. `npm run ping` — IndexNow reaches Bing and Yandex. Google ignores it, so step 1 is not optional.
3. Work Tier 1 in order, then Tier 2. Roughly 7 per day is a comfortable pace.
4. `npm run google -- sitemaps` after 48 hours to confirm Google fetched it and found 35 URLs.
5. `npm run google -- errors` after a week.

## What to expect

- **New URLs** typically index within 3–14 days with a sitemap and internal links. All 35 pages
  are within 2 clicks of home and none is an orphan, which is the strongest lever available.
- **Heavily changed pages** are slower. Google re-evaluates rather than re-indexing fresh, and a
  page previously judged thin carries that judgement for a while. `/contact`, `/products` and
  `/portfolio` are in this group — expect weeks, not days.
- **Do not resubmit** anything that has not changed again. It does not help.

## One risk worth naming

The three heavily expanded pages went from under 250 words to over 1,100 in a single deploy,
alongside 10 other new or rewritten URLs. That is a large proportion of a 35-page site changing
at once, and it can read as a site-wide overhaul rather than incremental improvement.

Nothing about it is manipulative — the content is real, researched and attributed — but expect
ranking movement in both directions for a few weeks before it settles. Do not react to week-one
data.
