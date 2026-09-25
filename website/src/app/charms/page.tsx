import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  CHARMS, buildSearchIndex, categoriesIn, regionsIn, charmCollectionGraph,
  CHARMS_WITHOUT_ARTWORK,
} from "@/lib/charms";
import { GroupedCharmGrid, CharmFilters } from "@/components/charms";
import { HANGLY_STATS, HANGLY_CATEGORIES, HANGLY_COPY } from "@/lib/stats/hangly";
import { serialise } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/charms";
const URL_ = absoluteUrl(PATH);
const TITLE = "Every Hangly Charm — The Complete Catalogue";
const DESCRIPTION =
  "Every charm Hangly ships, with what each one is and where it comes from. Protection charms, luck charms, Tamil spiritual symbols, seasonal sets and more. Free.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/hangly.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/hangly.png"] },
};

const FAQS = [
  {
    q: "How many charms does Hangly have?",
    a: `${HANGLY_STATS.charmCount}, across ${HANGLY_STATS.categoryCount} categories, in Hangly ${HANGLY_STATS.appVersion}. Every one is free, and you can add any image of your own as a charm on top of them.`,
  },
  {
    q: "What kinds of charms are there?",
    a: `${HANGLY_CATEGORIES.map((c) => `${c.name} (${c.charms})`).join(", ")}.`,
  },
  {
    q: "Do the seasonal charms only appear in season?",
    a: `No. All ${HANGLY_STATS.charmCount} charms can be chosen by hand at any time of year. What the calendar changes is what the app puts on the rope by default — the Halloween set in October, Diwali, Christmas and New Year in their turn — and it puts back whatever was there when the season ends.`,
  },
  {
    q: "Where do the charms come from?",
    a: `${regionsIn().length} places, from Turkey and Tamil Nadu to Japan, China, Finland and Ancient Egypt. Each charm records its own origin, and the meanings given here are the ones the app itself carries.`,
  },
  {
    q: "Is this every charm, or only some of them?",
    a: `Every one. This page lists all ${HANGLY_STATS.charmCount} charms in Hangly ${HANGLY_STATS.appVersion}, including the ones the app surfaces seasonally. It is generated from the application's own catalogue, so nothing can be missing from it that is present in the app.`,
  },
];

const schema = charmCollectionGraph({
  charms: CHARMS,
  pageUrl: URL_,
  name: TITLE,
  description: DESCRIPTION,
  trail: [{ name: "Home", path: "/" }, { name: "Charms", path: PATH }],
  extra: [
    {
      "@type": "FAQPage",
      "@id": `${URL_}#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
});

export default function CharmsPage() {
  const index = buildSearchIndex();
  const categories = categoriesIn().map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap charms-page">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> Charms
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">
            {HANGLY_STATS.charmCount} CHARMS · {HANGLY_STATS.categoryCount} CATEGORIES · FREE
          </p>
          <h1>Every charm<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            The whole catalogue, with what each charm is and where it comes from. Read from the
            application itself, so this page and the app cannot disagree.
          </p>
          <div className="hero-actions">
            <DownloadButton />
            <Link className="button button-quiet" href="/products/hangly">
              About Hangly <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </header>

        <QuickAnswer>
          Hangly ships {HANGLY_COPY.exactWithCategories}, free, on macOS and Windows. They range
          from protection charms like the nazar and the drishti bommai, through luck charms from
          Japan, China and Europe, to Tamil spiritual symbols and {HANGLY_STATS.seasonalCharmCount}{" "}
          seasonal charms that arrive on their own. Any image of your own can be a charm too.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `${HANGLY_STATS.charmCount} charms across ${HANGLY_STATS.categoryCount} categories, all free`,
            `${regionsIn().length} regions represented, from Turkey to Tamil Nadu to Ancient Egypt`,
            `${HANGLY_STATS.seasonalCharmCount} seasonal charms in four packs, which arrive on their own and hand the rope back afterwards`,
            "Every charm is selectable by hand at any time of year",
            "Any image of your own becomes a charm, at no cost",
          ]}
        />

        <section aria-labelledby="browse">
          <h2 id="browse">Browse the catalogue</h2>
          <CharmFilters
            index={index}
            categories={categories}
            regions={regionsIn()}
            total={CHARMS.length}
          />
          <GroupedCharmGrid charms={CHARMS} />
        </section>

        <section aria-labelledby="categories">
          <h2 id="categories">Categories</h2>
          <div className="comparison-table-wrap">
            <table className="comparison-table guide-table">
              <caption className="sr-only">Hangly charm categories and how many charms each holds</caption>
              <thead><tr><th scope="col">Category</th><th scope="col">Charms</th></tr></thead>
              <tbody>
                {HANGLY_CATEGORIES.map((c) => (
                  <tr key={c.id}><th scope="row">{c.name}</th><td>{c.charms}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {CHARMS_WITHOUT_ARTWORK.size > 0 && (
            <p className="comparison-checked">
              {CHARMS_WITHOUT_ARTWORK.size} charms are listed without artwork here. They ship in
              the app; their drawings have not been published to this site yet.
            </p>
          )}
        </section>

        <section className="comparison-faq-block" aria-labelledby="charms-faq">
          <h2 id="charms-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </div>
        </section>

        <InShort>
          {HANGLY_COPY.exactWithCategories}, free on macOS and Windows, every one selectable at any
          time. The counts here are read from the shipped application rather than written by hand,
          and the meanings are the ones the app itself carries.
        </InShort>

        <section aria-labelledby="charms-more">
          <h2 id="charms-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/charms/lucky">Luck, protection and ritual charms</Link></li>
            <li><Link href="/charms/seasonal">Seasonal charms</Link></li>
            <li><Link href="/products/hangly">The Hangly product page</Link></li>
            <li><Link href="/products/hangly/stats">Statistics and specifications</Link></li>
            <li><Link href="/download">Download Hangly</Link></li>
            <li><Link href="/compare">How Hangly compares</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
