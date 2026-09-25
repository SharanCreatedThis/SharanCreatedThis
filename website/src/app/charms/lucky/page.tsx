import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { luckyCharms, charmCollectionGraph } from "@/lib/charms";
import { COMPETITOR_CHARM_PRICING, COMPETITOR_CHARM_PRICING_CHECKED } from "@/lib/charms/competitors";
import { GroupedCharmGrid } from "@/components/charms";
import { serialise } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/charms/lucky";
const URL_ = absoluteUrl(PATH);
const CHARMS = luckyCharms();
const TITLE = "Lucky & Protection Charms for Your Desktop — Free";
const DESCRIPTION =
  "The nazar, hamsa, daruma, maneki-neko, horseshoe and more — twelve cultural luck and protection charms that hang from your screen. Free on Mac and Windows.";

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
    q: "Which lucky charms does Hangly include?",
    a: `${CHARMS.map((c) => c.name).join(", ")}. All ${CHARMS.length} are free, with no tier and no purchase.`,
  },
  {
    q: "Is there a free desktop app with a nazar or evil eye charm?",
    a: "Yes. Hangly includes the Nazar boncuğu, the Drishti bommai, the Hamsa and the Nimbu-mirchi, free on macOS and Windows. Several apps in this category charge for the same charms.",
  },
  {
    q: "What is a drishti bommai?",
    a: "A South Indian guardian face, hung to take the first look and absorb it. It is one of the four protection charms Hangly ships, alongside the nazar, the hamsa and the nimbu-mirchi.",
  },
  {
    q: "Does Hangly have a maneki-neko or a daruma?",
    a: "Both. The maneki-neko is the beckoning cat with the raised paw; the daruma is the round weighted doll you paint one eye of when you set a goal and the other when you reach it. Both are free.",
  },
  {
    q: "Do I have to pay for the cultural charms?",
    a: "No. Every charm in Hangly is free, including all twelve here. There is no paid tier, no trial and no per-charm purchase.",
  },
];

const schema = charmCollectionGraph({
  charms: CHARMS,
  pageUrl: URL_,
  name: TITLE,
  description: DESCRIPTION,
  trail: [
    { name: "Home", path: "/" },
    { name: "Charms", path: "/charms" },
    { name: "Luck and protection", path: PATH },
  ],
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

export default function LuckyCharmsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap charms-page">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/charms">Charms</Link> <span>/</span> Luck and protection
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">{CHARMS.length} CHARMS · FREE · MAC AND WINDOWS</p>
          <h1>Luck and protection<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Charms people have hung by doorways for centuries, on a cord at the top of your screen.
            Every one is free.
          </p>
          <div className="hero-actions">
            <DownloadButton />
            <Link className="button button-quiet" href="/charms">
              All charms <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </header>

        <QuickAnswer>
          Hangly ships {CHARMS.length} cultural luck and protection charms free: the Nazar
          boncuğu, Hamsa, Nimbu-mirchi, Drishti bommai, Scarab and Dream Catcher for protection;
          the Pánchángjié, Daruma, Maneki-neko and Horseshoe for luck; and the Ghanta and Himmeli
          for the home. Most apps in this category charge for a smaller set of the same charms.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `All ${CHARMS.length} are free — no tier, no trial, no per-charm purchase`,
            "Six protection charms, four luck charms, two for the home",
            "Origins across Turkey, India, Japan, China, Egypt, Finland and Europe",
            "Each carries the meaning the app itself records, not a marketing line",
            "Any image of your own can be a charm alongside them",
          ]}
        />

        <section aria-labelledby="the-charms">
          <h2 id="the-charms">The {CHARMS.length} charms</h2>
          <GroupedCharmGrid charms={CHARMS} />
        </section>

        <section aria-labelledby="what-others-charge">
          <h2 id="what-others-charge">What other apps charge for these</h2>
          <p>
            These charms are the common ground of the whole category — the nazar in particular
            appears in almost every competing app. What differs is the price.
          </p>
          <div className="comparison-table-wrap">
            <table className="comparison-table guide-table">
              <caption className="sr-only">What competing desktop charm apps charge for comparable cultural charms</caption>
              <thead><tr><th scope="col">App</th><th scope="col">Cultural charms</th><th scope="col">Price</th></tr></thead>
              <tbody>
                <tr><th scope="row">Hangly</th><td>{CHARMS.length}</td><td>Free</td></tr>
                {COMPETITOR_CHARM_PRICING.map((c) => (
                  <tr key={c.name}>
                    <th scope="row">{c.name}</th>
                    <td>{c.charms}</td>
                    <td>{c.price}{c.note ? `, ${c.note}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="comparison-checked">
            Competitor figures read from each product&apos;s own site on {COMPETITOR_CHARM_PRICING_CHECKED}.
            Products change — check theirs before deciding. The full comparisons are on the{" "}
            <Link href="/compare">compare page</Link>.
          </p>
        </section>

        <section className="comparison-faq-block" aria-labelledby="lucky-faq">
          <h2 id="lucky-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </div>
        </section>

        <InShort>
          Twelve cultural charms — {CHARMS.map((c) => c.name).slice(0, 4).join(", ")} and eight
          more — free on Mac and Windows, each with the meaning the app itself records. The rest of
          the catalogue is on <Link href="/charms">the charms page</Link>.
        </InShort>

        <section aria-labelledby="lucky-more">
          <h2 id="lucky-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/charms">Every Hangly charm</Link></li>
            <li><Link href="/charms/seasonal">Seasonal charms</Link></li>
            <li><Link href="/compare/lucky-dangle">Hangly compared with Lucky Dangle</Link></li>
            <li><Link href="/guides/best-desktop-charm-apps-for-mac">Every desktop charm app, compared</Link></li>
            <li><Link href="/download">Download Hangly</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
