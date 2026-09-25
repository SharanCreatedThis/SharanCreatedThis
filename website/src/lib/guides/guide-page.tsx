/**
 * Shared rendering for every guide. Server components throughout.
 *
 * The heading order is What / Why / How / Alternatives / FAQ, and it is the
 * same on every guide deliberately: a consistent shape is what lets an answer
 * engine find the answer without parsing the page's design, and it is also
 * what a person skimming for one fact expects.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GUIDES, getGuide } from "./guide-data";
import type { Guide, GuideSection } from "./entries";
import { PERSON_ID, ORG_ID, SITE_ID } from "@/components/JsonLd";
import { Alternatives, InShort, KeyTakeaways } from "@/components/aeo/AnswerBlocks";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export function guideMetadata(slug: string): Metadata {
  const g = getGuide(slug);
  if (!g) return {};
  const path = `/guides/${g.slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: absoluteUrl(path),
      title: g.title,
      description: g.description,
      publishedTime: g.checked,
      modifiedTime: g.checked,
      images: [{ url: `/og/guides/${g.slug}.png`, width: 1200, height: 630, alt: g.title }],
    },
    twitter: { card: "summary_large_image", title: g.title, description: g.description, images: [`/og/guides/${g.slug}.png`] },
  };
}

function guideSchema(g: Guide) {
  const url = absoluteUrl(`/guides/${g.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: g.title.slice(0, 110),
        description: g.description,
        url,
        inLanguage: "en-IN",
        datePublished: g.checked,
        dateModified: g.checked,
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        image: absoluteUrl(`/og/guides/${g.slug}.png`),
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        name: g.h1,
        numberOfItems: g.entries.length,
        itemListElement: g.entries.map((e, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: e.name,
          url: e.url,
          description: e.what,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
          { "@type": "ListItem", position: 3, name: g.h1, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: g.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

const anchor = (heading: string) => heading.replace(/\W+/g, "-").toLowerCase().replace(/^-|-$/g, "");

/**
 * One section: heading, prose, an optional list and an optional table of its
 * own. The table is a section's rather than the guide's because the question
 * worth tabulating differs from guide to guide — "does it interrupt you"
 * earns a column in the pet guide and nowhere else.
 */
function Section({ section }: { section: GuideSection }) {
  const id = anchor(section.heading);
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{section.heading}</h2>
      {section.body.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
      {section.list && <ul className="guide-list">{section.list.map((l) => <li key={l}>{l}</li>)}</ul>}
      {section.table && (
        <div className="comparison-table-wrap">
          <table className="comparison-table guide-table">
            <caption className="sr-only">{section.table.caption}</caption>
            <thead>
              <tr>{section.table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
            </thead>
            <tbody>
              {section.table.rows.map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  {row.slice(1).map((cell, i) => <td key={section.table!.columns[i + 1]}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function GuidePage({ slug }: { slug: string }) {
  const g = getGuide(slug);
  if (!g) return null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSchema(g)).replace(/</g, "\\u003c") }}
      />
      <main className="guide wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/guides">Guides</Link> <span>/</span> {g.h1}
        </nav>

        <header className="guide-head">
          <p className="eyebrow">GUIDE · CHECKED {g.checked}</p>
          <h1>{g.h1}</h1>
          {/* The summary is first because it is the answer. Everything below
              is the working; an answer engine should not have to find it. */}
          <p className="guide-summary">{g.summary}</p>
        </header>

        <KeyTakeaways points={g.takeaways} />

        {g.sections.map((s) => <Section key={s.heading} section={s} />)}

        <section aria-labelledby="the-apps">
          <h2 id="the-apps">The apps, compared</h2>
          <div className="comparison-table-wrap">
            <table className="comparison-table guide-table">
              <caption className="sr-only">{g.h1}: platforms, price and what each does</caption>
              <thead>
                <tr>
                  <th scope="col">App</th><th scope="col">What it does</th>
                  <th scope="col">Platforms</th><th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {g.entries.map((e) => (
                  <tr key={e.name}>
                    <th scope="row">
                      {e.url.startsWith("https://www.sharancreatedthis.in")
                        ? <Link href="/products/hangly">{e.name}</Link>
                        : <a href={e.url} rel="nofollow noopener noreferrer" target="_blank">{e.name}</a>}
                    </th>
                    <td>{e.what}</td>
                    <td>{e.platforms}</td>
                    <td>{e.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="guide-notes">
            {g.entries.map((e) => (
              <div key={e.name}>
                <h3>{e.name}</h3>
                <p><strong>Best for:</strong> {e.bestFor}</p>
                <p>{e.note}</p>
              </div>
            ))}
          </div>
          <p className="comparison-checked">
            Every product read from its own site on {g.checked}. Products change — check before deciding.
          </p>
        </section>

        {g.closing.map((s) => <Section key={s.heading} section={s} />)}

        <section aria-labelledby="guide-faq">
          <h2 id="guide-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {g.faqs.map((f) => (
              <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
            ))}
          </div>
        </section>

        <InShort>{g.inShort}</InShort>

        <section className="guide-cta" aria-labelledby="try-hangly">
          <h2 id="try-hangly">Try Hangly</h2>
          <p>
            Free on macOS 14+ and Windows 10+, including native ARM64. Seventy-five charms across eleven
            collections, and any image of your own as a charm.
          </p>
          <div className="hero-actions">
            <DownloadButton />
            <Link className="button button-quiet" href="/products/hangly">
              About Hangly <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </section>

        <Alternatives
          items={[
            ...g.related.map((r) => ({ label: r.label, href: r.href, note: "" })),
            ...GUIDES.filter((x) => x.slug !== g.slug && !g.related.some((r) => r.href.endsWith(x.slug)))
              .slice(0, 3)
              .map((x) => ({ label: x.h1, href: `/guides/${x.slug}`, note: x.summary.split(". ")[0] + "." })),
          ]}
        />
      </main>
      <PlatformSheet />
    </>
  );
}
