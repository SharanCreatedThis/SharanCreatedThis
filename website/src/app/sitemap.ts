import type { MetadataRoute } from "next";
import { PAGES, PAGE_IMAGES, absoluteUrl, dynamicPages, type PageKey } from "@/lib/seo";
import { CONTENT_LAST_MODIFIED } from "@/data/content-date.generated";

/**
 * The sitemap, derived from `PAGES` rather than listed again here.
 *
 * Adding a page means adding it to seo.ts, which it needs anyway for its title
 * and canonical URL; the sitemap entry then follows on its own. A page listed
 * nowhere is a page that never gets crawled, and that is a silent failure —
 * scripts/check-seo.mjs turns it into a loud one at build time.
 *
 * Pages that carry real photographs also list them, which is how an image gets
 * into Google Images without waiting to be discovered. For a portfolio whose
 * work *is* the images, that is a separate way in entirely.
 *
 * `lastModified` is the last commit that changed anything a visitor sees, not
 * the build time. It used to be the build time, which meant a rebuild with no
 * changes at all moved every page's date — and Google only honours lastmod
 * where it has found it accurate, so a date that is always "now" is worse than
 * none: it trains the field to be ignored. See
 * scripts/generate-content-date.mjs, including why this is one date for the
 * site rather than nine guesses.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CONTENT_LAST_MODIFIED);

  const fixed = (Object.entries(PAGES) as [PageKey, (typeof PAGES)[PageKey]][])
    .filter(([, page]) => !page.excludeFromSitemap)
    .map(([key, page]) => {
      const images = PAGE_IMAGES[key];
      return {
        url: absoluteUrl(page.path),
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        ...(images ? { images: images.map((image) => absoluteUrl(image.url)) } : {}),
      };
    });

  // Empty today. When a blog, a press page or case studies exist, their entries
  // arrive here and land in the sitemap with nothing in this file changing.
  const dynamic = dynamicPages()
    .filter((page) => !page.excludeFromSitemap)
    .map((page) => ({
      url: absoluteUrl(page.path),
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }));

  return [...fixed, ...dynamic];
}
