import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * robots.txt.
 *
 * The site had none: Cloudflare was serving its own generated one, which is
 * entirely comments about AI content signals and carries no User-agent, no
 * Allow and — the part that matters — no Sitemap line. This file replaces it,
 * because a file present in the deployment takes precedence over the generated
 * one. Worth re-checking after the first deploy; see docs/seo-setup.md.
 *
 * Everything is allowed, because everything here is meant to be found. The two
 * disallowed prefixes do not exist yet and are declared ahead of needing them,
 * so that a private page added later is excluded from the moment it ships
 * rather than after someone notices it in a search result.
 *
 * The major engines are listed individually as well as under `*`. It is
 * redundant — each honours the wildcard — but an explicit entry is what several
 * webmaster tools look for when reporting whether they are permitted, and it
 * documents which crawlers were actually considered.
 */
export const dynamic = "force-static";

const DISALLOW = ["/private/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  const rule = { allow: "/", disallow: DISALLOW };

  return {
    rules: [
      { userAgent: "*", ...rule },
      { userAgent: "Googlebot", ...rule },
      { userAgent: "Googlebot-Image", ...rule },
      { userAgent: "Bingbot", ...rule },
      { userAgent: "DuckDuckBot", ...rule },
      // Brave's index is built by its own crawler, which identifies itself as
      // this and ignores rules addressed to "Brave".
      { userAgent: "BraveBot", ...rule },
      // Powers Siri and Spotlight suggestions as well as Safari search.
      { userAgent: "Applebot", ...rule },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
