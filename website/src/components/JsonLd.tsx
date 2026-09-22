/**
 * schema.org descriptions of the site, the person behind it and the two apps.
 *
 * These are what let a search engine show something richer than a blue link:
 * a knowledge panel for the person, an app card with a price and a platform for
 * Hangly and Vision. Everything asserted here is also visible on the page it
 * describes, which is both Google's rule and the only version worth having.
 *
 * Emitted as a plain <script type="application/ld+json">. There is no sanitising
 * step because nothing here is user input — it is all literals and values from
 * seo.ts — but the closing-brace escape below still guards the one character
 * that could end the script tag early.
 */

import {
  DEFAULT_DESCRIPTION,
  PERSON,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";
import { profile } from "@/data/portfolio";

type Schema = Record<string, unknown>;

function JsonLd({ id, schema }: { id: string; schema: Schema | Schema[] }) {
  return (
    <script
      type="application/ld+json"
      // `<` cannot appear in JSON string values without being escaped first, so
      // this closes off the one way a value could break out of the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
      key={id}
    />
  );
}

/** Stable node ids, so the graph can point at itself instead of repeating. */
const PERSON_ID = `${SITE_URL}/#person`;
const SITE_ID = `${SITE_URL}/#website`;
const ORG_ID = `${SITE_URL}/#organization`;

/**
 * The site-wide graph: who made this, what the site is, and who publishes it.
 *
 * One @graph rather than three separate scripts, so the nodes can reference each
 * other by id — the site's publisher *is* the organization, whose founder *is*
 * the person — and a crawler reads one identity instead of three strangers who
 * happen to share a name.
 */
export function SiteJsonLd() {
  return (
    <JsonLd
      id="site"
      schema={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            "@id": PERSON_ID,
            name: PERSON.name,
            alternateName: PERSON.alternateName,
            jobTitle: PERSON.jobTitle,
            description: DEFAULT_DESCRIPTION,
            url: SITE_URL,
            email: `mailto:${PERSON.email}`,
            image: absoluteUrl(profile.portrait),
            sameAs: PERSON.sameAs,
            knowsAbout: [
              "Filmmaking",
              "Cinematography",
              "Photography",
              "Creative Direction",
              "macOS Development",
              "SwiftUI",
              "Product Design",
            ],
            nationality: { "@type": "Country", name: "India" },
          },
          {
            "@type": "Organization",
            "@id": ORG_ID,
            name: SITE_NAME,
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            founder: { "@id": PERSON_ID },
            logo: {
              "@type": "ImageObject",
              url: absoluteUrl("/icon.png"),
              width: 512,
              height: 512,
            },
            sameAs: PERSON.sameAs,
          },
          {
            "@type": "WebSite",
            "@id": SITE_ID,
            name: SITE_NAME,
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            inLanguage: "en-IN",
            publisher: { "@id": ORG_ID },
            author: { "@id": PERSON_ID },
          },
        ],
      }}
    />
  );
}

/** A CollectionPage of the work, for /portfolio. */
export function PortfolioJsonLd({
  works,
}: {
  works: { name: string; url?: string }[];
}) {
  return (
    <JsonLd
      id="portfolio"
      schema={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Selected Work",
        url: absoluteUrl("/portfolio"),
        isPartOf: { "@id": SITE_ID },
        about: { "@id": PERSON_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: works.map((work, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: work.name,
            ...(work.url ? { url: work.url } : {}),
          })),
        },
      }}
    />
  );
}

type AppFacts = {
  name: string;
  description: string;
  url: string;
  /** schema.org's vocabulary: "macOS", "Windows". Free text is ignored. */
  operatingSystem: string[];
  applicationCategory: string;
  downloadUrl: string;
  softwareVersion: string;
  /** Screenshot or hero image that shows the app, absolute. */
  screenshot: string;
};

/**
 * A SoftwareApplication card for one app.
 *
 * `offers` is not optional even though both apps are free: without a price,
 * Google shows no app card at all, and "0" is the documented way to say free.
 * No `aggregateRating` is claimed — there are no reviews to aggregate, and
 * inventing one is both against the guidelines and a manual-action risk.
 */
export function SoftwareApplicationJsonLd({ app }: { app: AppFacts }) {
  return (
    <JsonLd
      id={`app-${app.name.toLowerCase()}`}
      schema={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: app.name,
        description: app.description,
        url: app.url,
        applicationCategory: app.applicationCategory,
        operatingSystem: app.operatingSystem.join(", "),
        softwareVersion: app.softwareVersion,
        downloadUrl: app.downloadUrl,
        screenshot: app.screenshot,
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      }}
    />
  );
}

/**
 * The questions already answered on the page, restated for the engine.
 *
 * Google only shows an FAQ rich result when every question and answer is also
 * visible to a visitor — which is the whole reason this takes the page's own
 * FAQ data as its argument rather than carrying a second copy that could say
 * something different.
 */
export function FaqJsonLd({
  faqs,
  path,
}: {
  /** Question, then answer. Widened past a tuple so the page's own array can
   *  be passed as it is written, without an `as const` it does not need. */
  faqs: readonly (readonly string[])[];
  path: string;
}) {
  return (
    <JsonLd
      id={`faq-${path}`}
      schema={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${absoluteUrl(path)}#faq`,
        mainEntity: faqs
          // A half-written entry would publish a Question with no Answer,
          // which is an invalid rich result rather than a partial one.
          .filter(([question, answer]) => question && answer)
          .map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
      }}
    />
  );
}

/**
 * Breadcrumbs for the nested pages.
 *
 * Google replaces the URL line in a result with this trail, so
 * "Sharan Created This › Products › Hangly" appears instead of a raw path. It
 * also states the hierarchy, which a flat set of canonical URLs cannot.
 *
 * The trail must match what the page actually shows. The product pages carry
 * their own navigation rather than the site's, so the crumbs describe the URL
 * structure — which is what a visitor arriving from a search result sees in
 * the address bar.
 */
export function BreadcrumbJsonLd({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <JsonLd
      id={`breadcrumb-${trail[trail.length - 1]?.path}`}
      schema={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((step, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: step.name,
          item: absoluteUrl(step.path),
        })),
      }}
    />
  );
}
