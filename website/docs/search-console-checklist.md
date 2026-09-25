# Search Console checklist

A working routine for Search Console and Bing, written against the tooling that already exists
in this repository. Every command below is real and runnable from `website/`.

Credentials live in `.env.local` and nowhere else. Nothing in this document requires pasting a
token anywhere.

---

## The commands you have

| Command | What it does |
| --- | --- |
| `npm run google:doctor` | Checks the service account can reach Search Console and both GA4 APIs |
| `npm run google -- pages` | Impressions, clicks, CTR and position per page |
| `npm run google -- countries` | Same, split by country |
| `npm run google -- sitemaps` | When Google last fetched the sitemap, and what it found |
| `npm run google -- errors` | Pages returning an explicit indexing failure |
| `npm run google -- downloads` | GA4 download events, by product and platform |
| `npm run bing` | Bing Webmaster equivalents |
| `npm run clarity` | Microsoft Clarity behavioural data |
| `npm run ping` | Submits every sitemap URL to IndexNow |
| `npm run seo:validate` | The full local validator — 35 pages, schema, links, breadcrumbs |
| `npm run site:health` | Cross-checks the live site against the build |

---

## Immediate — do these once, now

These are the actions for a site that has just grown from 9 pages to 35.

- [ ] **Confirm the property is verified.** Google is verified by DNS through the domain
      provider, which covers apex, `www` and every subdomain including
      `downloads.sharancreatedthis.in`. Nothing needs adding to the site.
- [ ] **Submit the sitemap.** `https://www.sharancreatedthis.in/sitemap.xml` in Search Console →
      Sitemaps. Then confirm with `npm run google -- sitemaps` that Google has fetched it and
      reports 35 discovered URLs.
- [ ] **Run `npm run ping`** after the deploy. IndexNow reaches Bing and Yandex immediately;
      Google ignores it, which is why the sitemap submission above is separate and necessary.
- [ ] **URL Inspection on the new pages.** Inspect and Request Indexing for each, in this order —
      highest commercial intent first, because the daily quota is limited:
      1. `/download`
      2. `/download/windows`
      3. `/download/mac`
      4. `/install`
      5. `/products/hangly/stats`
      6. `/products/hangly/roadmap`
      7. `/changelog`
      8. `/guides/best-mac-customization-apps`
      9. `/guides/best-desktop-pets-for-mac`
      10. `/guides/desktop-goose-alternatives`
- [ ] **Re-inspect the three expanded pages** — `/contact`, `/products`, `/portfolio` — since the
      content changed substantially and the previously-crawled version was thin.
- [ ] **Check the Rich Results Test** on one page of each schema type that is new:
      `/products/hangly/stats` (Dataset), `/products/hangly/roadmap` (TechArticle),
      `/install` (HowTo), `/products` (ItemList + FAQPage).
- [ ] **Import the property into Bing Webmaster Tools** from Search Console rather than verifying
      separately. It carries the verification across and backfills historical data.

---

## Weekly — fifteen minutes

- [ ] **Coverage.** Search Console → Pages. Watch for anything moving into *Discovered – currently
      not indexed*, which means Google knows the URL and has chosen not to fetch it. That is
      almost always a crawl-priority signal, and the fix is internal links rather than
      resubmission — it is exactly what happened to `/products/vision/docs` when it had one
      inbound link.
- [ ] **`npm run google -- errors`.** Only explicit failures are reported;
      `VERDICT_UNSPECIFIED` means "not evaluated" and is not a problem.
- [ ] **Rich results.** Search Console → Enhancements. FAQ, Breadcrumb, HowTo and Dataset each
      get their own report once Google has processed them. A drop in valid items usually means a
      schema change, not a penalty.
- [ ] **FAQ specifically.** Google requires FAQ answers to be visible on the page. The local
      validator enforces this on every build, so a Search Console FAQ error means something
      changed in rendering rather than in the data — check that first.
- [ ] **`npm run google -- sitemaps`.** If the last-fetched date stops moving, something is wrong
      with the sitemap or the host, and it is worth catching within a week rather than a quarter.
- [ ] **`npm run google -- downloads`.** Download events by product and platform. Watch the
      Windows x64 / ARM64 split — a sudden collapse in ARM64 usually means platform detection
      broke, which no other signal will tell you.

---

## Monthly — an hour

- [ ] **Query analysis.** `npm run google -- pages` and export. The questions worth asking:
      - Which pages gained impressions but not clicks? That is a title and description problem,
        not a ranking problem, and it is the cheapest win available.
      - Which queries are landing on the wrong page? Two pages competing for one query is
        cannibalisation; the fix is to merge or to differentiate, not to optimise both.
      - Which comparison pages rank for their competitor's brand name? That is the whole point of
        those pages, and it is the metric they should be judged on.
- [ ] **CTR optimisation.** Anything with position under 10 and CTR under 2% has a title problem.
      Rewrite the title, not the page. Titles live in one place — `PAGES` and `dynamicPages()` in
      `src/lib/seo.ts`, or the guide and comparison data files.
- [ ] **Content gap analysis.** Compare the queries Search Console reports against what the site
      actually answers. A query with impressions and no dedicated page is a candidate. The bar:
      *is there something true and specific to say that nobody else is saying?* If not, the answer
      is no page. Three well-researched guides beat thirty templated ones, and this site has
      deliberately chosen that trade.
- [ ] **Re-verify competitor claims.** Open `docs/content-verification-report.md` and re-read any
      source older than 90 days. Prices, versions and star counts move. Update both the claim and
      its `lastChecked` date in `src/lib/verification/claims.ts`.
- [ ] **Re-run the audits.** `node scripts/audit/entity-graph.mjs` and
      `node scripts/audit/conversion.mjs` after any structural change.

---

## What not to do

- **Do not request indexing repeatedly for the same URL.** It does not help and the quota is
  shared across the property.
- **Do not add a `google-site-verification` meta tag.** DNS verification is already in place and
  is stronger. The code supports the tag and deliberately leaves it unset.
- **Do not submit URLs that redirect.** `/products/hangly/download` and the two Windows routes
  are 302s by design and should never appear in the sitemap. The validator already excludes them.
- **Do not chase `Crawled – currently not indexed` on thin pages.** Fix the page instead. That
  status is a judgement about quality, and resubmitting an unchanged page re-earns the same
  judgement.
