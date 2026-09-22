import type { MetadataRoute } from "next";
import { PAGES, absoluteUrl } from "@/lib/seo";

/**
 * The sitemap, derived from `PAGES` rather than listed again here.
 *
 * Adding a page means adding it to seo.ts, which it needs anyway for its title
 * and canonical URL; the sitemap entry then follows on its own. A page listed
 * nowhere is a page that never gets crawled, and that is a silent failure —
 * scripts/check-seo.mjs turns it into a loud one at build time.
 *
 * `lastModified` is the build time. The honest alternative is each page's git
 * mtime, but the repository is deployed from a fresh clone where every file has
 * the same checkout timestamp, so it would be the build time wearing a disguise.
 * Engines treat the field as a hint and verify it against what they fetch.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return Object.values(PAGES)
    .filter((page) => !page.excludeFromSitemap)
    .map((page) => ({
      url: absoluteUrl(page.path),
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }));
}
