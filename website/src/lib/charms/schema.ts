/**
 * schema.org output for the charm pages.
 *
 * Two rules, both of which the rest of the site already enforces:
 *
 * A charm with no artwork gets **no ImageObject**. A page may not claim an
 * image it does not have, and seven charms currently ship without one.
 *
 * Descriptions come from the shipped catalogue verbatim. Nothing here writes
 * copy — structured data that asserts something the page does not say is the
 * failure the whole stats system exists to prevent.
 */

import { absoluteUrl } from "@/lib/seo";
import { ID } from "@/lib/schema/entities";
import { artworkPath, type Charm } from "./queries";

export function charmImageNode(c: Charm, pageUrl: string) {
  const path = artworkPath(c.id);
  if (!path) return null;
  return {
    "@type": "ImageObject",
    "@id": `${pageUrl}#${c.id}`,
    name: c.name,
    contentUrl: absoluteUrl(path),
    encodingFormat: "image/svg+xml",
    description: c.description,
    creator: { "@id": ID.person },
    copyrightHolder: { "@id": ID.organization },
  };
}

export function charmListNode(charms: Charm[], pageUrl: string, name: string) {
  return {
    "@type": "ItemList",
    "@id": `${pageUrl}#list`,
    name,
    numberOfItems: charms.length,
    itemListElement: charms.map((c, i) => {
      const image = charmImageNode(c, pageUrl);
      return {
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        // An unillustrated charm is still a list item; it simply has no image.
        ...(image ? { item: image } : { description: c.description }),
      };
    }),
  };
}

/** The full graph for a charm page: collection, list, breadcrumb. */
export function charmCollectionGraph(opts: {
  charms: Charm[];
  pageUrl: string;
  name: string;
  description: string;
  trail: { name: string; path: string }[];
  extra?: unknown[];
}) {
  const { charms, pageUrl, name, description, trail, extra = [] } = opts;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name,
        description,
        inLanguage: "en-IN",
        isPartOf: { "@id": ID.website },
        about: { "@id": ID.hangly },
        mainEntity: { "@id": `${pageUrl}#list` },
      },
      charmListNode(charms, pageUrl, name),
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: trail.map((step, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: step.name,
          item: absoluteUrl(step.path),
        })),
      },
      ...extra,
    ],
  };
}
