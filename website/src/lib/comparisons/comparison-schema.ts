/**
 * schema.org for a comparison page: WebPage, FAQPage, BreadcrumbList.
 *
 * Kept apart from the rendering so the shapes can be checked against the
 * spec without reading JSX, and so a schema fix never touches layout.
 *
 * `@id` values are stable and cross-reference the site graph emitted in the
 * root layout. That is the difference between three unrelated blobs and one
 * described entity: the page's author resolves to the same Person node the
 * home page declares, rather than to a second stranger with the same name.
 */

import { PERSON_ID, ORG_ID, SITE_ID } from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import type { Comparison } from "./comparison-data";

/** Escapes the one character that could close the script tag early. */
export function serialise(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export function comparisonSchema(c: Comparison) {
  const path = `/compare/${c.slug}`;
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: c.title,
        description: c.description,
        inLanguage: "en-IN",
        isPartOf: { "@id": SITE_ID },
        about: { "@id": `${absoluteUrl("/products/hangly")}#app` },
        primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl("/og/hangly.png") },
        datePublished: c.checked,
        dateModified: c.checked,
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        // The comparison itself, so an answer engine can read the claim
        // rather than infer it from a table it has to parse.
        mainEntity: {
          "@type": "ItemList",
          name: `${SITE_NAME}: Hangly compared with ${c.name}`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Hangly", url: absoluteUrl("/products/hangly") },
            { "@type": "ListItem", position: 2, name: c.name, url: c.url },
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Compare", item: absoluteUrl("/compare") },
          { "@type": "ListItem", position: 3, name: `Hangly vs ${c.name}`, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: c.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
