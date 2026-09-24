# Migrating the site from Vercel to Cloudflare Pages + R2

The repository is ready for Cloudflare. Nothing has been deployed there, no DNS has
moved, and the site is still served by Vercel — which keeps working because the
build emits redirects for both hosts.

---

## What is already done

- **Static export.** `next.config.ts` sets `output: "export"`. The site has no API
  routes, no middleware, no revalidation and no dynamic segments, so nothing is lost.
- **Download redirects for both hosts.** `scripts/generate-download-redirects.mjs`
  runs before every build and writes `public/_redirects` (Cloudflare) and
  `vercel.json` (Vercel) from the Sparkle feeds. `output: "export"` makes
  `next.config`'s `redirects()` dead, which is why the logic moved here.
- **Feed headers.** `public/_headers` serves the appcasts as XML with a five-minute
  cache, and release archives as immutable.

## What is deliberately not done yet

- `@vercel/analytics` is still in the app. It reports to `/_vercel/insights`, which
  only exists on Vercel, so it is removed at cutover and replaced with the
  Cloudflare Web Analytics beacon — not before.
- `vercel.json` is committed and stays until DNS has moved. It is the only thing
  keeping `/products/*/download` working on Vercel.
- The DMGs are still in `public/`. They move to R2 at cutover.

---

## The rule that governs everything

**Two feed URLs can never change, and never break:**

| Product | `SUFeedURL` compiled into every installed copy |
|---|---|
| Hangly | `https://www.sharancreatedthis.in/products/hangly/appcast.xml` |
| Vision | `https://www.sharancreatedthis.in/products/vision/appcast.xml` |

**Corrected 2026-09-24.** This table previously said Vision's feed was on the
apex. It is not: `CFBundleVersion 3` inside `Vision-1.1.dmg` declares
`SUFeedURL = https://www.sharancreatedthis.in/products/vision/appcast.xml`,
read straight from the shipped app's Info.plist. **Both products read `www`.**

That materially lowers the risk of the apex → www redirect, which had been
deferred on the belief that Vision depended on the apex. Nothing installed
does. The redirect still deserves the verification in
[apex-to-www-plan.md](./apex-to-www-plan.md) — a rule that drops the path would
still break `www` requests — but the specific hazard that justified waiting
turns out not to exist.

> **Mandatory cutover item: the apex → www redirect must exist on Cloudflare before
> DNS moves.** Without it every installed copy of Vision silently stops updating.
> Cloudflare does not do this by itself — create a Redirect Rule:
> `sharancreatedthis.in/*` → `https://www.sharancreatedthis.in/$1`, status 301.

---

## Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git**, repository
   `SharanCreatedThis/SharanCreatedThis`.
2. Build configuration:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `npm run build`
   - Build output directory: `out`
   - **Root directory: `website`** — the site is not at the repository root.
3. Deploy. The first build serves at `<project>.pages.dev`. Test everything there.
4. Attach the custom domain only at cutover.

**Before R2, Pages strips the oversized archive rather than failing.** Pages rejects
any file over 25 MiB and `Hangly-2.0.0.dmg` is 32.65 MiB, so `postbuild` removes it
from `out/` on Pages builds only — `CF_PAGES` is set there and nowhere else. The file
stays committed, because Vercel still serves production and the Hangly appcast points
at its copy; deleting it would break updates for every installed copy. On those
builds the download redirects point at the copies Vercel is serving, so the preview
works too.

**That arrangement has an expiry.** It points at `www.sharancreatedthis.in`, which
stops being Vercel the moment DNS moves. Set `DOWNLOADS_BASE` and remove the archives
from `public/` *before* the cutover, not after.

## R2

1. **R2 → Create bucket**, name `downloads`, location automatic.
2. **Settings → Public access → Custom domain**, `downloads.sharancreatedthis.in`.
   This requires the zone to be on Cloudflare. Do not use the `r2.dev` URL: it is
   rate limited and not meant for production traffic.
3. Upload, preserving the layout the redirects expect:

   ```sh
   wrangler r2 object put downloads/hangly/Hangly-2.0.0.dmg \
     --file website/public/products/hangly/releases/Hangly-2.0.0.dmg \
     --content-type application/x-apple-diskimage

   wrangler r2 object put downloads/vision/Vision-1.1.dmg \
     --file website/public/products/vision/Vision-1.1.dmg \
     --content-type application/x-apple-diskimage
   ```

   Check the flags against `wrangler r2 object put --help` first; recent versions
   differ on whether `--remote` is needed to write to the real bucket.
4. Verify each object downloads over the custom domain and its bytes still match
   the signature in the feed:

   ```sh
   curl -sL -o /tmp/x.dmg https://downloads.sharancreatedthis.in/hangly/Hangly-2.0.0.dmg
   sign_update /tmp/x.dmg    # must print the signature already in the appcast
   ```

   Re-signing is never needed: the signature covers the file's bytes, not its URL.

---

## Cutover, in an order that keeps rollback cheap

**Stage 1 — move the zone, change nothing else.** Add the domain to Cloudflare, copy
every existing DNS record exactly as GoDaddy has it (`www` → Vercel, apex → Vercel),
set them **DNS-only (grey cloud)**, then change the nameservers at the registrar.
Hosting does not change; the site stays on Vercel. This separates the slow,
hard-to-revert step from the risky one, so everything after it reverts in seconds.

**Stage 2 — R2, while Vercel still serves.** Create the bucket, attach the subdomain,
upload both DMGs, verify. Nothing points at them yet.

**Stage 3 — repoint the feeds at R2.** Regenerate Hangly's appcast with
`--download-url-prefix https://downloads.sharancreatedthis.in/hangly/`, edit Vision's
enclosure URL by hand, commit, let Vercel deploy, and confirm both updaters still
work. Signatures do not change. Doing this while Vercel still serves proves R2
delivery independently of the host switch.

**Stage 4 — Pages.** Deploy, test on `pages.dev`, then:

```sh
DOWNLOADS_BASE=https://downloads.sharancreatedthis.in npm run build
```

commit the regenerated `_redirects`, and delete the DMGs from `public/`.

**Stage 5 — switch.** Point `www` at Pages, add the apex → www Redirect Rule, remove
`@vercel/analytics`, add the Cloudflare beacon, delete `vercel.json`.

**Stage 6 — clean up.** Delete the Vercel project after a week of clean logs.

---

## Verification checklist before switching DNS

Run against the `pages.dev` preview.

- [ ] Every route returns 200: `/`, `/about`, `/contact`, `/portfolio`, `/products`,
      `/products/hangly`, `/products/hangly/privacy`, `/products/vision`,
      `/products/vision/docs`; an unknown path returns 404
- [ ] `/products/hangly/appcast.xml` is byte-identical to the one in the repository
      and serves as `application/xml`
- [ ] `/products/vision/appcast.xml` likewise
- [ ] `/products/vision/dev/appcast.xml` parses and has no items
- [ ] `/products/hangly/download` → 302 → R2 → 200, full file
- [ ] `/products/vision/download` → 302 → R2 → 200, full file
- [ ] `sign_update` on each downloaded file reproduces the signature in its feed
- [ ] A real Hangly build with an older `CFBundleVersion` finds, downloads and
      installs the update
- [ ] **Apex → www redirect exists**, because Vision's feed URL is on the apex
- [ ] `_headers` applied: `X-Content-Type-Options` present, `_next/static` immutable
- [ ] The deploy succeeded at all, which proves no file exceeds 25 MiB

## Rollback

- Before DNS moves: `git revert` the migration commit. Vercel redeploys the previous
  behaviour; `vercel.json` keeps the download URLs alive throughout.
- After DNS moves: point `www` back at Vercel, whose project is still live and whose
  last deployment is still serving. Keep the Vercel project until stage 6.
- Reverting the nameservers is the slow one, hours rather than seconds, which is why
  stage 1 changes nothing but the nameservers.
