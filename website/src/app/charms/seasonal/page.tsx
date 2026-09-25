import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { seasonalCharms, getCharm, SEASONAL_PACKS, charmCollectionGraph } from "@/lib/charms";
import { CharmGrid } from "@/components/charms";
import { serialise } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { HANGLY_STATS } from "@/lib/stats/hangly";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/charms/seasonal";
const URL_ = absoluteUrl(PATH);
const CHARMS = seasonalCharms();
const TITLE = "Seasonal Desktop Charms — Halloween, Diwali, Christmas";
const DESCRIPTION =
  "Eleven seasonal charms in four packs that arrive on their own and hand the screen back afterwards. Halloween, Diwali, Christmas and New Year. Free.";

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
    q: "Do Hangly's seasonal charms appear automatically?",
    a: "Yes. When a season comes round the app puts that pack on the rope, and when it ends it puts back whatever was there before — which survives a restart, because it is stored rather than remembered. You can also switch the behaviour off, or pin one pack all year.",
  },
  {
    q: "Can I use a Halloween charm in March?",
    a: `Yes. All ${HANGLY_STATS.charmCount} charms can be chosen by hand at any time of year. The calendar only changes what the app puts on the rope by default, never what is available to you.`,
  },
  {
    q: "What happens if I pick my own charm during a season?",
    a: "The season steps aside. Once you choose something else the rope is no longer dressed as that pack, so nothing will be put back over your choice later and nothing will be taken away again that year.",
  },
  {
    q: "When do the Diwali charms appear?",
    a: "Diwali moves with the lunar calendar, so unlike the other three the window is not fixed. The app carries a default of early November and lets you correct it, which is the honest way to handle a date that shifts by weeks each year.",
  },
  {
    q: "Which charms are in each pack?",
    a: SEASONAL_PACKS.map((p) => `${p.name}: ${p.charms.map((id) => getCharm(id)?.name ?? id).join(", ")}`).join(". ") + ".",
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
    { name: "Seasonal", path: PATH },
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

export default function SeasonalCharmsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap charms-page">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/charms">Charms</Link> <span>/</span> Seasonal
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">{CHARMS.length} CHARMS · {SEASONAL_PACKS.length} PACKS · FREE</p>
          <h1>Charms that know the date<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Four packs that arrive on their own and hand the screen back afterwards. The undressing
            is the part that makes the dressing acceptable.
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
          Hangly ships {CHARMS.length} seasonal charms in {SEASONAL_PACKS.length} packs — Halloween,
          Diwali, Christmas and New Year. Each pack appears on the rope when its season comes round
          and is replaced by whatever was there before when it ends. You can switch that off, pin a
          pack all year, or simply choose any of them by hand whenever you like.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `${CHARMS.length} charms across ${SEASONAL_PACKS.length} packs, all free`,
            "Packs arrive by date and restore what was there afterwards — it survives a restart",
            "Pick something yourself and the season stands aside for the rest of the year",
            "Diwali moves with the lunar calendar, so its window is editable rather than fixed",
            "Nothing is date-locked: every charm is selectable at any time",
          ]}
        />

        {SEASONAL_PACKS.map((pack) => {
          const charms = pack.charms.map((id) => getCharm(id)).filter(Boolean) as ReturnType<typeof seasonalCharms>;
          return (
            <section key={pack.id} aria-labelledby={`pack-${pack.id}`}>
              <h2 id={`pack-${pack.id}`}>{pack.name}</h2>
              <p className="charm-pack-window">{pack.window}</p>
              <CharmGrid charms={charms} />
            </section>
          );
        })}

        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works">How the seasons work</h2>
          <p>
            A pack dresses the rope on the first day of its window. What was hanging there is
            written into settings first and put back when the season ends, so nothing you chose is
            lost — and because it is stored rather than held in memory, it survives a restart.
          </p>
          <p>
            It also gives way. If a season is running and you pick something else, the rope stops
            being dressed as that pack: nothing will be placed over your choice later, and nothing
            will be taken away again that year. Changing what somebody chose is a liberty; changing
            it back is what turns it into a decoration rather than a nuisance.
          </p>
          <p>
            Christmas ends on Boxing Day and New Year starts the next morning, so no day is claimed
            twice. Diwali is the exception to fixed dates — it follows the lunar calendar and moves
            by weeks from year to year, so the app carries an approximate window and lets you
            correct it rather than pretending a fixed date is right.
          </p>
        </section>

        <section className="comparison-faq-block" aria-labelledby="seasonal-faq">
          <h2 id="seasonal-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </div>
        </section>

        <InShort>
          Eleven charms, four packs, free. They arrive when the season does and give the screen
          back when it passes, and none of them is locked to a date if you would rather hang a
          pumpkin in June.
        </InShort>

        <section aria-labelledby="seasonal-more">
          <h2 id="seasonal-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/charms">Every Hangly charm</Link></li>
            <li><Link href="/charms/lucky">Luck and protection charms</Link></li>
            <li><Link href="/products/hangly">The Hangly product page</Link></li>
            <li><Link href="/download">Download Hangly</Link></li>
            <li><Link href="/faq">Frequently asked questions</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
