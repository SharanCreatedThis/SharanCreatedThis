import type { Metadata } from "next";
import Link from "next/link";
import { Check, CircleDashed } from "lucide-react";
import { COLLECTIONS, CHARM_COUNT, RELEASE, GENERATED_AT } from "@/data/stats.generated";
import { HANGLY_APP, ID, breadcrumb, faqNode, serialise, softwareNode } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/products/hangly/roadmap";
const URL_ = absoluteUrl(PATH);
const TITLE = "Hangly Roadmap — What Ships Next";
const DESCRIPTION =
  "The public roadmap for Hangly: what shipped in 2.0, the six collections still unfinished, getting Windows out of pre-release, and what is never planned.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/hangly-roadmap.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/hangly-roadmap.png"] },
};

/** The six collections named as unfinished in the app's own FAQ and roadmap. */
const UNFINISHED = ["Football", "Stranger Things", "Singers", "Breaking Bad", "Friends", "Dream Catcher"];

type Item = { title: string; detail: string; done: boolean };

const SHIPPED: Item[] = [
  { done: true, title: "Automatic updates", detail: "Hangly checks weekly through Sparkle and installs in the background. Before 2.0, a new version meant downloading it by hand." },
  { done: true, title: "Release notes on first launch", detail: "Shown once after an update, with a Check for Updates button on the About page for anyone who would rather ask." },
  { done: true, title: "A lighter download", detail: `The app ships the vector artwork it actually draws from rather than a compiled catalogue carrying a bitmap of every unused charm. The download went from 89 MB to ${Math.round(RELEASE.macOS.bytes / 1_000_000)} MB with no change to the artwork.` },
  { done: true, title: "Five cords and up to three charms on one rope", detail: "Plus eleven seasonal charms that arrive on their own, weather, and one Customize window in place of the three it used to take." },
  { done: true, title: "Native Windows ARM64 build", detail: "A separate native build for Snapdragon machines rather than running the x64 build under emulation. Almost nothing else in this category publishes one." },
  { done: true, title: "Charm artwork optimised", detail: "Several SVGs carried over 500 KB of embedded raster each. Re-encoding took the artwork directory from 38.4 MB to 8.3 MB with verified visual parity." },
];

const NEXT: Item[] = [
  { done: false, title: "Windows out of pre-release", detail: `The Windows build is at ${RELEASE.windows} while macOS is at ${RELEASE.macOS.version}. Leaving 0.9.x means dropping the Beta badge and letting the download links use GitHub's latest alias instead of a pinned tag, which is currently needed because latest skips pre-releases.` },
  { done: false, title: "Windows code signing", detail: "The Windows installer is unsigned, so SmartScreen shows a warning once on first run. A certificate removes it. This is the single biggest friction point in the Windows install today." },
  { done: false, title: "The six unfinished collections", detail: `${UNFINISHED.join(", ")}. Their plain artwork renders already; what is missing is the connected rendering with the hanging thread drawn in, which is per-charm artwork rather than something that can be derived.` },
  { done: false, title: "Per-collection pages", detail: "So each collection can rank on its own terms rather than as a section of one product page." },
];

const NOT_PLANNED: Item[] = [
  { done: false, title: "A paid tier", detail: "There is no upgrade to sell and none is planned. Hangly is free because it was not built to be a business." },
  { done: false, title: "Accounts or sign-in", detail: "Nothing about a charm on a cord requires knowing who you are." },
  { done: false, title: "Roaming characters", detail: "The charm hangs from a fixed anchor and is click-through, on purpose. Making it wander would break the one property the whole design exists to guarantee: that it cannot interrupt you." },
  { done: false, title: "Advertising or analytics in the app", detail: "The privacy page lists everything that leaves your desktop. Adding to that list is not on the roadmap." },
];

const FAQS = [
  {
    q: "When will the Windows version leave pre-release?",
    a: `No date is published, deliberately. The Windows build is at ${RELEASE.windows} against ${RELEASE.macOS.version} on macOS, and it leaves 0.9.x when it is ready rather than on a schedule. Code signing and feature parity with the Mac build are the two things standing between here and there.`,
  },
  {
    q: "Which Hangly collections are unfinished?",
    a: `Six of the ${COLLECTIONS.length}: ${UNFINISHED.join(", ")}. Their charms have plain artwork and appear in the app; what is still being drawn is the connected rendering that includes the hanging thread, which has to be made per charm.`,
  },
  {
    q: "Can I request a charm or a collection?",
    a: "Yes, and requests genuinely influence the order. Email is the route. A specific request — a named character, a cultural symbol, a team — is far more actionable than a category.",
  },
  {
    q: "Will Hangly ever cost money?",
    a: "No. There is no paid tier, no planned upgrade and no trial that expires. It is free on both platforms because it was not built to be a business.",
  },
  {
    q: "Does the roadmap have dates?",
    a: "No, and that is a choice rather than an oversight. This is one person's side project shipping alongside film work, and a date published here would be a guess presented as a commitment. Items ship when they are ready and the changelog records when that was.",
  },
  {
    q: "Will the charm ever move around the screen like a desktop pet?",
    a: "No. It hangs from a fixed anchor and is click-through so that it is structurally incapable of covering a window or intercepting a click. Making it roam would break the guarantee the product exists to make. If you want a character that moves, the guides on this site recommend other people's apps for exactly that.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    softwareNode(HANGLY_APP),
    {
      "@type": "TechArticle",
      "@id": `${URL_}#article`,
      headline: "Hangly roadmap",
      description: DESCRIPTION,
      url: URL_,
      inLanguage: "en-IN",
      datePublished: GENERATED_AT,
      dateModified: GENERATED_AT,
      author: { "@id": ID.person },
      publisher: { "@id": ID.organization },
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.hangly },
      image: absoluteUrl("/og/hangly-roadmap.png"),
      mainEntityOfPage: { "@type": "WebPage", "@id": URL_ },
      proficiencyLevel: "Beginner",
    },
    breadcrumb(
      [{ name: "Home", path: "/" }, { name: "Products", path: "/products" },
       { name: "Hangly", path: "/products/hangly" }, { name: "Roadmap", path: PATH }],
      URL_,
    ),
    faqNode(FAQS, URL_),
  ],
};

function Items({ id, heading, intro, items, mark }: { id: string; heading: string; intro: string; items: Item[]; mark: "done" | "todo" | "no" }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <p>{intro}</p>
      <ul className="roadmap-list">
        {items.map((i) => (
          <li key={i.title} data-mark={mark}>
            <span aria-hidden="true">{mark === "done" ? <Check size={15} /> : <CircleDashed size={15} />}</span>
            <div>
              <h3>{i.title}</h3>
              <p>{i.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RoadmapPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/products">Products</Link> <span>/</span>{" "}
          <Link href="/products/hangly">Hangly</Link> <span>/</span> Roadmap
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">PUBLIC ROADMAP · NO DATES, ON PURPOSE</p>
          <h1>What ships next<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            What is done, what is being worked on, and what is deliberately never going to happen.
            Nothing here carries a date, because a date from a one-person project is a guess
            wearing a suit.
          </p>
        </header>

        <QuickAnswer>
          Hangly is at {RELEASE.macOS.version} on macOS and {RELEASE.windows} on Windows, where it
          is still a pre-release. The next work is getting Windows out of 0.9.x, code-signing the
          Windows installer so SmartScreen stops warning, finishing the connected artwork for six
          of the {COLLECTIONS.length} collections, and giving each collection its own page. There
          is no paid tier planned, now or later.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `macOS is at ${RELEASE.macOS.version}; Windows is at ${RELEASE.windows} and still a pre-release`,
            "Next up: Windows out of beta, and a code-signing certificate to silence SmartScreen",
            `Six of the ${COLLECTIONS.length} collections still need their connected artwork drawn`,
            "No dates are published — items ship when ready and the changelog records when",
            "No paid tier, no accounts and no roaming characters, ever",
          ]}
        />

        <Items
          id="shipped" heading="Shipped in 2.0" mark="done"
          intro="Version 2.0 was the largest release so far and the first that could update itself. These are done and live."
          items={SHIPPED}
        />

        <Items
          id="next" heading="Being worked on" mark="todo"
          intro="Roughly in order. The Windows items come first because the gap between the two platforms is the thing people notice most."
          items={NEXT}
        />

        <section aria-labelledby="unfinished">
          <h2 id="unfinished">The six unfinished collections, specifically</h2>
          <p>
            Of the {COLLECTIONS.length} published collections holding {CHARM_COUNT} charms, six are
            not finished: {UNFINISHED.join(", ")}. It is worth being precise about what
            &ldquo;unfinished&rdquo; means here, because the charms do appear in the app.
          </p>
          <p>
            Every charm ships with plain artwork, which is what renders today. What is missing is
            the <em>connected</em> rendering — the same charm drawn with the hanging thread
            attached at the right point for that particular shape. That cannot be derived from the
            plain drawing, because where a thread meets a charm depends on the charm. It is
            per-charm illustration work, and it is the reason these six are listed as in progress
            rather than quietly shipped.
          </p>
          <p>
            The site handles the gap rather than hiding it: a build-time manifest resolves each
            charm to the best artwork available, so a charm without a connected drawing falls back
            to its plain one instead of rendering as a broken image.
          </p>
        </section>

        <Items
          id="not-planned" heading="Deliberately not planned" mark="no"
          intro="A roadmap that only lists additions is a wish list. These are the things Hangly is not going to do, so you can rely on that when deciding whether to install it."
          items={NOT_PLANNED}
        />

        <section aria-labelledby="constraints">
          <h2 id="constraints">What can never change</h2>
          <p>
            Some things are fixed because software already installed on other people&apos;s
            machines depends on them. The Sparkle update feeds for both apps, and the stable
            download URLs, are compiled into copies of the app already running. Moving either
            would break updates for everyone who installed before the move — so they stay, whatever
            else changes around them.
          </p>
          <p>
            This is also why the changelog on this site is generated from those feeds rather than
            written by hand. There is exactly one source of truth for what a release contains, and
            the website reads it rather than restating it.
          </p>
        </section>

        <section className="comparison-faq-block" aria-labelledby="roadmap-faq">
          <h2 id="roadmap-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </div>
        </section>

        <InShort>
          2.0 brought self-updating, a much smaller download, five cords and a native Windows
          ARM64 build. Next is closing the gap between the platforms — Windows out of pre-release
          and signed — and finishing the connected artwork for six collections. No dates, no paid
          tier, and no plans to make the charm wander.
        </InShort>

        <section aria-labelledby="roadmap-more">
          <h2 id="roadmap-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/products/hangly/stats">The numbers, counted from source</Link></li>
            <li><Link href="/changelog">Every release so far</Link></li>
            <li><Link href="/download">Download Hangly</Link></li>
            <li><Link href="/products/hangly">The product page</Link></li>
            <li><Link href="/contact">Request a charm or report a bug</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
