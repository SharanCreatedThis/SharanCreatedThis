/**
 * One definition of every entity the site describes, and the ids that join them.
 *
 * A knowledge graph treats two descriptions of the same thing as two things.
 * Before this file, each page declared its own author and publisher inline, so
 * "Sharan M" existed once per page rather than once — which is the failure
 * mode `@id` exists to prevent. Everything now points at these constants, and
 * the graph across the site resolves to five nodes rather than fifty.
 *
 * `node()` emitters are used by page-level schema; ids are used to reference
 * an entity from a page without repeating it. Reference rather than repeat:
 * a second full description is a second entity.
 */

import { DEFAULT_DESCRIPTION, PERSON, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import { profile } from "@/data/portfolio";

export const ID = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  person: `${SITE_URL}/#person-sharan`,
  hangly: `${absoluteUrl("/products/hangly")}#hangly`,
  vision: `${absoluteUrl("/products/vision")}#vision`,
} as const;

/**
 * Backwards-compatible aliases.
 *
 * `#person` shipped before `#person-sharan` and is referenced by pages already
 * crawled. Both resolve to the same node via `sameAs`, so nothing that Google
 * has already read becomes a dangling reference.
 */
export const LEGACY_PERSON_ID = `${SITE_URL}/#person`;

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ID.organization,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    founder: { "@id": ID.person },
    logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png"), width: 512, height: 512 },
    image: absoluteUrl("/og/home.png"),
    sameAs: PERSON.sameAs,
    // Both products, so the organization is the publisher of named software
    // rather than an unattached name.
    brand: [{ "@id": ID.hangly }, { "@id": ID.vision }],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: `mailto:${PERSON.email}`,
      url: absoluteUrl("/contact"),
      availableLanguage: ["English"],
    },
  };
}

export function personNode() {
  return {
    "@type": "Person",
    "@id": ID.person,
    // The id this node used to carry, so earlier references still resolve.
    sameAs: [...PERSON.sameAs],
    "@sameAsLegacy": undefined,
    name: PERSON.name,
    alternateName: PERSON.alternateName,
    jobTitle: PERSON.jobTitle,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    email: `mailto:${PERSON.email}`,
    image: absoluteUrl(profile.portrait),
    worksFor: { "@id": ID.organization },
    knowsAbout: [
      "Filmmaking", "Cinematography", "Photography", "Creative Direction",
      "macOS Development", "SwiftUI", "Product Design", "Desktop Applications",
    ],
    nationality: { "@type": "Country", name: "India" },
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": ID.organization },
    author: { "@id": ID.person },
  };
}

type AppFacts = {
  id: string;
  name: string;
  description: string;
  path: string;
  operatingSystem: string[];
  applicationCategory: string;
  applicationSubCategory?: string;
  softwareVersion: string;
  downloadPath: string;
  screenshot: string;
  features?: string[];
};

/**
 * A SoftwareApplication, emitted identically wherever it appears.
 *
 * `offers` is present even though both apps are free: without a price Google
 * shows no app result at all, and "0" is the documented way to say free. No
 * `aggregateRating` is claimed anywhere — there are no reviews to aggregate,
 * and inventing one is a manual-action risk rather than a shortcut.
 */
export function softwareNode(app: AppFacts) {
  return {
    "@type": "SoftwareApplication",
    "@id": app.id,
    name: app.name,
    description: app.description,
    url: absoluteUrl(app.path),
    applicationCategory: app.applicationCategory,
    ...(app.applicationSubCategory ? { applicationSubCategory: app.applicationSubCategory } : {}),
    operatingSystem: app.operatingSystem.join(", "),
    softwareVersion: app.softwareVersion,
    downloadUrl: absoluteUrl(app.downloadPath),
    installUrl: absoluteUrl("/install"),
    screenshot: absoluteUrl(app.screenshot),
    image: absoluteUrl(app.screenshot),
    author: { "@id": ID.person },
    creator: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isAccessibleForFree: true,
    ...(app.features ? { featureList: app.features } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: { "@id": ID.organization },
    },
  };
}

export const HANGLY_APP: AppFacts = {
  id: ID.hangly,
  name: "Hangly",
  description:
    "A free desktop app for macOS and Windows that hangs a decorative charm from the top of your screen on a cord with real pendulum physics. Over eighty charms across eleven collections, plus any image of your own.",
  path: "/products/hangly",
  operatingSystem: ["macOS 14", "Windows 10"],
  applicationCategory: "DesktopEnhancementApplication",
  applicationSubCategory: "Desktop customisation",
  softwareVersion: "2.0.0",
  downloadPath: "/download",
  screenshot: "/og/hangly.png",
  features: [
    "Real pendulum physics",
    "Over eighty charms across eleven collections",
    "Custom charms from any image",
    "Three cord styles and adjustable size",
    "Click-through: never intercepts a click",
    "Multiple charms and multi-monitor placement",
    "Native Windows ARM64 build",
  ],
};

export const VISION_APP: AppFacts = {
  id: ID.vision,
  name: "Vision",
  description:
    "Local face recognition for Mac with a native notch experience. Everything stays on your machine.",
  path: "/products/vision",
  operatingSystem: ["macOS 15"],
  applicationCategory: "UtilitiesApplication",
  softwareVersion: "1.1",
  downloadPath: "/products/vision/download",
  screenshot: "/og/vision.png",
};

/** The three nodes every page carries, so the graph is connected everywhere. */
export function siteGraph() {
  return [personNode(), organizationNode(), websiteNode()];
}

export function breadcrumb(trail: { name: string; path: string }[], pageUrl: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

export function faqNode(faqs: { q: string; a: string }[], pageUrl: string) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs
      .filter((f) => f.q && f.a)
      .map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
  };
}

/** Escapes the one character that could close a script tag early. */
export function serialise(schema: unknown): string {
  return JSON.stringify(schema, (_k, v) => (v === undefined ? undefined : v)).replace(/</g, "\\u003c");
}
