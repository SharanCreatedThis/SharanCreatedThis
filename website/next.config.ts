import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The newest Hangly build, read from the Sparkle feed at build time.
 *
 * The feed is the one thing a release is guaranteed to touch — the updater will not
 * install anything that is not in it — so taking the download link from it means the
 * button on this site and the update the app installs can never point at different
 * builds. Releasing stays what it was: run Scripts/release-update.sh in the app
 * repository, copy the DMG and appcast.xml in here, push.
 *
 * Throwing is deliberate. A missing or unreadable feed means the download button
 * would 404, and a failed build leaves the previous deployment serving.
 */
function latestHanglyDownload(): string {
  const feed = join(process.cwd(), "public/products/hangly/appcast.xml");
  const xml = readFileSync(feed, "utf8");

  // Every item, newest first by build number rather than by position in the file.
  const releases = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map((match) => ({
      url: match[1].match(/<enclosure[^>]*\surl="([^"]+)"/)?.[1],
      build: Number(match[1].match(/<sparkle:version>(\d+)<\/sparkle:version>/)?.[1] ?? 0),
    }))
    .filter((release): release is { url: string; build: number } => Boolean(release.url))
    .sort((a, b) => b.build - a.build);

  const newest = releases[0];
  if (!newest) {
    throw new Error(`no downloadable release found in ${feed}`);
  }
  // The path rather than the absolute URL the feed carries, so a preview deployment
  // serves its own copy instead of sending people to production.
  return new URL(newest.url).pathname;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/products/hangly/download",
        destination: latestHanglyDownload(),
        // Never permanent: the destination changes with every release, and a 308
        // would sit in browser caches long after it stopped being true.
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
