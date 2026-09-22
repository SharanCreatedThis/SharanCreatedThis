# Roadmap

Where Sharan Created This is going, in the order it gets there. Phases are
sequential because each one feeds the next: the portfolio earns the traffic, the
products convert it, and the writing is what makes either findable without
paying for it.

Dates are deliberately absent. A phase ships when it is ready.

---

## Phase 1 — Portfolio Launch ✅ shipped

The site itself: home, portfolio, products, about, contact, and a product page
each for Hangly and Vision.

- [x] Editorial home page and portfolio
- [x] Hangly and Vision product pages
- [x] Sparkle update infrastructure for both Mac apps
- [x] Cloudflare Pages + R2 hosting
- [x] Technical SEO: metadata, canonicals, sitemap, robots, structured data
- [ ] Search Console and Bing Webmaster verified — see `docs/seo-setup.md`
- [ ] GA4 and Clarity connected

## Phase 2 — Hangly Expansion

Hangly is the product with the widest audience and the shortest explanation.

- [ ] Windows out of beta — leaves 0.9.x, drops the Beta badge, and lets the
      download links use GitHub's `latest` alias instead of a pinned tag
- [ ] The six unfinished collections finished: Football, Stranger Things,
      Singers, Breaking Bad, Friends, Dream Catcher — real charm names in place
      of "Football charm 1". Their artwork now renders using the plain drawing;
      what is still missing is the *connected* rendering with the hanging thread
      drawn in, which is per-charm artwork. Drop the files into
      `public/charms/connected/` and the next build picks them up on its own.
- [ ] Per-collection pages, so each collection can rank on its own terms
- [ ] Charm artwork optimised — several SVGs are over 500 KB of embedded raster

## Phase 3 — Vision Expansion

- [ ] Windows or Linux, if the recognition stack can follow
- [ ] A documentation section rather than one docs page
- [ ] A short demo film, which is the only honest way to show what it does

## Phase 4 — Photography Portfolio

- [ ] A photography section that is not a link out to Behance
- [ ] Per-series pages with real captions, locations and dates
- [ ] `ImageObject` structured data, so the images can rank in Google Images
- [ ] Print enquiries

## Phase 5 — Blog

The first thing on this list that compounds. Everything above is a fixed number
of pages; writing is the only part that keeps adding surface area.

- [ ] Writing on filmmaking, colour, and shipping small software alone
- [ ] MDX, RSS feed, `Article` structured data
- [ ] `BreadcrumbList` once the URLs nest

## Phase 6 — Creator Store

- [ ] Presets, LUTs, and charm packs
- [ ] Payments and licence delivery
- [ ] `Product` and `Offer` structured data with real prices

## Phase 7 — Future Products

- [ ] Whatever the next one is
- [ ] A shared release pipeline, so a third app costs less than the second did
- [ ] One update infrastructure covering Sparkle and Velopack together

---

## Standing constraints

These hold across every phase. Breaking one breaks software already installed on
other people's machines.

| Never change | Why |
|---|---|
| `/products/hangly/appcast.xml` (on `www`) | Compiled into every installed copy of Hangly as its `SUFeedURL` |
| `/products/vision/appcast.xml` (on the **apex**) | Same, for Vision — note the different host |
| `/products/*/download` | Published everywhere; must always resolve to the newest build |
| `public/products/vision/release-notes.html` | Sparkle renders it inside the update dialog |

New pages go in `PAGES` in `website/src/lib/seo.ts`. The build fails if one does
not — see `website/scripts/check-seo.mjs`.
