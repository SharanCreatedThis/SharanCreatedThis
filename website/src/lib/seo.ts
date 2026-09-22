/**
 * Everything the site says about itself to a crawler, in one place.
 *
 * Titles, descriptions, canonical URLs, social cards and JSON-LD all read from
 * here, so a page's identity is declared once rather than restated in metadata,
 * in a sitemap entry and again in structured data — three copies that drift.
 *
 * **On the canonical host.** Both `sharancreatedthis.in` and its `www` serve the
 * site, and both answer 200. To a search engine that is two sites with identical
 * content. `www` is named canonical here because that is where Hangly's Sparkle
 * feed already lives and it is the host in every link published so far.
 *
 * Canonical tags advise crawlers; they do not redirect. Nothing here changes
 * what any URL serves, which matters because Vision's `SUFeedURL` is compiled
 * against the **apex** and every installed copy still reads it there. Adding an
 * apex → www redirect at the edge is the eventual fix, and Sparkle follows
 * redirects, but that is an infrastructure change and not this file's business.
 */

import { profile } from "@/data/portfolio";

/** No trailing slash: everything below joins onto this. */
export const SITE_URL = "https://www.sharancreatedthis.in";

export const SITE_NAME = "Sharan Created This";

export const DEFAULT_TITLE = "Sharan Created This | Creative Technologist";

export const DEFAULT_DESCRIPTION =
  "Creative Technologist, filmmaker, photographer, designer and software builder creating films, products and digital experiences.";

/**
 * Keywords are ignored by Google and have been since 2009, and are kept only
 * because Bing and a few smaller engines still read them and they cost nothing.
 * They are not a ranking strategy; the titles and descriptions below are.
 */
export const KEYWORDS = [
  "Sharan",
  "Sharan Created This",
  "Creative Technologist",
  "Filmmaker",
  "Photographer",
  "Director of Photography",
  "Video Producer",
  "Creative Director",
  "Sony FX3",
  "Documentary Filmmaker",
  "Mac Developer",
  "SwiftUI Developer",
  "Hangly",
  "Vision App",
  "India",
];

/** The person behind all of it. Contact details stay sourced from one place. */
export const PERSON = {
  name: "Sharan M",
  alternateName: profile.name,
  jobTitle: profile.role,
  email: profile.email,
  /** Profiles that corroborate the identity, for schema.org `sameAs`. */
  sameAs: [
    profile.instagram,
    profile.linkedin,
    profile.behance,
    "https://github.com/SharanCreatedThis",
  ].filter(Boolean),
} as const;

/**
 * Verification tokens, supplied at build time.
 *
 * Each is a public string that only proves control of the property, so there is
 * nothing secret here — they live in the environment purely so a token can be
 * rotated without a commit. An unset one is simply omitted rather than emitted
 * empty, which some verifiers treat as a failed check rather than an absent one.
 */
export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
} as const;

/** Analytics, all optional: absent id means the script is never loaded at all. */
export const ANALYTICS = {
  ga4: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  clarity: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
} as const;

export type PageKey =
  | "home"
  | "portfolio"
  | "products"
  | "hangly"
  | "hanglyPrivacy"
  | "vision"
  | "visionDocs"
  | "about"
  | "contact";

export type PageSeo = {
  /** Path from the site root, with a leading slash. "/" for the home page. */
  path: string;
  /** The `<title>`. Written to stand alone in a result list. */
  title: string;
  description: string;
  /** Social card image, relative to the site root. */
  image: string;
  /** Sitemap hints. `priority` is advisory and engines mostly ignore it. */
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  /** Left out of the sitemap when true — still indexable, just not advertised. */
  excludeFromSitemap?: boolean;
};

/**
 * Every indexable page, and what it says about itself.
 *
 * A page added here appears in the sitemap automatically. A page that exists in
 * the app and *not* here is the thing to watch for: see `scripts/check-seo.mjs`,
 * which fails the build when the two fall out of step, because the failure mode
 * is otherwise silent — the page simply never gets crawled.
 */
export const PAGES: Record<PageKey, PageSeo> = {
  home: {
    path: "/",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    image: "/og/home.png",
    changeFrequency: "monthly",
    priority: 1,
  },
  portfolio: {
    path: "/portfolio",
    title: "Selected Work · Films, Photography & Creative Direction",
    description:
      "Short films, documentaries, brand campaigns and photography by Sharan — a filmmaker and director of photography working across India.",
    image: "/og/portfolio.png",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  products: {
    path: "/products",
    title: "Independent Products · Mac Apps by Sharan Created This",
    description:
      "Hangly and Vision: small, independent Mac and Windows apps built for people who care how their desktop feels. Free to download.",
    image: "/og/products.png",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  hangly: {
    path: "/products/hangly",
    title: "Hangly · Digital Charms That Swing On Your Desktop",
    description:
      "Hang beautiful digital charms with real swinging physics on your Mac or Windows desktop. 30+ charms across 11 collections. Free for macOS 14+ and Windows 10+.",
    image: "/og/hangly.png",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  hanglyPrivacy: {
    path: "/products/hangly/privacy",
    title: "Hangly · Privacy",
    description:
      "What Hangly sends, what it never sends, and how to switch it off. Three things leave your Mac, and two of them are optional.",
    image: "/og/hangly.png",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  vision: {
    path: "/products/vision",
    title: "Vision · Face Recognition, Reimagined For Mac",
    description:
      "Unlock your Mac by looking at it. Local face recognition with a native notch experience — nothing leaves your machine. Free for macOS.",
    image: "/og/vision.png",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  visionDocs: {
    path: "/products/vision/docs",
    title: "Vision · Getting Started & Privacy",
    description:
      "How Vision works, Mac requirements, recognition settings, and privacy and security information.",
    image: "/og/vision.png",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  about: {
    path: "/about",
    title: "The Story · About Sharan",
    description:
      "A filmmaker, photographer and designer who builds software. How a camera and a code editor ended up on the same desk, and what came of it.",
    image: "/og/about.png",
    changeFrequency: "yearly",
    priority: 0.7,
  },
  contact: {
    path: "/contact",
    title: "Let's Talk · Work With Sharan",
    description:
      "Commission a film, a photography shoot or a product build. Get in touch by email, Instagram, LinkedIn or Behance.",
    image: "/og/home.png",
    changeFrequency: "yearly",
    priority: 0.7,
  },
};

/** Absolute URL for a root-relative path. Crawlers need absolute; humans don't. */
export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}
