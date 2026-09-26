import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BUILDS } from "@/lib/downloads";
import { RELEASES } from "@/data/changelog.generated";
import { ID, HANGLY_APP, breadcrumb, faqNode, serialise, softwareNode } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/download/mac";
const URL_ = absoluteUrl(PATH);
const TITLE = "Download Hangly for Mac — Free, macOS 14+";
const DESCRIPTION =
  "The macOS build of Hangly: universal for Apple Silicon and Intel, and free. What it needs, how large it is, and what happens on first launch.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/download-mac.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/download-mac.png"] },
};

const build = BUILDS.mac;
const release = RELEASES.find((r) => r.product === "hangly" && r.platform === "macOS");
const size = release?.bytes ? `${Math.round(release.bytes / 1_000_000)} MB` : "about 33 MB";

const FAQS = [
  {
    q: "Does Hangly run on Apple Silicon?",
    a: "Yes, natively. The download is a universal build, so the same file runs on M-series Macs and on Intel Macs without Rosetta.",
  },
  {
    q: "Will macOS warn me about an unidentified developer?",
    a: "Yes, once. Hangly is not yet signed with an Apple Developer ID, so macOS stops the first launch. On macOS 14, right-click Hangly in Applications, choose Open, and confirm. On macOS 15 and later, open it once, then go to System Settings → Privacy & Security and choose Open Anyway. Only the first launch needs this. Signing and notarisation are planned.",
  },
  {
    q: "What version of macOS does Hangly need?",
    a: "macOS 14 Sonoma or newer. Older versions are not supported because the app is built against APIs introduced in 14.",
  },
  {
    q: "How does Hangly update itself on a Mac?",
    a: "Through Sparkle. It checks weekly against the feed on this site and installs quietly in the background. There is a Check for Updates button on the About page if you would rather ask.",
  },
  {
    q: "Where does Hangly put itself?",
    a: "Wherever you drag it, which is normally the Applications folder. It is an ordinary app bundle with no installer and no background daemon.",
  },
  {
    q: "How do I remove it?",
    a: "Quit it from the menu bar and move it to the Trash. Preferences live in ~/Library/Preferences and any custom charm images in the app's container; both can go with it.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    softwareNode(HANGLY_APP),
    { "@type": "WebPage", "@id": `${URL_}#page`, url: URL_, name: TITLE, description: DESCRIPTION,
      inLanguage: "en-IN", isPartOf: { "@id": ID.website }, about: { "@id": ID.hangly } },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Download", path: "/download" }, { name: "Mac", path: PATH }], URL_),
    faqNode(FAQS, URL_),
  ],
};

export default function DownloadMacPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/download">Download</Link> <span>/</span> Mac
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">MACOS {release?.version ?? "2.0.0"} · {size} · FREE</p>
          <h1>Hangly for Mac<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            One universal build for every Mac made in the last decade, and free.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={build.href}>
              Download for macOS <ArrowUpRight size={17} />
            </a>
            <Link className="button button-quiet" href="/install">
              Installation steps <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </header>

        <QuickAnswer>
          Hangly for Mac is a free {size} download that needs macOS 14 or newer. It is a universal
          build, so one file runs natively on Apple Silicon and on Intel Macs. It is not yet signed
          with an Apple Developer ID, so macOS asks you to allow it once on first launch, and it
          keeps itself up to date through Sparkle.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `Version ${release?.version ?? "2.0.0"}, ${size}, free`,
            "Needs macOS 14 Sonoma or newer",
            "Universal: Apple Silicon and Intel, no Rosetta",
            "Not yet notarised: allow it once in Privacy & Security",
            "Updates weekly through Sparkle, in the background",
          ]}
        />

        <section aria-labelledby="mac-req">
          <h2 id="mac-req">Requirements</h2>
          <p>
            macOS 14 Sonoma or newer, on any Mac Apple has shipped with it. {build.architecture} The
            app draws its charms as vectors rather than shipping a bitmap of each one, which is why
            a 30-charm app is a {size} download rather than the 89 MB it used to be.
          </p>
          <p>
            It runs as an ordinary app, not a system extension and not a background daemon. There is
            nothing to grant it in System Settings and no permission prompt on first launch.
          </p>
        </section>

        <section aria-labelledby="mac-install">
          <h2 id="mac-install">Installing it</h2>
          <p>
            The download is a disk image. Open it, drag Hangly into Applications, eject the image
            and launch the app. A charm appears hanging from the top of your screen, and the rest is
            in the menu bar. The full sequence, including what to do if anything looks unexpected,
            is on the <Link href="/install">installation page</Link>.
          </p>
          <p><strong>First launch:</strong> {build.firstRun}</p>
        </section>

        <section aria-labelledby="mac-updates">
          <h2 id="mac-updates">Updates</h2>
          <p>{build.updater}</p>
          <p>
            Every release is listed on the <Link href="/changelog">changelog</Link>, which is
            generated from the same feed the updater reads — so the page and the update can never
            disagree about what changed.
          </p>
        </section>

        <section className="comparison-faq-block" aria-labelledby="mac-faq">
          <h2 id="mac-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => (
              <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
            ))}
          </div>
        </section>

        <InShort>
          One file, free, macOS 14 or newer, universal across Apple Silicon and Intel. Allow it
          once on first launch, because it is not yet notarised. Install it by dragging it to Applications; it updates
          itself from then on.
        </InShort>

        <section aria-labelledby="mac-more">
          <h2 id="mac-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/download/windows">The Windows builds</Link></li>
            <li><Link href="/install">How to install Hangly</Link></li>
            <li><Link href="/changelog">What changed in each release</Link></li>
            <li><Link href="/products/hangly">The Hangly product page</Link></li>
            <li><Link href="/products/hangly/privacy">What Hangly sends, and what it never sends</Link></li>
            <li><Link href="/guides/best-desktop-charm-apps-for-mac">Every desktop charm app for Mac, compared</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
