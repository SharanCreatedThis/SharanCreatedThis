import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import { COMPARISONS } from "@/data/hangly-comparisons";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

/**
 * One comparison page per competitor, generated from data.
 *
 * These exist because of a measured deficit. A crawl of the category found
 * Screen Dangle with 1,427 indexed URLs, Cat Fidget with 673, and Hangly with
 * one page. Competitors also already own the phrases people search before they
 * choose — "desktop goose alternative", "shimeji alternative" — and OpenPets
 * ranks an entire /alternatives/ section for exactly that shape of query.
 *
 * Each page states where the other product wins. That is not modesty: a
 * comparison whose every row favours the author is read as an advertisement
 * by people and discounted by answer engines, which is the opposite of why
 * these were built.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COMPARISONS.find((x) => x.slug === slug);
  if (!c) return {};
  const path = `/products/hangly/vs/${c.slug}`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: absoluteUrl(path),
      title: c.title,
      description: c.description,
      images: [{ url: "/og/hangly.png", width: 1200, height: 630, alt: c.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.title,
      description: c.description,
      images: ["/og/hangly.png"],
    },
  };
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPARISONS.find((x) => x.slug === slug);
  if (!c) return null;
  const path = `/products/hangly/vs/${c.slug}`;
  const others = COMPARISONS.filter((x) => x.slug !== c.slug);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: "Hangly", path: "/products/hangly" },
          { name: `vs ${c.rival}`, path },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                "@id": `${absoluteUrl(path)}#faq`,
                mainEntity: c.faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
              {
                "@type": "Article",
                "@id": `${absoluteUrl(path)}#article`,
                headline: c.title,
                description: c.description,
                datePublished: c.checked,
                dateModified: c.checked,
                author: { "@id": `${absoluteUrl("/")}/#person`.replace("//#", "/#") },
                mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />

      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/products/hangly">Hangly</Link> <span>/</span> vs {c.rival}
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">HONEST COMPARISON</p>
          <h1>{c.h1}</h1>
          <p className="comparison-verdict">{c.verdict}</p>
          <div className="hero-actions">
            <DownloadButton />
            <Link className="button button-quiet" href="/products/hangly">
              About Hangly <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </header>

        <section aria-labelledby="at-a-glance">
          <h2 id="at-a-glance">At a glance</h2>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr><th scope="col">Feature</th><th scope="col">Hangly</th><th scope="col">{c.rival}</th></tr>
              </thead>
              <tbody>
                {c.rows.map((r) => (
                  <tr key={r.feature}>
                    <th scope="row">{r.feature}</th>
                    <td>{r.hangly}</td>
                    <td>{r.rival}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="comparison-checked">
            {c.rival} details taken from{" "}
            <a href={c.rivalUrl} rel="nofollow noopener noreferrer" target="_blank">their own site</a>{" "}
            on {c.checked}. Products change — check theirs before deciding.
          </p>
        </section>

        <section className="comparison-wins" aria-labelledby="who-wins">
          <h2 id="who-wins">Where each one wins</h2>
          <div className="comparison-wins-grid">
            <div>
              <h3>Choose {c.rival} if…</h3>
              <ul>{c.rivalWins.map((w) => <li key={w}><Minus size={15} />{w}</li>)}</ul>
            </div>
            <div>
              <h3>Choose Hangly if…</h3>
              <ul>{c.hanglyWins.map((w) => <li key={w}><Check size={15} />{w}</li>)}</ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="cmp-faq">
          <h2 id="cmp-faq">Questions</h2>
          <div className="comparison-faq">
            {c.faqs.map((f) => (
              <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
            ))}
          </div>
        </section>

        <section aria-labelledby="other-cmp">
          <h2 id="other-cmp">Other comparisons</h2>
          <ul className="comparison-others">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/products/hangly/vs/${o.slug}`}>Hangly vs {o.rival}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
