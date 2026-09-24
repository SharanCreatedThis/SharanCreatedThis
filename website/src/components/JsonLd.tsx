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
  CATEGORY_SCHEMA,
  DEFAULT_DESCRIPTION,
  PERSON,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";
import { profile } from "@/data/portfolio";
import { ID, siteGraph, softwareNode, HANGLY_APP, VISION_APP } from "@/lib/schema/entities";

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

/**
 * Stable node ids, so the graph can point at itself instead of repeating.
 *
 * Exported because every page that emits schema must reference the same
 * person, organization and site. A second page declaring its own author is a
 * second entity as far as a knowledge graph is concerned — the whole value of
 * an `@id` is that separate pages resolve to one thing.
 */
export const PERSON_ID = ID.person;
export const SITE_ID = ID.website;
export const ORG_ID = ID.organization;

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
        // Person, Organization, WebSite and both applications, on every page.
        // A page that references #hangly without the node existing anywhere is
        // a dangling pointer; emitting the set once site-wide removes the
        // question of which page happens to define it.
        "@graph": [...siteGraph(), softwareNode(HANGLY_APP), softwareNode(VISION_APP)],
      }}
    />
  );
}

type Work = {
  id: string;
  title: string;
  category: string;
  /** "Malayalam short film", "Trailer" — shown on the card, and a good `genre`. */
  type: string;
  /** Empty for work that is finished but not published anywhere yet. */
  image?: string;
  url?: string;
};

/**
 * One portfolio project, described as the kind of thing it actually is.
 *
 * Every project in data/portfolio.ts becomes one of these, which is what makes
 * this scale: a new project is a new entry in that array and nothing here
 * changes. The type comes from its category through CATEGORY_SCHEMA.
 *
 * Six of the nine projects have no public URL and no still — they are real work
 * that simply is not published anywhere yet. They are still described, because
 * the body of work is the claim being made, but only with what is true: a name,
 * a genre and their creator. Nothing is invented to fill a field, and a project
 * with no URL gets an `@id` to be referred to by rather than a link that would
 * 404. Fabricating dates or ratings to satisfy a validator is how a site earns
 * a manual action.
 */
function workNode(work: Work) {
  const id = `${absoluteUrl("/portfolio")}#${work.id}`;
  return {
    "@type": CATEGORY_SCHEMA[work.category] ?? "CreativeWork",
    "@id": id,
    name: work.title,
    genre: work.category,
    // The card's own subtitle: "Malayalam short film", "Trailer", "Series".
    description: `${work.type} by ${PERSON.name}.`,
    creator: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
    inLanguage: "en",
    isPartOf: { "@id": `${absoluteUrl("/portfolio")}#collection` },
    ...(work.url ? { url: work.url, sameAs: work.url } : { url: id }),
    ...(work.image ? { image: absoluteUrl(work.image) } : {}),
  };
}

/**
 * The portfolio as a CollectionPage, with every project described inside it.
 *
 * The projects sit in the ItemList as whole objects rather than as names, which
 * is the difference between telling an engine that nine things exist and
 * telling it what each of them is and who made it.
 */
export function PortfolioJsonLd({ works }: { works: Work[] }) {
  return (
    <JsonLd
      id="portfolio"
      schema={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/portfolio")}#collection`,
            name: "Selected Work",
            url: absoluteUrl("/portfolio"),
            isPartOf: { "@id": SITE_ID },
            about: { "@id": PERSON_ID },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: works.length,
              itemListElement: works.map((work, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: workNode(work),
              })),
            },
          },
        ],
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

/**
 * An article, for when there is a blog to put one on.
 *
 * Unused today and deliberately written now, because the fields Google wants
 * from an Article are the ones that are hard to reconstruct later: a headline
 * under 110 characters, a publication date, an image, and an author that
 * resolves to a real person rather than a bare string. Knowing that before the
 * first post is written is worth more than adding it after fifty.
 */
export function ArticleJsonLd({
  headline,
  description,
  path,
  image,
  published,
  modified,
}: {
  headline: string;
  description: string;
  path: string;
  image: string;
  /** ISO 8601. Google treats a missing or invented date as a quality problem. */
  published: string;
  modified?: string;
}) {
  return (
    <JsonLd
      id={`article-${path}`}
      schema={{
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${absoluteUrl(path)}#article`,
        headline: headline.slice(0, 110),
        description,
        image: absoluteUrl(image),
        datePublished: published,
        dateModified: modified ?? published,
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
      }}
    />
  );
}
