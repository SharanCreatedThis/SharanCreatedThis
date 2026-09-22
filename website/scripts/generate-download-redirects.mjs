/**
 * Generates the download redirects for both hosts, from the Sparkle feeds.
 *
 * `/products/<product>/download` is a stable URL: the buttons on the site, the
 * README and anything anyone has ever linked point at it, and it has to keep
 * resolving to whatever the newest build is. The newest build is whatever the
 * Sparkle feed says it is — the updater will not install anything that is not in
 * the feed — so the feed is the single source of truth, and the button and the
 * update can never offer different builds.
 *
 * **Including the host.** The enclosure URL is used as published: R2 today, the
 * site itself for anything still served from public/. That is the whole rule, and
 * it replaces an earlier arrangement where the destination was assembled from an
 * environment variable. That arrangement broke: DNS moved to Cloudflare before the
 * variable was set, the redirect kept pointing at a path that used to be Vercel's
 * copy of the archive, and Pages does not carry that archive because it is over
 * the 25 MiB per-file limit. The button and the updater both 404ed. Reading the
 * host from the feed removes the possibility: to move a download somewhere else,
 * put it there and say so in the appcast.
 *
 * Two files come out, because two hosts can serve this site:
 *
 *   public/_redirects   Cloudflare Pages, which serves production.
 *   vercel.json         Vercel, kept until that project is decommissioned.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** The site's own origin, so a same-origin enclosure becomes a plain path. */
const siteOrigins = new Set([
  "https://www.sharancreatedthis.in",
  "https://sharancreatedthis.in",
]);

/** Each product's feed, and the prefix its files take inside the R2 bucket. */
const products = [
  { name: "hangly", feed: "public/products/hangly/appcast.xml" },
  { name: "vision", feed: "public/products/vision/appcast.xml" },
];

/**
 * The Windows builds of Hangly, which do not come from a Sparkle feed.
 *
 * Windows updates through Velopack, whose feed lives inside the release itself,
 * so there is no local file to read the newest build out of the way the appcast
 * is read above. The newest release is asked of GitHub at build time instead.
 *
 * `/releases/latest/download/<asset>` would need no build step at all — the
 * asset names are already version-free — but `latest` skips pre-releases, and
 * every Windows build so far is one. Hence the API call, which does not skip
 * them. Switch to `latest` and delete all of this once Windows leaves beta.
 *
 * Unlike the appcasts, a failure here does not fail the build. The API is
 * unauthenticated and rate limited per IP, and Pages builds run from shared
 * addresses, so a refusal is a question of whose build ran before yours rather
 * than of anything being wrong. The pinned tag below answers it: an older build
 * that installs and then updates itself on first launch, which is what Velopack
 * is for. Set GITHUB_TOKEN to raise the limit from 60 requests an hour to 5000.
 */
const windows = {
  repository: "SharanCreatedThis/Hangly-Windows",
  // Used when the API cannot be reached. Worth moving forward now and then, but
  // nothing breaks while it lags: it only has to be a real release.
  fallbackTag: "v0.9.4",
  // The installers, not the .nupkg packages: those are what Velopack feeds the
  // updater, and a person who downloads one has nothing that will open it.
  builds: [
    { slug: "windows-x64", asset: "Hangly-win-x64-Setup.exe" },
    { slug: "windows-arm64", asset: "Hangly-win-arm64-Setup.exe" },
  ],
};

/**
 * The newest published release's tag, pre-releases included, or null.
 *
 * Ordered by creation date by the API, which is what "newest" should mean here:
 * tags are sorted as strings elsewhere and v0.9.10 would lose to v0.9.9. Drafts
 * are invisible to an unauthenticated caller and excluded anyway, because their
 * assets are not downloadable.
 */
async function newestWindowsTag() {
  const url = `https://api.github.com/repos/${windows.repository}/releases?per_page=10`;
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "sharancreatedthis-website-build",
        ...(process.env.GITHUB_TOKEN
          ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`GitHub answered ${response.status}`);

    const release = (await response.json()).find(
      (candidate) =>
        !candidate.draft &&
        // Only a release that actually carries every installer. A release
        // published while its assets are still uploading would otherwise win
        // and point both buttons at a 404.
        windows.builds.every(({ asset }) =>
          candidate.assets?.some((uploaded) => uploaded.name === asset),
        ),
    );
    if (!release) throw new Error("no release carries both installers yet");
    return release.tag_name;
  } catch (error) {
    console.warn(
      `  ! could not ask GitHub for the newest Windows release (${error.message});` +
        ` falling back to ${windows.fallbackTag}`,
    );
    return null;
  }
}

const windowsTag = (await newestWindowsTag()) ?? windows.fallbackTag;

const windowsRoutes = windows.builds.map(({ slug, asset }) => ({
  name: `hangly (${slug})`,
  from: `/products/hangly/download/${slug}`,
  to: `https://github.com/${windows.repository}/releases/download/${windowsTag}/${asset}`,
  offSite: true,
}));

/**
 * The newest enclosure in a feed, by build number rather than by position.
 *
 * Deliberately strict: a feed that cannot be read, or that carries no enclosure,
 * fails the build. The alternative is a download button that 404s, and a silent
 * one at that.
 */
function newestEnclosure(feedPath) {
  const xml = readFileSync(join(root, feedPath), "utf8");
  const releases = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((match) => ({
      url: match[1].match(/<enclosure[^>]*\surl="([^"]+)"/)?.[1],
      build: Number(match[1].match(/<sparkle:version>(\d+)<\/sparkle:version>/)?.[1] ?? 0),
    }))
    .filter((release) => Boolean(release.url))
    .sort((a, b) => b.build - a.build);

  if (releases.length === 0) {
    throw new Error(`no downloadable release found in ${feedPath}`);
  }
  return new URL(releases[0].url);
}

const feedRoutes = products.map(({ name, feed }) => {
  const enclosure = newestEnclosure(feed);
  return {
    name,
    from: `/products/${name}/download`,
    // Exactly where the feed says the file is. Off-site keeps its host; on-site
    // becomes a path, so previews and both hosts serve their own copy.
    to: siteOrigins.has(enclosure.origin) ? enclosure.pathname : enclosure.href,
    // Whether this product's archive has left the site.
    offSite: !siteOrigins.has(enclosure.origin),
  };
});

// Windows first: Cloudflare takes the first rule that matches, and
// /products/hangly/download would otherwise be tried against the longer paths.
const routes = [...windowsRoutes, ...feedRoutes];

// ---------------------------------------------------------------------------
// Cloudflare Pages
// ---------------------------------------------------------------------------
const redirects = [
  "# Generated by scripts/generate-download-redirects.mjs — do not edit.",
  "# Source of truth: public/products/*/appcast.xml",
  "",
  ...routes.map((route) => `${route.from}  ${route.to}  302`),
];

// Anything still linking the archives where they used to live follows them.
const hangly = feedRoutes.find((route) => route.name === "hangly");
if (hangly?.offSite) {
  redirects.push(
    "",
    "# The archive moved off the site; old links follow it.",
    `/products/hangly/releases/*  ${new URL(hangly.to).origin}/:splat  301`,
  );
}

writeFileSync(join(root, "public/_redirects"), `${redirects.join("\n")}\n`);

// ---------------------------------------------------------------------------
// Vercel, for as long as it is still serving this site
// ---------------------------------------------------------------------------
writeFileSync(
  join(root, "vercel.json"),
  `${JSON.stringify(
    {
      $schema: "https://openapi.vercel.sh/vercel.json",
      redirects: routes.map((route) => ({
        source: route.from,
        destination: route.to,
        // Never permanent: the destination changes with every release, and a 308
        // would sit in browser caches long after it stopped being true.
        permanent: false,
      })),
    },
    null,
    2,
  )}\n`,
);

for (const route of routes) {
  console.log(`  ${route.from}  ->  ${route.to}`);
}

