import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COMPARISONS } from "@/lib/comparisons";
import { GUIDES } from "@/lib/guides";
import { PERSON_ID, ORG_ID, SITE_ID } from "@/components/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const TITLE = "Hangly Compared: Desktop Charm and Pet Apps";
const DESCRIPTION =
  "Hangly compared with Lucky Dangle, Screen Dangle, DangleJoy, Charmly, Shimeji, Desktop Goose, RunCat and Dockling. Each comparison says where the other one wins.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/compare" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: absoluteUrl("/compare"),
    title: TITLE, description: DESCRIPTION, images: [{ url: "/og/hangly.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/hangly.png"] },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "CollectionPage", "@id": `${absoluteUrl("/compare")}#page`, url: absoluteUrl("/compare"),
      name: TITLE, description: DESCRIPTION, inLanguage: "en-IN",
      isPartOf: { "@id": SITE_ID }, author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID },
      mainEntity: { "@type": "ItemList", numberOfItems: COMPARISONS.length,
        itemListElement: COMPARISONS.map((c, i) => ({ "@type": "ListItem", position: i + 1,
          name: `Hangly vs ${c.name}`, url: absoluteUrl(`/compare/${c.slug}`) })) } },
    { "@type": "BreadcrumbList", "@id": `${absoluteUrl("/compare")}#breadcrumb`, itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Compare", item: absoluteUrl("/compare") }] },
  ],
};

export default function ComparePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> <span>/</span> Compare</nav>
        <header className="comparison-head">
          <p className="eyebrow">HONEST COMPARISONS</p>
          <h1>How Hangly compares<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Eight comparisons against the apps people actually weigh Hangly against. Each one names
            where the other product wins, because a comparison that does not is an advertisement.
          </p>
        </header>
        <section aria-labelledby="all-cmp">
          <h2 id="all-cmp">All comparisons</h2>
          <ul className="compare-index">
            {COMPARISONS.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`}>
                  <strong>Hangly vs {c.name} <ArrowUpRight size={15} /></strong>
                  <span>{c.verdict.split(". ")[0]}.</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="cmp-guides">
          <h2 id="cmp-guides">Category guides</h2>
          <ul className="comparison-others">
            {GUIDES.map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.h1}</Link></li>)}
          </ul>
        </section>
        <section aria-labelledby="cmp-more">
          <h2 id="cmp-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/products/hangly">Hangly product page</Link></li>
            <li><Link href="/faq">Hangly FAQ</Link></li>
            <li><Link href="/products">All products</Link></li>
          </ul>
        </section>
      </main>
    </>
  );
}
