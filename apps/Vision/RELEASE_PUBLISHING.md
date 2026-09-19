# Publishing Vision Releases

Vision updates itself with [Sparkle 2](https://sparkle-project.org). The app polls
one feed, and everything it needs to trust an update is signed:

| What | Where |
| --- | --- |
| Feed the app polls | `https://www.sharancreatedthis.in/products/vision/appcast.xml` |
| Archives it points at | `https://downloads.sharancreatedthis.in/Vision-<version>.dmg` |
| Feed in this repo | `website/public/products/vision/appcast.xml` (committed) |
| Archives in this repo | `releases/Vision/` (git-ignored — build output) |

The feed and the archive live in different places on purpose. **The feed can never
move**: `SUFeedURL` is compiled into every copy ever shipped, so a copy that cannot
reach that exact URL never updates again. The **archive** is served from R2 because
the site runs on Cloudflare Pages, which rejects any file over 25 MiB — Vision's is
comfortably under today, but Hangly's is not, and one bucket for both is one thing
to reason about rather than two.

The website is in this same repository, so the script writes the feed straight into
it. Publishing a Vision release is one command and a push.

## Cutting a release

1. **Bump the version** in the Xcode project. Sparkle compares `CFBundleVersion`, so
   `CURRENT_PROJECT_VERSION` *must* go up — a release that reuses a build number is
   invisible to every copy already installed.

2. **Write the release notes** (optional) as an HTML fragment at
   `releases/Vision/Vision-<marketing version>.html`. No `<html>` or `<body>`
   wrapper — Sparkle embeds the fragment into the feed and shows it in the update UI.

3. **Build, sign, upload and regenerate the feed:**

   ```bash
   ./apps/Vision/scripts/release-update.sh
   ```

   It builds the Release DMG, copies it to `releases/Vision/`, signs it with the
   EdDSA key in your login keychain, rewrites `website/public/products/vision/appcast.xml`,
   and uploads the archive to the `sharancreatedthis-downloads` R2 bucket — in that
   order, so the file uploaded is the file the feed was signed against.

   Then it checks its own work: it downloads the object back from
   `downloads.sharancreatedthis.in` and stops unless the bytes served hash to the
   bytes signed *and* the signature in the feed verifies against them.

   | Flag | Effect |
   | --- | --- |
   | `--skip-build` | reuse the DMG already in `apps/Vision/build/` |
   | `--skip-upload` | leave R2 alone; you upload the archive yourself |

   Uploading needs a Cloudflare login wrangler can use: `npx wrangler login`, or a
   `CLOUDFLARE_API_TOKEN` in the environment with **Object Read & Write** on that
   bucket.

4. **Commit the appcast and push.** Cloudflare Pages publishes it. Nothing else has
   to be copied anywhere: the archive is already in R2.

## No signature is ever typed

This used to end with `build_release_no_account.sh` printing a `sign_update` line
and the instruction *"COPY THE ABOVE ATTR STRING INTO appcast.xml"*. That hand-copy
is how the published feed came to carry a signature that did not verify against the
DMG it pointed at — an update Sparkle would download and then refuse to install,
silently, for anyone on an older build.

`generate_appcast` signs the archive and writes the feed in one step from the same
bytes, so the two cannot disagree. Never hand-edit the appcast; re-run the script.
The one attribute no signature covers is an enclosure's `url`, and even that is
better changed in the script's `DOWNLOADS_BASE` so the next release does not quietly
put the old address back.

## Why the app is ad-hoc signed

`generate_appcast` refuses to publish an app that is not properly code signed. The
build used to pass `CODE_SIGNING_ALLOWED=NO`, which left the app *linker-signed* —
enough to run, not enough for Sparkle — and that is the real reason releases were
assembled by hand.

The build now signs ad-hoc (`CODE_SIGN_IDENTITY="-"`), like Hangly. That needs one
entitlement: the hardened runtime is on and Sparkle ships as an embedded framework,
so library validation asks for a matching Team ID, an ad-hoc signature has none, and
dyld refuses the framework — the app would not launch at all. `Vision.entitlements`
carries `com.apple.security.cs.disable-library-validation` for exactly as long as
the signature is ad-hoc; a Developer ID build signs app and framework with one team
and needs neither.

## The signing key

The same EdDSA key signs Hangly and Vision. It lives in your **login keychain**,
never in this repo, and its public half is `SUPublicEDKey` in `Vision/Info.plist`;
the script refuses to run if the two stop matching. Losing it means every installed
copy stops being updatable, because the public half is compiled into the copies
people already have.

## Verifying an update actually installs

1. Build and install a copy with a *lower* `CURRENT_PROJECT_VERSION` than the feed's
   newest item.
2. Let it check, or use the in-app check.
3. Watch it download, verify and relaunch. A signature that does not match shows up
   here as a download that refuses to install — the failure the old hand-copied
   process produced, and the one the script's verification step now catches before
   anybody sees it.
