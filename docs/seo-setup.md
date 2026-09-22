# Connecting the site to search engines and analytics

Everything in this guide is a one-time setup done outside the repository. The
code side is already in place; what is left is proving you own the domain and
pasting four IDs into Cloudflare.

**Read this first: the site is on Cloudflare Pages, not Vercel.** The project is
`sharancreatedthis`, it deploys from `main` automatically, and environment
variables are set in the Cloudflare dashboard, not with `vercel env`.

---

## The four environment variables

All four are public strings — they end up in the page source by design, and none
of them is a secret. They live in the environment so a token can be rotated
without a commit, and so preview builds stay out of the production analytics
property.

Set them in **Cloudflare dashboard → Workers & Pages → sharancreatedthis →
Settings → Variables and Secrets → Production**, then redeploy.

| Variable | Looks like | Set in which step |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `google-site-verification=abc123…` value only | 1 |
| `NEXT_PUBLIC_GA_ID` | `G-5WXREN35KS` — already set in `.env.production` | 2 |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | a 32-character hex string | 3 |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | `abcdefghij` | 4 |
| `INDEXNOW_KEY` | 32 hex characters you invent | 6 |

Anything left unset is skipped cleanly: no tag is emitted, no script is loaded,
nothing errors. The site works fully without any of them.

---

## 1. Google Search Console

Search Console is the only place that tells you what Google actually did with
the site — which pages it indexed, which it refused, and what people searched
before they clicked.

**Verify by DNS, not by HTML tag.** DNS verification covers the apex, the `www`
host and every subdomain at once, including `downloads.sharancreatedthis.in`,
and it survives any future change of host. The HTML tag only ever proves one
hostname and breaks the moment a deploy goes wrong.

1. <https://search.google.com/search-console> → **Add property** → **Domain** →
   `sharancreatedthis.in`
2. Google shows a `TXT` record. In **Cloudflare → DNS → Records**, add:
   - Type `TXT`, Name `@`, Content `google-site-verification=…`
   - Proxy status is irrelevant for TXT; leave it as-is
3. Wait a minute, click **Verify**

Then, whether or not you also do the meta tag:

4. **Sitemaps** → submit `sitemap.xml`
5. **Settings → Crawl stats** — check back in a week
6. **Indexing → Pages** — this is where you find out if anything was excluded

**Optionally also** set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the value of
the HTML-tag method. It is belt and braces: if the DNS record is ever removed,
the meta tag keeps the property verified.

### Which property to add

Add the **Domain** property (`sharancreatedthis.in`). It reports on the apex and
`www` together, which matters here because both hosts currently serve the site
and Vision's update feed lives on the apex while Hangly's lives on `www`.

---

## 2. Google Analytics 4

1. <https://analytics.google.com> → **Admin → Create → Property**
2. Name it `sharancreatedthis.in`, timezone **India**, currency **INR**
3. **Data streams → Add stream → Web**, URL `https://www.sharancreatedthis.in`
4. Copy the **Measurement ID** (`G-…`) into `NEXT_PUBLIC_GA_ID`. This is done:
   `G-5WXREN35KS` is committed in `website/.env.production`, because a
   measurement id is a public identifier that ships in the page source, not a
   credential. Setting the same variable in Cloudflare overrides the file
5. Redeploy, then open the site and check **Reports → Realtime**

### What is already instrumented

Page views fire on first load *and* on every client-side navigation. This is
worth knowing about: the site is a single-page app after the first request, so
gtag's own automatic page view fires once and never again. It is switched off
(`send_page_view: false`) and sent manually instead — otherwise every visit
would look like a one-page session and session duration would read as zero.

A `download` event fires when someone takes a build, carrying:

- `product` — `hangly`
- `platform` — `mac`, `windows-x64` or `windows-arm64`
- `source` — `recommended_button` when they took the guessed build,
  `sheet_confirmed` when they opened the chooser and picked it anyway, and
  `sheet_corrected` when they picked a different one

That last field is the useful one. A high `sheet_corrected` rate means platform
detection is guessing wrong and should be looked at.

**Mark `download` as a key event** (GA4's name for a conversion): **Admin →
Events → Mark as key event**. It has to exist before it can be marked, so fire
one download on the live site first.

### Traffic sources and session duration

Both work with no extra setup — they are derived from the page views above.
Session duration only becomes meaningful once there is more than one event per
session, which the route tracking now guarantees.

---

## 3. Bing Webmaster Tools

Worth ten minutes: Bing feeds DuckDuckGo, Ecosia and a share of ChatGPT's web
results, and it has far less competition than Google.

1. <https://www.bing.com/webmasters> → **Add site**
2. Choose **Import from Google Search Console** — it carries the verification
   and the sitemap across in one click, and is much faster than the alternative
3. If importing fails, verify manually: copy the `msvalidate.01` value into
   `NEXT_PUBLIC_BING_SITE_VERIFICATION` and redeploy
4. **Sitemaps** → submit `https://www.sharancreatedthis.in/sitemap.xml`
5. Turn on **IndexNow** — Bing then picks up changes within minutes rather than
   waiting for a crawl

---

## 4. Microsoft Clarity

Free, unlimited session recordings and heatmaps, and unlike most of the category
it does not sample.

1. <https://clarity.microsoft.com> → **New project**
2. Name `sharancreatedthis.in`, site URL `https://www.sharancreatedthis.in`
3. Copy the project ID into `NEXT_PUBLIC_CLARITY_PROJECT_ID`
4. Redeploy. Recordings appear within about half an hour

**What to watch first:** the Hangly page heatmap, specifically whether anyone
scrolls as far as the collections, and whether the "All platforms" link under
the download button gets used.

---

## 5. Apple

There is nothing to sign up for. Applebot indexes the open web for Siri and
Spotlight suggestions, and it is explicitly allowed in `robots.txt`. Two things
make the difference and both are already in place:

- Valid `Person` structured data, which is what Siri reads
- An `apple-touch-icon.png`, which is what appears when someone adds the site to
  a home screen

---

## 6. IndexNow (Bing, Yandex, and everything downstream)

IndexNow turns discovery from days into minutes for the engines that support
it. Google does not participate; Bing, Yandex, Seznam and Naver do, and through
Bing that reaches DuckDuckGo and a share of what several AI assistants answer
with.

1. Invent a key — any 8 to 128 hex characters. `openssl rand -hex 16` will do
2. Set `INDEXNOW_KEY` in Cloudflare and redeploy. The build writes
   `public/<key>.txt` containing the key, which is how ownership is proved
3. Confirm `https://www.sharancreatedthis.in/<key>.txt` returns the key
4. After each deploy, run `npm run ping` from the repository

It is deliberately not part of the build: every preview and every local
`npm run build` would otherwise announce itself to the outside world. Without
the variable set, the key file is never written and the ping does nothing.

## Deployment checklist

The build itself enforces most of this — `scripts/check-seo.mjs` fails the build
if a page is missing from the sitemap, if `robots.txt` has no sitemap line, or
if `favicon.ico` or the manifest did not make it into `out/`.

Before a release:

- [ ] `npm run build` passes, including `check-seo`
- [ ] `npx tsc --noEmit` is clean
- [ ] Any new page has an entry in `PAGES` in `src/lib/seo.ts`
- [ ] Any new page has an OG card in `public/og/`

After a deploy:

- [ ] `/robots.txt` is ours and not Cloudflare's generated one — it must begin
      `User-Agent: *` and contain a `Sitemap:` line. Cloudflare injects its own
      AI-content-signals file when a site has none, and that file has no
      directives at all. If ours does not appear, check **Cloudflare → AI Crawl
      Control → Manage robots.txt** and turn the managed file off.
- [ ] `/sitemap.xml` returns 200 as `application/xml`
- [ ] `/favicon.ico`, `/icon.png`, `/apple-touch-icon.png`, `/manifest.webmanifest`
      all return 200
- [ ] `/humans.txt` returns 200
- [ ] No charm images 404 on `/products/hangly` — open DevTools → Network and
      filter for `charms`. Thirty of them used to.
- [ ] `/products/hangly/download` still 302s to the newest DMG
- [ ] `/products/vision/download` still 302s to the newest DMG
- [ ] `/products/hangly/appcast.xml` and `/products/vision/appcast.xml` are
      byte-identical to the repository and serve as `application/xml`
- [ ] Paste the home, Hangly and Vision URLs into
      <https://search.google.com/test/rich-results> — Person, Organization,
      WebSite and SoftwareApplication should all be detected with no errors
- [ ] Paste them into <https://www.opengraph.xyz> and confirm the card renders
- [ ] GA4 Realtime shows your own visit

---

## Validating what is deployed

Every one of these takes a URL. Use the `www` host: it is the canonical one, and
a validator pointed at the apex will report on a page whose canonical tag names
somewhere else.

### Structured data

| Tool | URL | What it checks |
|---|---|---|
| Google Rich Results Test | <https://search.google.com/test/rich-results> | Only the types Google can show a rich result for: FAQ, Breadcrumb, SoftwareApplication. It says nothing about Person or CreativeWork, which is not a failure |
| Schema Markup Validator | <https://validator.schema.org> | Every type, against schema.org itself. This is the one to use for Person, Organization, WebSite and the portfolio's CreativeWork nodes |
| Bing URL Inspection | Bing Webmaster Tools → **URL Inspection** | Bing reads the same JSON-LD; no separate markup is needed |

Worth testing, and what each should report:

```
https://www.sharancreatedthis.in/                  Person, Organization, WebSite
https://www.sharancreatedthis.in/portfolio         + CollectionPage, 9 CreativeWork nodes
https://www.sharancreatedthis.in/products/hangly   + BreadcrumbList, SoftwareApplication
https://www.sharancreatedthis.in/products/vision   + BreadcrumbList, FAQPage, SoftwareApplication
```

From a terminal, which is faster than any of them for a quick check:

```sh
curl -s https://www.sharancreatedthis.in/portfolio \
  | grep -o '<script type="application/ld+json">[^<]*' \
  | sed 's/.*json">//' | python3 -m json.tool | head -40
```

### Social cards

| Tool | URL |
|---|---|
| Open Graph, all platforms | <https://www.opengraph.xyz> |
| Facebook Sharing Debugger | <https://developers.facebook.com/tools/debug/> |
| LinkedIn Post Inspector | <https://www.linkedin.com/post-inspector/> |

X retired its own Card Validator. X reads the same `twitter:` tags, and the
quickest honest check is to paste the URL into a draft post and look at the
preview without sending it.

**Both Facebook and LinkedIn cache aggressively.** After changing an OG image,
use the Debugger's *Scrape Again* and the Inspector's *Inspect* to force a
refetch, or the old card persists for days.

### Everything at once

```sh
for p in / /portfolio /products /products/hangly /products/vision /about /contact; do
  echo "== $p"
  curl -s "https://www.sharancreatedthis.in$p" \
    | grep -oE '<meta (property|name)="(og:|twitter:)[^>]*>' \
    | sed 's/^/   /'
done
```

---

## The one thing still outstanding

**The apex and `www` both serve the site, and neither redirects to the other.**
To a search engine that is two identical sites. The canonical tags now point
every page at `www`, which resolves it for ranking purposes, but a redirect is
the real fix.

It has not been done here because it is an infrastructure change with a real
hazard attached: **Vision's `SUFeedURL` is compiled against the apex**, and
every installed copy reads `https://sharancreatedthis.in/products/vision/appcast.xml`.
Sparkle does follow redirects, so an apex → `www` 301 is safe in principle — but
it should be made deliberately and verified against a real Vision install before
it is trusted, not slipped in alongside a metadata change.

When you do it: **Cloudflare → Rules → Redirect Rules**, `sharancreatedthis.in/*`
→ `https://www.sharancreatedthis.in/$1`, status 301. Then confirm an older Vision
build still finds, downloads and installs an update.
