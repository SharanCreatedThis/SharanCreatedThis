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
import { COMPARISONS } from "@/lib/comparisons/comparison-data";
import { GUIDES } from "@/lib/guides/guide-data";

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
 * Optional verification tokens. Neither is required, and both are unset.
 *
 * Each does exactly one thing: emit a `<meta>` tag that proves control of the
 * property to one search engine. Nothing else in the site reads them, nothing
 * fails without them, and an unset one is omitted entirely rather than emitted
 * empty — some verifiers treat a blank value as a failed check rather than an
 * absent one.
 *
 * **Google is verified by DNS**, through the domain provider, which is the
 * stronger method: it covers the apex, `www` and every subdomain at once
 * — including downloads.sharancreatedthis.in — and survives a change of host,
 * where a meta tag proves one hostname and disappears if a deploy goes wrong.
 * The tag below is a second, redundant proof and is deliberately not used.
 *
 * Bing is the same story, and can skip verification altogether by importing
 * the already-verified property from Search Console. Set `bing` only if that
 * import is not used; see docs/seo-setup.md.
 */
export const VERIFICATION = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
} as const;

/**
 * Analytics, all optional: an absent id means the script is never loaded at all.
 *
 * These are read at build time, not at run time. A static export has no server
 * to read an environment at, so `process.env.NEXT_PUBLIC_*` is substituted for
 * its literal value while the site is being compiled and the result is baked
 * into the HTML. Changing one therefore takes a rebuild, not a restart, and a
 * variable added to Cloudflare after a deploy does nothing until the next one.
 *
 * `NEXT_PUBLIC_` also means public: the measurement id is visible in the page
 * source of every page, as it has to be for the browser to send anything. It is
 * an identifier for a property, not a credential, and it is committed in
 * .env.production for that reason. A real environment variable still wins over
 * the file, so Cloudflare can override it without a commit.
 */
export const ANALYTICS = {
  ga4: process.env.NEXT_PUBLIC_GA_ID,
  clarity: process.env.NEXT_PUBLIC_CLARITY_ID,
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
    title: "Independent Desktop Apps by Sharan Created This",
    description:
      "Hangly for macOS and Windows, and Vision for Mac: small, independent desktop apps built for people who care how their desktop feels. Free to download.",
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
      "What Hangly sends, what it never sends, and how to switch it off. Three things leave your desktop, and two of them are optional.",
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

/**
 * How a portfolio category becomes a schema.org type.
 *
 * `CreativeWork` describes anything a person made and is always correct, but a
 * more specific type earns a more specific result — a film understood as a film
 * can surface differently from a generic work. So each category maps to the
 * narrowest type that is honestly true, and anything unmapped falls back to
 * `CreativeWork` rather than guessing.
 *
 * Adding a category to `categories` in data/portfolio.ts and leaving it out of
 * this map is safe: it still gets described, just less specifically.
 */
export const CATEGORY_SCHEMA: Record<string, string> = {
  Films: "Movie",
  Documentary: "Movie",
  Photography: "ImageGallery",
  "Creative Direction": "CreativeWork",
  "Brand Campaigns": "CreativeWork",
  CSR: "CreativeWork",
  Editorial: "CreativeWorkSeries",
};

/**
 * Sections the site does not have yet.
 *
 * Nothing is built here — these are the paths a blog, a press page and case
 * studies will take when they exist, written down now so that the decision is
 * made once. A section becomes real by adding its pages to `PAGES` and, for
 * anything with many entries, by returning them from `dynamicPages()` below.
 *
 * Reserved rather than implemented, deliberately: a route that exists and is
 * empty is worse than one that does not exist, because an engine indexes the
 * empty one and learns the site has nothing to say.
 */
export const PLANNED_SECTIONS = {
  blog: "/blog",
  press: "/press",
  caseStudies: "/case-studies",
} as const;

/**
 * Pages that are not known until build time, for the sitemap to include.
 *
 * Empty today. A blog's posts, a press page's entries and each case study will
 * come from here — read from MDX files, a CMS, or wherever they end up living —
 * so that adding a section never means editing the sitemap. The shape matches
 * `PageSeo` minus the parts a listing page supplies for itself.
 *
 * `scripts/check-seo.mjs` compares this and `PAGES` against what was actually
 * exported, so a section that ships without being listed here fails the build
 * instead of quietly never being crawled.
 */
export function dynamicPages(): PageSeo[] {
  // The comparison pages. They exist because a crawl of the category found
  // Screen Dangle at 1,427 indexed URLs and Hangly at one, and because
  // competitors already rank for the "X alternative" queries people run
  // before they choose. Adding a comparison means adding it to
  // data/hangly-comparisons.ts; it reaches the sitemap from here.
  const shared = { image: "/og/hangly.png", changeFrequency: "monthly" as const };
  return [
    { path: "/faq", title: "Hangly FAQ", description: "Fifty answers about Hangly.", ...shared, priority: 0.8 },
    { path: "/compare", title: "Hangly compared", description: "Eight honest comparisons.", ...shared, priority: 0.7 },
    { path: "/guides", title: "Guides", description: "Desktop charms, pets and Mac customisation.", ...shared, priority: 0.7 },
    ...COMPARISONS.map((c) => ({
      path: `/compare/${c.slug}`, title: c.title, description: c.description, ...shared, priority: 0.6,
    })),
    ...GUIDES.map((g) => ({
      path: `/guides/${g.slug}`, title: g.title, description: g.description, ...shared, priority: 0.7,
    })),
  ];
}

/**
 * Images worth submitting for Google Images, per page.
 *
 * Only images that carry meaning: the work itself and the portraits. Decorative
 * artwork, charm SVGs and the social cards are all left out — a sitemap full of
 * ornament teaches an engine nothing and dilutes what the real images say.
 *
 * Image search matters more here than for most sites: this is a photographer's
 * and filmmaker's portfolio, and a photograph that ranks is a way in that no
 * amount of text on the page provides.
 */
export const PAGE_IMAGES: Partial<Record<PageKey, { url: string; title: string }[]>> = {
  home: [
    { url: "/portfolio/sharan-white-suit.webp", title: "Sharan — filmmaker, designer and product builder" },
    { url: "/portfolio/lapse.jpg", title: "Lapse — a Malayalam short film directed by Sharan" },
    { url: "/portfolio/photography-03.webp", title: "Portrait photography by Sharan" },
  ],
  portfolio: [
    { url: "/portfolio/lapse.jpg", title: "Lapse — a Malayalam short film directed by Sharan" },
    { url: "/portfolio/shaivi.jpg", title: "Shaivi Chavann — trailer" },
    { url: "/portfolio/photography-01.webp", title: "Photography portfolio by Sharan" },
    { url: "/portfolio/photography-03.webp", title: "Portrait photography by Sharan" },
  ],
  about: [
    { url: "/portfolio/sharan-about.webp", title: "Portrait of Sharan, filmmaker and creative technologist" },
  ],
};

/**
 * Absolute URL for a root-relative path. Crawlers need absolute; humans don't.
 *
 * The root deliberately has no trailing slash. Next resolves `alternates.
 * canonical: "/"` against metadataBase to `https://host` with none, so a
 * sitemap that wrote `https://host/` disagreed with the canonical tag on the
 * one page most likely to be crawled. The two are the same resource and Google
 * normalises them, but a sitemap entry and a canonical tag that do not match
 * character for character is the kind of small contradiction that is free to
 * remove and annoying to diagnose later.
 */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
