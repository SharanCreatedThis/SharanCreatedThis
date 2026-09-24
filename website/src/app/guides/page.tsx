import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GUIDES } from "@/lib/guides";
import { COMPARISONS } from "@/lib/comparisons";
import { PERSON_ID, ORG_ID, SITE_ID } from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const TITLE = "Guides: Desktop Charms, Pets and Mac Customisation";
const DESCRIPTION =
  "Guides to desktop charm apps, desktop pets and menu bar customisation for Mac — plus alternatives to Lucky Dangle, Screen Dangle, Desktop Goose and Charmly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guides" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: absoluteUrl("/guides"),
    title: TITLE, description: DESCRIPTION, images: [{ url: "/og/hangly.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/hangly.png"] },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "CollectionPage", "@id": `${absoluteUrl("/guides")}#page`, url: absoluteUrl("/guides"),
      name: TITLE, description: DESCRIPTION, inLanguage: "en-IN",
      isPartOf: { "@id": SITE_ID }, author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID },
      mainEntity: { "@type": "ItemList", numberOfItems: GUIDES.length,
        itemListElement: GUIDES.map((g, i) => ({ "@type": "ListItem", position: i + 1,
          name: g.h1, url: absoluteUrl(`/guides/${g.slug}`) })) } },
    { "@type": "BreadcrumbList", "@id": `${absoluteUrl("/guides")}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") }] },
  ],
};

export default function GuidesIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <main className="guide wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> <span>/</span> Guides</nav>
        <header className="guide-head">
          <p className="eyebrow">GUIDES</p>
          <h1>Desktop charms, pets<br />and Mac customisation<span className="orange">.</span></h1>
          <p className="guide-summary">
            Seven guides to this category, every product read from its own site and dated. Several
            recommend something other than Hangly, because that is sometimes the honest answer.
          </p>
        </header>
        <section aria-labelledby="all-guides">
          <h2 id="all-guides">All guides</h2>
          <ul className="compare-index">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`}>
                  <strong>{g.h1} <ArrowUpRight size={15} /></strong>
                  <span>{g.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="guide-cmp">
          <h2 id="guide-cmp">Head-to-head comparisons</h2>
          <ul className="comparison-others">
            {COMPARISONS.map((c) => <li key={c.slug}><Link href={`/compare/${c.slug}`}>Hangly vs {c.name}</Link></li>)}
          </ul>
        </section>
        <section aria-labelledby="guide-more">
          <h2 id="guide-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/products/hangly">Hangly product page</Link></li>
            <li><Link href="/faq">Hangly FAQ</Link></li>
          </ul>
        </section>
      </main>
    </>
  );
}
