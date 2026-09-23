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

| Variable | Value | Required? |
|---|---|---|
| `NEXT_PUBLIC_GA_ID` | `G-P36BKMQ2NG` | Set. Without it no analytics load |
| `NEXT_PUBLIC_CLARITY_ID` | `ymfvvjj5ij` | Set. Without it no recordings |
| `INDEXNOW_KEY` | `ddbcaf092f91e1b55e8e39c6e5d326ef` | Set. Without it no URL submissions |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | — | **Not required.** Unset on purpose — Google is verified by DNS |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | — | **Not required.** Only needed if Bing is not imported from Search Console |

All values live in `website/.env.production`, which is committed. Setting the
same name in Cloudflare overrides the file.

### Are the two verification variables required?

No. Each does exactly one thing — emit a single `<meta>` tag — and nothing else
in the codebase reads either one:

| Variable | Produces | Read by |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `<meta name="google-site-verification" …>` | `src/lib/metadata.ts` only |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | `<meta name="msvalidate.01" …>` | `src/lib/metadata.ts` only |

Both are conditional: unset means the tag is not emitted at all, rather than
emitted empty — a blank value reads as a *failed* check to some verifiers, not
an absent one. Nothing breaks, no build step depends on them, and no other
feature reads them.

**Google is verified by DNS through the domain provider, which is the better
method** and makes the tag redundant. DNS covers the apex, `www` and every
subdomain at once — including `downloads.sharancreatedthis.in` — and survives a
change of host. A meta tag proves one hostname and vanishes if a deploy breaks.

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
   `G-P36BKMQ2NG` is committed in `website/.env.production`, because a
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

### Making download events actually usable

Two steps, and the second is the one people miss.

**1. Mark `download` as a key event.** GA4's name for a conversion.
**Admin → Events → Mark as key event.** The event must have been received at
least once before it can be marked, so click a download on the live site first
and give it a few minutes.

**2. Register the parameters as custom dimensions.** This is the step that
decides whether the data is usable at all. GA4 receives `platform` and `source`
on every download event, but **it will not report on a custom parameter until
that parameter is registered** — until then the event shows up as a bare count
with no way to break it down, which looks exactly like tracking that is not
working.

**Admin → Custom definitions → Create custom dimension**, twice:

| Dimension name | Scope | Event parameter |
|---|---|---|
| `platform` | Event | `platform` |
| `source` | Event | `source` |

Registration is not retroactive. Data arriving before the dimension exists is
not backfilled, so do this early.

**A note on timing.** Custom events appear in **Realtime** and **DebugView**
within seconds, but take up to **24–48 hours** to show in the standard reports.
An empty Events report on day one means the reports have not caught up, not
that nothing was sent.

### What each value tells you

`source` is the field worth watching:

| Value | Meaning |
|---|---|
| `recommended_button` | Took the build the site guessed for them |
| `sheet_confirmed` | Opened the chooser and picked the guessed build anyway |
| `sheet_corrected` | Opened the chooser and picked a *different* build |

A high `sheet_corrected` rate means platform detection is guessing wrong and is
worth investigating.

### Traffic sources and session duration

Both work with no extra setup — they are derived from the page views above.
Session duration only becomes meaningful once there is more than one event per
session, which the route tracking now guarantees.

---

## 3. Bing Webmaster Tools

Worth ten minutes: Bing feeds DuckDuckGo, Ecosia and a share of ChatGPT's web
results, with far less competition than Google.

### The easy path — no verification value needed

1. <https://www.bing.com/webmasters> → **Add site**
2. Choose **Import from Google Search Console** and authorise it

Because Search Console is already verified by DNS, Bing accepts that proof and
carries the sitemap across in the same step. **No meta tag, and
`NEXT_PUBLIC_BING_SITE_VERIFICATION` stays unset.** This is the recommended
route.

### If the import fails — where the value actually lives

Only then is the variable needed. Bing offers three methods; the meta tag is
the one this codebase supports:

1. <https://www.bing.com/webmasters> → **Add site** → enter
   `https://www.sharancreatedthis.in`
2. On the verification screen, pick **Option 2: Copy and paste a `<meta>` tag**
3. Bing shows a line like:

   ```html
   <meta name="msvalidate.01" content="A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6" />
   ```

4. **Copy only the `content` value** — the 32-character string, not the whole
   tag. The tag itself is generated for you
5. Put it in `NEXT_PUBLIC_BING_SITE_VERIFICATION` in `.env.production`, rebuild,
   deploy, then press **Verify**

Bing's other two methods need no code: **Option 1** hosts a `BingSiteAuth.xml`
file — which would go in `website/public/` and be committed — and **Option 3**
is a DNS `CNAME`, which like Google's DNS method covers every subdomain and is
the most durable of the three.

After verification, whichever route:

- **Sitemaps** → submit `https://www.sharancreatedthis.in/sitemap.xml`
- **IndexNow** is already wired; see section 6

## 4. Microsoft Clarity

Free, unlimited session recordings and heatmaps, and unlike most of the category
it does not sample.

1. <https://clarity.microsoft.com> → **New project**
2. Name `sharancreatedthis.in`, site URL `https://www.sharancreatedthis.in`
3. Copy the project ID into `NEXT_PUBLIC_CLARITY_ID`. Done: `ymfvvjj5ij`
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

**Already set up.** Nothing to configure; this section is here so the mechanism
is not a mystery later.

IndexNow turns discovery from days into minutes for the engines that support
it. Google does not participate; Bing, Yandex, Seznam and Naver do, and through
Bing that reaches DuckDuckGo and a share of what several AI assistants answer
with.

### How it works here

| Piece | Where |
|---|---|
| The key | `INDEXNOW_KEY` in `website/.env.production` |
| The proof | `public/<key>.txt` → served at `https://www.sharancreatedthis.in/<key>.txt`. Today that is `/ddbcaf092f91e1b55e8e39c6e5d326ef.txt`. Its **name is the key and its contents are the key**, with no trailing newline. Written by `scripts/generate-indexnow-key.mjs` on every build — never by hand |
| The submission | `scripts/ping-indexnow.mjs`, run with `npm run ping` |
| The guard | `scripts/check-seo.mjs` fails the build if the key is set and the file is missing or disagrees with it |

The key is not a secret. Publishing it at a URL on this domain is the entire
proof of ownership — anyone can read it, and knowing it lets them submit URLs
for this domain and nothing else. It is committed for the same reason the GA
measurement id is.

### Submitting after a deploy

```sh
cd website && npm run ping
```

It reads every URL out of `out/sitemap.xml` and posts the list. It is
deliberately **not** part of the build: every preview and every local
`npm run build` would otherwise announce itself to Bing. It never fails
anything either — being unable to reach the API is not a reason to break a
deploy that already worked.

### Rotating the key

Change `INDEXNOW_KEY`, rebuild, deploy. The generator deletes the old key file
and writes the new one, so the two can never both be live — which matters,
because a stale key file left beside a new key is how submissions start being
accepted for a key nobody is using any more.

### When it answers 422

That means Bing could not read the key file. Check that
`https://www.sharancreatedthis.in/<key>.txt` returns 200 as `text/plain` and
contains exactly the key, with no trailing newline problems.

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
- [ ] `/ddbcaf092f91e1b55e8e39c6e5d326ef.txt` returns 200 as `text/plain` and
      contains exactly that string — IndexNow refuses submissions otherwise
- [ ] `npm run ping` reports 200 or 202
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
