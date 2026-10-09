import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HANGLY_LOCALES, LOCALE_CODES, getLocale, hanglyLanguageAlternates, type HanglyLocale } from "@/data/hangly/locales";
import { HANGLY_STATS } from "@/lib/stats/hangly";
import { BUILDS } from "@/lib/downloads";
import { ID } from "@/lib/schema/entities";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

/**
 * Hangly's page in another language: /<code>/hangly. Content in src/data/hangly/locales.ts; numbers filled in here
 * from the shipped catalogue and the update feeds, so no translation can disagree with the app.
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

const fill = (text: string) =>
  text
    .replaceAll("{charms}", String(HANGLY_STATS.charmCount))
    .replaceAll("{categories}", String(HANGLY_STATS.categoryCount))
    .replaceAll("{ropes}", String(HANGLY_STATS.ropeStyleCount))
    .replaceAll("{version}", HANGLY_STATS.macVersion);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const l = getLocale((await params).locale);
  if (!l) return {};
  const path = `/${l.code}/hangly`;
  const title = fill(l.title);
  const description = fill(l.description);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path, languages: hanglyLanguageAlternates() },
    openGraph: {
      type: "website", siteName: SITE_NAME, locale: l.ogLocale, url: absoluteUrl(path), title, description,
      images: [{ url: "/og/hangly.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og/hangly.png"] },
  };
}

function schema(l: HanglyLocale) {
  const url = absoluteUrl(`/${l.code}/hangly`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": `${url}#page`, url, name: fill(l.title), description: fill(l.description),
        inLanguage: l.hreflang, about: { "@id": ID.hangly }, isPartOf: { "@id": absoluteUrl("/#website") },
      },
      {
        "@type": "FAQPage", "@id": `${url}#faq`, inLanguage: l.hreflang,
        mainEntity: l.faqs.map((f) => ({ "@type": "Question", name: fill(f.q), acceptedAnswer: { "@type": "Answer", text: fill(f.a) } })),
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hangly", item: absoluteUrl("/products/hangly") },
          { "@type": "ListItem", position: 2, name: l.name, item: url },
        ],
      },
    ],
  };
}

export default async function LocalizedHangly({ params }: { params: Promise<{ locale: string }> }) {
  const l = getLocale((await params).locale);
  if (!l) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema(l)).replace(/</g, "\\u003c") }} />
      <main className="guide wrap" lang={l.hreflang} dir={l.dir}>
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/products/hangly" hrefLang="en">Hangly</Link> <span>/</span> {l.name}
        </nav>
        <header className="guide-head">
          <p className="eyebrow">HANGLY · {l.name.toUpperCase()}</p>
          <h1>{fill(l.h1)}</h1>
          <p className="guide-summary">{fill(l.summary)}</p>
        </header>

        <section aria-labelledby="download">
          <h2 id="download">{l.download.heading}</h2>
          <p className="locale-downloads">
            <a className="button button-primary" href={BUILDS.mac.href}>{l.download.mac}</a>{" "}
            <a className="button button-quiet" href={BUILDS["windows-x64"].href}>{l.download.windows}</a>{" "}
            <a className="button button-quiet" href={BUILDS["windows-arm64"].href}>{l.download.arm}</a>
          </p>
          <p className="download-note">{l.download.note}</p>
        </section>

        <section aria-labelledby="facts">
          <h2 id="facts">{l.factsHeading}</h2>
          <ul className="guide-list">{l.facts.map((f) => fill(f)).map((f) => <li key={f}>{f}</li>)}</ul>
        </section>

        <section aria-labelledby="how">
          <h2 id="how">{l.howHeading}</h2>
          <ol className="guide-list">{l.howSteps.map((s) => fill(s)).map((s) => <li key={s}>{s}</li>)}</ol>
        </section>

        <section aria-labelledby="privacy">
          <h2 id="privacy">{l.privacyHeading}</h2>
          <p>{fill(l.privacy)}</p>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq">{l.faqHeading}</h2>
          {l.faqs.map((f) => <div key={fill(f.q)}><h3>{fill(f.q)}</h3><p>{fill(f.a)}</p></div>)}
        </section>

        <nav aria-label="Languages" className="locale-list">
          <p><Link href="/products/hangly" hrefLang="en" lang="en">{l.english}</Link></p>
          <p>
            {HANGLY_LOCALES.filter((o) => o.code !== l.code).map((o, i) => (
              <span key={o.code}>{i > 0 ? " · " : ""}<Link href={`/${o.code}/hangly`} hrefLang={o.hreflang} lang={o.hreflang}>{o.name}</Link></span>
            ))}
          </p>
        </nav>
      </main>
    </>
  );
}
