/**
 * schema.org output for charm pages, derived from the registry.
 *
 * A charm with no authored meaning gets no `description` rather than a
 * generated one. Structured data asserting something the page does not say is
 * the failure mode this whole system exists to avoid.
 */

import { absoluteUrl } from "@/lib/seo";
import { ID } from "@/lib/schema/entities";
import type { Charm } from "./charm-registry";

/** One charm as an ImageObject, for gallery and list schema. */
export function charmImageNode(c: Charm) {
  return {
    "@type": "ImageObject",
    "@id": `${absoluteUrl("/charms")}#${c.id}`,
    name: c.displayName ?? c.id,
    contentUrl: absoluteUrl(c.artworkPath),
    encodingFormat: "image/svg+xml",
    ...(c.meaning ? { description: c.meaning } : {}),
    creator: { "@id": ID.person },
    copyrightHolder: { "@id": ID.organization },
    isPartOf: { "@id": ID.hangly },
  };
}

/** An ItemList of charms, for a collection or index page. */
export function charmListNode(charms: Charm[], pageUrl: string, name: string) {
  return {
    "@type": "ItemList",
    "@id": `${pageUrl}#list`,
    name,
    numberOfItems: charms.length,
    itemListElement: charms.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.displayName ?? c.id,
      item: charmImageNode(c),
    })),
  };
}
