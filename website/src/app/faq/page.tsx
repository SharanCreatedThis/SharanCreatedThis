import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FAQ_GROUPS, ALL_FAQS, faqSlug } from "@/data/hangly-faq";
import { COMPARISONS } from "@/lib/comparisons";
import { PERSON_ID, ORG_ID, SITE_ID } from "@/components/JsonLd";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { ID } from "@/lib/schema/entities";
import { InShort, QuickAnswer } from "@/components/aeo/AnswerBlocks";

/**
 * The FAQ, as its own indexable page.
 *
 * Server-rendered with no client component anywhere in it: every question and
 * answer is in the HTML a crawler receives. The version on the product page
 * uses a disclosure control for density, which is right there and wrong here —
 * this page exists to be read whole, by people and by answer engines, so
 * nothing is collapsed and nothing waits on JavaScript.
 */

const TITLE = "Hangly FAQ: Desktop Charms for Mac and Windows";
const DESCRIPTION =
  "Fifty answers about Hangly — what it is, what it costs, which platforms it runs on, and how it compares with desktop pets. Free for macOS and Windows.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: absoluteUrl("/faq"),
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og/faq.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/faq.png"] },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": `${absoluteUrl("/faq")}#faqpage`,
      url: absoluteUrl("/faq"),
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-IN",
      isPartOf: { "@id": SITE_ID },
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
      about: { "@id": ID.hangly },
      mainEntity: ALL_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${absoluteUrl("/faq")}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "FAQ", item: absoluteUrl("/faq") },
      ],
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <main className="faq-page wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> FAQ
        </nav>

        <header className="faq-page-head">
          <p className="eyebrow">{ALL_FAQS.length} QUESTIONS, ANSWERED</p>
          <h1>Hangly, explained<span className="orange">.</span></h1>
          <p className="faq-page-lead">
            Everything worth asking about Hangly — a free desktop charm app for macOS and Windows.
            If something is missing, ask on <a href="https://www.instagram.com/sharan.created.this/" rel="noopener noreferrer" target="_blank">Instagram</a>.
          </p>
          <div className="hero-actions">
            <DownloadButton />
            <Link className="button button-quiet" href="/products/hangly">
              See Hangly <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </header>

        <QuickAnswer>
          Hangly is a free desktop app for macOS 14+ and Windows 10+ that hangs a decorative charm
          from the top of your screen on a cord, swaying with real pendulum physics. It is
          click-through, so it never intercepts a click or takes keyboard focus. There is no
          account, no trial and no paid tier, and it updates itself once installed.
        </QuickAnswer>

        <nav className="faq-toc" aria-label="Sections">
          {FAQ_GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`}>{g.heading}</a>
          ))}
        </nav>

        {FAQ_GROUPS.map((group) => (
          <section key={group.id} id={group.id} aria-labelledby={`h-${group.id}`}>
            <h2 id={`h-${group.id}`}>{group.heading}</h2>
            <div className="faq-page-list">
              {group.faqs.map((faq) => (
                /* The anchor lets other pages link to one answer rather than
                   restating it, which is how a question ends up on two URLs. */
                <article key={faq.q} id={faqSlug(faq.q)}>
                  <h3>{faq.q}</h3>
                  {faq.ownedBy ? (
                    <p>
                      Answered in full on <Link href={faq.ownedBy.path}>{faq.ownedBy.label}</Link>,
                      which is the page written for it.
                    </p>
                  ) : (
                    <p>{faq.a}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        <InShort>
          Free on both platforms, safe during a screen share because it cannot intercept a click,
          and self-updating after install. The macOS build is the mature one at 2.0; Windows is
          still a pre-release at 0.9.x and shows a SmartScreen warning once because it is not
          code-signed yet. If a question here is unanswered, the guides cover the wider category
          and the comparisons cover specific rivals.
        </InShort>

        <section aria-labelledby="faq-compare">
          <h2 id="faq-compare">Comparisons</h2>
          <p>Deciding between Hangly and something else? Each comparison says where the other one wins.</p>
          <ul className="comparison-others">
            {COMPARISONS.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`}>Hangly vs {c.name}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-next">
          <h2 id="faq-next">Read next</h2>
          <ul className="comparison-others">
            <li><Link href="/products/hangly">Hangly product page</Link></li>
            <li><Link href="/guides">Guides</Link></li>
            <li><Link href="/products/hangly/privacy">Privacy</Link></li>
            <li><Link href="/products">All products</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
