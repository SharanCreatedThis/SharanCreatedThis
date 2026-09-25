import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ARTWORK, RELEASE, GENERATED_AT } from "@/data/stats.generated";
import { HANGLY_STATS, HANGLY_CATEGORIES } from "@/lib/stats/hangly";
import { BUILDS, BUILD_ORDER } from "@/lib/downloads";
import { HANGLY_APP, ID, breadcrumb, faqNode, serialise, softwareNode } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/products/hangly/stats";
const URL_ = absoluteUrl(PATH);
const TITLE = "Hangly Statistics & Technical Specifications";
const DESCRIPTION =
  "Every published figure for Hangly: charms, categories, platform support and technical specifications — counted from the shipped application, not written by hand.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/hangly-stats.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/hangly-stats.png"] },
};

const mb = (b: number) => (b ? `${Math.round(b / 1_000_000)} MB` : "not published");

const FAQS = [
  {
    q: "How many charms does Hangly have?",
    a: `${HANGLY_STATS.charmCount}, across ${HANGLY_STATS.categoryCount} categories, read from the catalogue inside the shipped Hangly ${HANGLY_STATS.appVersion} application. The website carries artwork for ${ARTWORK.plain} of them — five Classic charms are drawn in code rather than from vectors, and a few of the newest have not been copied across.`,
  },
  {
    q: "How many collections are there?",
    a: `${HANGLY_STATS.categoryCount}: ${HANGLY_CATEGORIES.map((c) => c.name).join(", ")}.`,
  },
  {
    q: "What physics does Hangly actually simulate?",
    a: "A damped pendulum. The charm hangs from a fixed anchor at the top of the screen and swings under gravity, losing energy to damping until it comes to rest. It responds to being dragged and flicked, and it stops animating when it settles, which is why it costs nothing while idle.",
  },
  {
    q: "How large is the download?",
    a: `The macOS build is ${mb(RELEASE.macOS.bytes)}. It was 89 MB before version 2.0, which shipped the vector artwork the app draws from instead of a compiled catalogue that also carried a bitmap of every charm it never used.`,
  },
  {
    q: "Which platforms and processors are supported?",
    a: "macOS 14 or newer as a universal build covering Apple Silicon and Intel, Windows 10 or newer on x64, and Windows 11 on ARM64 as a native build rather than emulation.",
  },
  {
    q: "Can these figures be cited?",
    a: "Yes. Everything here is generated from the repository at build time — the collections component, the artwork directory and the Sparkle feed — and the page records the date it was generated. If a figure is wrong, the underlying data is wrong.",
  },
];

/**
 * Dataset, because that is honestly what this page is: a set of counted
 * measurements with a stated provenance and a generation date. Claiming
 * Dataset for a marketing page would be misuse; claiming it for figures
 * derived from source at build time is what the type is for.
 */
const schema = {
  "@context": "https://schema.org",
  "@graph": [
    softwareNode(HANGLY_APP),
    {
      "@type": "Dataset",
      "@id": `${URL_}#dataset`,
      name: "Hangly published statistics",
      description:
        "Counted figures for the Hangly desktop application: charms, collections, artwork files, platform support and release versions, derived from the application's own source and update feed.",
      url: URL_,
      inLanguage: "en-IN",
      license: "https://www.sharancreatedthis.in/products/hangly",
      isAccessibleForFree: true,
      dateModified: GENERATED_AT,
      creator: { "@id": ID.person },
      publisher: { "@id": ID.organization },
      about: { "@id": ID.hangly },
      measurementTechnique: `Counted at build time from CharmLibrary.json inside the shipped Hangly ${HANGLY_STATS.appVersion} application, plus the Sparkle appcast`,
      variableMeasured: [
        { "@type": "PropertyValue", name: "Charms in the shipped app", value: HANGLY_STATS.charmCount },
        { "@type": "PropertyValue", name: "Categories", value: HANGLY_STATS.categoryCount },
        { "@type": "PropertyValue", name: "Seasonal charms", value: HANGLY_STATS.seasonalCharmCount },
        { "@type": "PropertyValue", name: "Charm artwork files", value: ARTWORK.plain },
        { "@type": "PropertyValue", name: "Supported platforms", value: 3 },
        { "@type": "PropertyValue", name: "macOS version", value: RELEASE.macOS.version },
        { "@type": "PropertyValue", name: "Windows version", value: RELEASE.windows },
        { "@type": "PropertyValue", name: "macOS download size in bytes", value: RELEASE.macOS.bytes },
      ],
    },
    { "@type": "WebPage", "@id": `${URL_}#page`, url: URL_, name: TITLE, description: DESCRIPTION,
      inLanguage: "en-IN", isPartOf: { "@id": ID.website }, about: { "@id": ID.hangly },
      mainEntity: { "@id": `${URL_}#dataset` } },
    breadcrumb(
      [{ name: "Home", path: "/" }, { name: "Products", path: "/products" },
       { name: "Hangly", path: "/products/hangly" }, { name: "Statistics", path: PATH }],
      URL_,
    ),
    faqNode(FAQS, URL_),
  ],
};

function Table({ caption, columns, rows }: { caption: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="comparison-table-wrap">
      <table className="comparison-table guide-table">
        <caption className="sr-only">{caption}</caption>
        <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])}>
              <th scope="row">{r[0]}</th>
              {r.slice(1).map((cell, i) => <td key={columns[i + 1]}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StatsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/products">Products</Link> <span>/</span>{" "}
          <Link href="/products/hangly">Hangly</Link> <span>/</span> Statistics
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">GENERATED FROM SOURCE · {GENERATED_AT}</p>
          <h1>Hangly by the numbers<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Every figure here is counted from the application&apos;s own source at build time. None
            of it is typed in by hand, which means none of it can quietly go out of date.
          </p>
        </header>

        <QuickAnswer>
          Hangly ships {HANGLY_STATS.charmCount} charms across {HANGLY_STATS.categoryCount}{" "}
          categories, {HANGLY_STATS.seasonalCharmCount} of them seasonal. It runs on macOS 14 or newer as a universal build,
          and on Windows 10 or newer with separate x64 and native ARM64 builds. The macOS release
          is {RELEASE.macOS.version} at {mb(RELEASE.macOS.bytes)}; Windows is at {RELEASE.windows}{" "}
          and is still a pre-release. It is free on every platform.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `${HANGLY_STATS.charmCount} charms across ${HANGLY_STATS.categoryCount} categories in Hangly ${HANGLY_STATS.appVersion}`,
            `${HANGLY_STATS.seasonalCharmCount} seasonal charms, in four packs`,
            `Three builds: macOS universal, Windows x64, Windows ARM64 native`,
            `macOS ${RELEASE.macOS.version} at ${mb(RELEASE.macOS.bytes)}, down from 89 MB before 2.0`,
            "Free on every platform, with no account and no paid tier",
          ]}
        />

        <section aria-labelledby="counting">
          <h2 id="counting">Where this number comes from</h2>
          <p>
            <strong>{HANGLY_STATS.charmCount} charms</strong> is read from{" "}
            <code>CharmLibrary.json</code> inside the shipped application — the catalogue the
            running app loads. It cannot disagree with what you have installed, because it is the
            same file.
          </p>
          <p>
            This page previously published a different figure, twice. It said 75, which counted
            the SVG files in the website&apos;s artwork directory rather than the product, and
            before that 80+, which was written by hand. The website carries artwork for{" "}
            {ARTWORK.plain} of the {HANGLY_STATS.charmCount} — five of the Classic charms are
            drawn in code rather than from vectors, and a few of the newest have not been copied
            across. That gap is why counting the website was the wrong method rather than a close
            approximation.
          </p>
          <p>
            The catalogue is committed at{" "}
            <code>src/data/hangly/charm-library.shipped.json</code>, extracted from Hangly{" "}
            {HANGLY_STATS.appVersion}. A build check re-counts it and fails if any figure
            published here drifts from it.
          </p>
        </section>

        <section aria-labelledby="collections">
          <h2 id="collections">Categories</h2>
          <Table
            caption="Hangly charm categories and the number of charms in each"
            columns={["Category", "Charms"]}
            rows={HANGLY_CATEGORIES.map((c) => [c.name, c.charms])}
          />
        </section>

        <section aria-labelledby="platforms">
          <h2 id="platforms">Platform support</h2>
          <Table
            caption="Hangly platform support: operating system requirements and processor architectures"
            columns={["Build", "Requires", "Processors", "Updates through"]}
            rows={BUILD_ORDER.map((id) => {
              const b = BUILDS[id];
              return [b.name, b.requirement, b.detail, b.updater.split(".")[0] + "."];
            })}
          />
          <p>
            The native Windows ARM64 build is the unusual one. Almost nothing in this category
            publishes one, because a Windows-on-ARM machine reports <code>Win64; x64</code> in its
            user agent and is therefore invisible to any site detecting platforms the obvious way.
          </p>
        </section>

        <section aria-labelledby="physics">
          <h2 id="physics">The physics</h2>
          <p>
            The charm is a damped pendulum. It hangs from a fixed anchor at the top of the screen
            and swings under gravity, losing energy to damping on each pass until it comes to rest.
            It responds to being dragged and flicked, and the cord is simulated rather than drawn
            as a static line — which is why several cord styles behave differently under the same
            push.
          </p>
          <p>
            Two properties follow from that and matter more than the simulation itself. It settles:
            once at rest the animation stops, so an idle charm costs nothing. And it is
            click-through and never takes keyboard focus, so it is structurally incapable of
            intercepting a click or interrupting a screen share — a constraint the whole design is
            built around rather than a setting.
          </p>
        </section>

        <section aria-labelledby="specs">
          <h2 id="specs">Technical specifications</h2>
          <Table
            caption="Hangly technical specifications: versions, sizes, requirements and distribution"
            columns={["Specification", "Value"]}
            rows={[
              ["Current macOS version", RELEASE.macOS.version || "not published"],
              ["macOS released", RELEASE.macOS.date || "not published"],
              ["macOS download size", mb(RELEASE.macOS.bytes)],
              ["Minimum macOS", RELEASE.macOS.minimumSystem ? `${RELEASE.macOS.minimumSystem}` : "14.0"],
              ["Current Windows version", `${RELEASE.windows} (pre-release)`],
              ["Minimum Windows", "10 for x64, 11 for ARM64"],
              ["Charms", HANGLY_STATS.charmCount],
              ["Categories", HANGLY_STATS.categoryCount],
              ["Seasonal charms", HANGLY_STATS.seasonalCharmCount],
              ["Website artwork files", ARTWORK.plain],
              ["Custom charms", "Any single image"],
              ["Price", "Free, no account, no paid tier"],
              ["macOS code signing", "Developer ID signed and notarised"],
              ["Windows code signing", "Not signed yet — SmartScreen warns once"],
              ["macOS updater", "Sparkle"],
              ["Windows updater", "Velopack"],
              ["Artwork format", "SVG vectors, drawn at runtime"],
            ]}
          />
        </section>

        <section className="comparison-faq-block" aria-labelledby="stats-faq">
          <h2 id="stats-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </div>
        </section>

        <InShort>
          {HANGLY_STATS.charmCount} charms across {HANGLY_STATS.categoryCount} categories, three
          builds covering macOS universal and Windows on both x64 and ARM64, and a{" "}
          {mb(RELEASE.macOS.bytes)} macOS download. Free everywhere. Every figure is counted from
          source at build time and the page carries the date it was generated, so it is safe to
          quote.
        </InShort>

        <section aria-labelledby="stats-more">
          <h2 id="stats-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/products/hangly/roadmap">What is planned next</Link></li>
            <li><Link href="/changelog">Every release, from the update feeds</Link></li>
            <li><Link href="/download">Download Hangly</Link></li>
            <li><Link href="/install">How to install it</Link></li>
            <li><Link href="/products/hangly">The product page</Link></li>
            <li><Link href="/compare">How it compares</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
