/**
 * Turns an entry in `PAGES` into the Metadata object Next expects.
 *
 * Every page calls `pageMetadata("<key>")` and gets its title, description,
 * canonical URL, Open Graph card and Twitter card from the single description
 * in seo.ts. Writing those four by hand per page is how they drift apart, and
 * a canonical tag that disagrees with the sitemap is worse than none at all.
 */

import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  KEYWORDS,
  PAGES,
  SITE_NAME,
  SITE_URL,
  VERIFICATION,
  absoluteUrl,
  type PageKey,
} from "./seo";

/**
 * The parts every page shares, applied once in the root layout.
 *
 * `metadataBase` is the load-bearing one: without it Next emits relative Open
 * Graph image URLs, and every crawler that reads them — LinkedIn, Slack, X,
 * WhatsApp — needs absolute ones and silently shows no image instead.
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    // Pages supply their own full title, so no suffix is appended: the titles in
    // seo.ts already read as complete lines in a result list.
    template: "%s",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "Sharan M", url: SITE_URL }],
  creator: "Sharan M",
  publisher: SITE_NAME,
  // Left to the browser default. The site is one person's work, and stripping
  // the referrer entirely hides inbound traffic from the analytics it feeds.
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Uncapped: the defaults truncate rich results for no benefit here.
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    ...(VERIFICATION.google ? { google: VERIFICATION.google } : {}),
    ...(VERIFICATION.bing ? { other: { "msvalidate.01": VERIFICATION.bing } } : {}),
  },
  alternates: { canonical: "/" },
};

/** Title, description, canonical and both social cards for one page. */
export function pageMetadata(key: PageKey): Metadata {
  const page = PAGES[key];
  const url = absoluteUrl(page.path);

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url,
      title: page.title,
      description: page.description,
      images: [
        {
          url: page.image,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [page.image],
    },
  };
}
