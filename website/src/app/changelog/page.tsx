import type { Metadata } from "next";
import Link from "next/link";
import { RELEASES } from "@/data/changelog.generated";
import { ID, HANGLY_APP, VISION_APP, breadcrumb, serialise, softwareNode } from "@/lib/schema/entities";
import { InShort, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { ChangelogList } from "@/components/changelog/ChangelogList";
import { PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/changelog";
const URL_ = absoluteUrl(PATH);
const TITLE = "Changelog — Hangly and Vision Releases";
const DESCRIPTION =
  "Every release of Hangly and Vision, with what changed in each. Generated from the same update feeds the apps read, so the page and the updater cannot disagree.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/changelog.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/changelog.png"] },
};

const dated = RELEASES.filter((r) => r.date);
const newest = dated[0]?.date ?? "";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    softwareNode(HANGLY_APP),
    softwareNode(VISION_APP),
    {
      "@type": "CollectionPage",
      "@id": `${URL_}#page`,
      url: URL_,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-IN",
      isPartOf: { "@id": ID.website },
      about: [{ "@id": ID.hangly }, { "@id": ID.vision }],
      ...(newest ? { dateModified: newest } : {}),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: RELEASES.length,
        itemListElement: RELEASES.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${r.name} ${r.version} for ${r.platform}`,
        })),
      },
    },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Changelog", path: PATH }], URL_),
  ],
};

const readable = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";

export default function ChangelogPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> Changelog
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">{RELEASES.length} RELEASES{newest ? ` · NEWEST ${readable(newest)}` : ""}</p>
          <h1>What changed<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Every release of both apps, taken from the update feeds rather than retyped — which is
            how a changelog ends up disagreeing with what the updater shows.
          </p>
        </header>

        <QuickAnswer>
          Hangly is at {RELEASES.find((r) => r.product === "hangly" && r.platform === "macOS")?.version ?? "2.0.0"} on
          macOS and {RELEASES.find((r) => r.platform === "Windows")?.version ?? "0.9.4"} on Windows,
          where it is still a pre-release. Vision is at{" "}
          {RELEASES.find((r) => r.product === "vision")?.version ?? "1.1"} on macOS. Every entry
          below is generated from the app&apos;s own update feed at build time.
        </QuickAnswer>

        <section aria-labelledby="releases">
          <h2 id="releases">Releases</h2>
          <ChangelogList releases={RELEASES} />
        </section>

        <section aria-labelledby="how-updates">
          <h2 id="how-updates">How updates reach you</h2>
          <p>
            On macOS both apps use Sparkle, which checks the feed on this site and installs in the
            background. Hangly has done this since 2.0; before that a new version meant downloading
            it by hand. On Windows, Hangly updates through Velopack, which checks when the app
            launches and applies the update at the next start.
          </p>
          <p>
            This page is built from those same feeds. A release that is not in a feed cannot appear
            here, and a release that is here is one the updater will offer.
          </p>
        </section>

        <InShort>
          Hangly on macOS is the mature build and moves in proper releases; the Windows build is
          still in the 0.9 range and moves faster and rougher. Vision is a smaller app with a
          smaller history. Nothing on this page is written by hand — it is the update feeds,
          rendered.
        </InShort>

        <section aria-labelledby="changelog-more">
          <h2 id="changelog-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/download">Download the current build</Link></li>
            <li><Link href="/install">How to install Hangly</Link></li>
            <li><Link href="/products/hangly">The Hangly product page</Link></li>
            <li><Link href="/products/vision">The Vision product page</Link></li>
            <li><Link href="/faq">Frequently asked questions</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
