/**
 * The shared rendering for every comparison page.
 *
 * A new competitor needs one entry in comparison-data.ts and nothing else:
 * the route, metadata, all three schema blocks, the sitemap entry and the
 * cross-links between pages are generated from it.
 *
 * Structure is deliberate rather than decorative. Each section is a heading
 * followed by a direct answer, because an answer engine lifts a stated answer
 * far more readily than it summarises prose — and the same structure is what
 * a person skimming for one fact wants. The two goals do not conflict here.
 *
 * Server-rendered throughout. Nothing on this page needs to be interactive,
 * and shipping JavaScript to animate a table would cost more than it returns.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import { COMPARISONS, getComparison, type Comparison } from "./comparison-data";
import { comparisonSchema, serialise } from "./comparison-schema";
import { Alternatives, BestFor, InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export function comparisonMetadata(slug: string): Metadata {
  const c = getComparison(slug);
  if (!c) return {};
  const path = `/compare/${c.slug}`;
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

/** A heading and a paragraph. Used for the six comparison dimensions. */
function Section({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      {children}
    </section>
  );
}

export function ComparisonPage({ slug }: { slug: string }) {
  const c: Comparison | undefined = getComparison(slug);
  if (!c) return null;
  const path = `/compare/${c.slug}`;
  const others = COMPARISONS.filter((x) => x.slug !== c.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(comparisonSchema(c)) }} />

      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/compare">Compare</Link> <span>/</span> Hangly vs {c.name}
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">HONEST COMPARISON · CHECKED {c.checked}</p>
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

        <QuickAnswer>{c.quickAnswer}</QuickAnswer>
        <KeyTakeaways points={c.takeaways} />

        <Section id="what-is" heading={`What is ${c.name}?`}>
          <p>{c.whatIsIt}</p>
          <p className="comparison-checked">
            Taken from{" "}
            <a href={c.url} rel="nofollow noopener noreferrer" target="_blank">their own site</a> on {c.checked}.
            Products change — check theirs before deciding.
          </p>
        </Section>

        <Section id="differs" heading="How Hangly differs">
          <p>{c.howHanglyDiffers}</p>
        </Section>

        <Section id="features" heading="Feature comparison">
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <caption className="sr-only">Hangly compared with {c.name}, feature by feature</caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Hangly</th>
                  <th scope="col">{c.name}</th>
                </tr>
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
        </Section>

        <Section id="performance" heading="Performance">
          <p>{c.performance}</p>
        </Section>
        <Section id="customisation" heading="Customisation">
          <p>{c.customisation}</p>
        </Section>
        <Section id="privacy" heading="Privacy">
          <p>{c.privacy}</p>
        </Section>
        <Section id="platforms" heading="Platform support">
          <p>{c.platforms}</p>
        </Section>

        <section className="comparison-wins" aria-labelledby="who-wins">
          <h2 id="who-wins">Where each one wins</h2>
          <div className="comparison-wins-grid">
            <div>
              <h3>Choose {c.name} if…</h3>
              <ul>{c.rivalWins.map((w) => <li key={w}><Minus size={15} />{w}</li>)}</ul>
            </div>
            <div>
              <h3>Choose Hangly if…</h3>
              <ul>{c.hanglyWins.map((w) => <li key={w}><Check size={15} />{w}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="comparison-answers" aria-labelledby="direct-answers">
          <h2 id="direct-answers">Direct answers</h2>
          {c.answers.map((a) => (
            <div key={a.question}>
              <h3>{a.question}</h3>
              <p>{a.answer}</p>
              {a.points && <ul>{a.points.map((p) => <li key={p}>{p}</li>)}</ul>}
            </div>
          ))}
        </section>

        <section className="comparison-faq-block" aria-labelledby="cmp-faq">
          <h2 id="cmp-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {c.faqs.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
          <p className="comparison-more">
            More questions about Hangly are answered on the <Link href="/faq">FAQ page</Link>, and the{" "}
            <Link href="/guides">guides</Link> cover the wider category.
          </p>
        </section>

        <BestFor cases={c.bestFor} />

        <Alternatives
          items={[
            ...others.map((o) => ({
              label: `Hangly vs ${o.name}`,
              href: `/compare/${o.slug}`,
              note: o.verdict,
            })),
            {
              label: "Every desktop charm app for Mac, compared",
              href: "/guides/best-desktop-charm-apps-for-mac",
              note: "The whole category in one table, including the ones with no page here.",
            },
          ]}
        />

        <InShort>{c.inShort}</InShort>
      </main>
      <PlatformSheet />
    </>
  );
}
