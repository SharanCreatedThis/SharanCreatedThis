import { pageMetadata } from "@/lib/metadata";
import {
  Label,
  ProductShowcase,
  ContactCTA,
} from "@/components/hub/Experience";
import { Prose, ProseFaq, ProseLinks, ProseTable } from "@/components/hub/Prose";
import {
  HANGLY_APP, ID, VISION_APP, breadcrumb, faqNode, serialise, softwareNode,
} from "@/lib/schema/entities";
import { absoluteUrl } from "@/lib/seo";

export const metadata = pageMetadata("products");

const URL_ = absoluteUrl("/products");

const FAQS = [
  {
    q: "Are Hangly and Vision free?",
    a: "Both are free, with no account, no trial period and no paid tier. Neither has an upgrade to sell you and neither shows advertising.",
  },
  {
    q: "Which platforms do they run on?",
    a: "Hangly runs on macOS 14 or newer and Windows 10 or newer, including a native Windows ARM64 build for Snapdragon machines. Vision is macOS 15 or newer only.",
  },
  {
    q: "Do the apps send anything over the internet?",
    a: "Vision does all face recognition on your own machine and uploads nothing. Hangly's privacy page lists exactly what leaves your desktop — three things, two of which are optional and can be switched off.",
  },
  {
    q: "How do the apps update themselves?",
    a: "Hangly on macOS and Vision both use Sparkle, checking a feed hosted on this site and installing in the background. Hangly on Windows uses Velopack, which checks at launch and applies the update at the next start.",
  },
  {
    q: "Is the Windows version of Hangly finished?",
    a: "No. It is at 0.9.x and published as a pre-release, while the macOS build is at 2.0. It works and it updates itself, but it has fewer settings and less polish. Windows also shows a SmartScreen warning once, because the build is not code-signed yet.",
  },
  {
    q: "Which one should I install first?",
    a: "They solve unrelated problems, so the question is which problem you have. Hangly makes the desktop more pleasant; Vision changes how you unlock the machine. Most people who want both simply install both — they do not interact.",
  },
  {
    q: "Can I use my own image as a Hangly charm?",
    a: "Yes. Any single image becomes a charm on a cord, alongside the eighty-one charms across fourteen collections that ship with it.",
  },
  {
    q: "Where can I see what changed in each release?",
    a: "The changelog lists every release of both apps, and it is generated from the same update feeds the apps themselves read — so the page and the updater cannot disagree about what shipped.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    softwareNode(HANGLY_APP),
    softwareNode(VISION_APP),
    {
      "@type": "CollectionPage",
      "@id": `${URL_}#page`,
      url: URL_,
      name: "Independent desktop apps by Sharan Created This",
      description:
        "Hangly for macOS and Windows, and Vision for Mac: two small, independent desktop apps, both free.",
      inLanguage: "en-IN",
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.organization },
      mainEntity: {
        "@type": "ItemList",
        "@id": `${URL_}#list`,
        name: "Desktop apps by Sharan Created This",
        numberOfItems: 2,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hangly", url: absoluteUrl("/products/hangly"), item: { "@id": ID.hangly } },
          { "@type": "ListItem", position: 2, name: "Vision", url: absoluteUrl("/products/vision"), item: { "@id": ID.vision } },
        ],
      },
    },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }], URL_),
    faqNode(FAQS, URL_),
  ],
};

export default function Products() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <div className="page-intro section">
        <Label>THE PRODUCT LAB</Label>
        <h1>
          Curiosity,
          <br />
          <span className="muted">shipped.</span>
        </h1>
        <p>
          Thoughtful little experiences. Built to become part of your everyday.
        </p>
        <ProductShowcase full />
      </div>

      <Prose id="overview" heading="Two apps, two unrelated problems">
        <p>
          There are two products here and they have nothing to do with each other, which is
          deliberate. Both came from wanting something that did not exist rather than from looking
          for a gap in a market, and both are free because neither was built to be a business.
        </p>
        <p>
          <strong>Hangly</strong> hangs a decorative charm from the top of your screen on a cord,
          swaying with real pendulum physics. It is click-through, so it never intercepts a click,
          and it never takes keyboard focus — the whole design constraint is that it must be
          incapable of interrupting you. Eighty-one charms across fourteen collections ship with
          it, any image of your own becomes a charm, and it runs on macOS 14 or newer and Windows
          10 or newer including a native ARM64 build.
        </p>
        <p>
          <strong>Vision</strong> is face recognition for the Mac with a native notch experience.
          You look at the machine and it knows you. Everything runs locally: no face data leaves
          your computer, no account is involved, and nothing depends on a server being up. It
          needs macOS 15 or newer and is at version 1.1.
        </p>
        <p>
          Neither app is a component of the other, they share no code you would notice, and
          running both together is entirely normal. They appear on one page because the same
          person made them.
        </p>
      </Prose>

      <Prose id="compare-products" heading="Hangly and Vision, compared">
        <p>
          The most useful comparison here is not feature against feature — they do not compete —
          but requirement against requirement, so you can see at a glance whether your machine
          runs each one.
        </p>
        <ProseTable
          caption="Hangly compared with Vision: platforms, versions, price and what each one does"
          columns={["", "Hangly", "Vision"]}
          rows={[
            ["What it does", "Hangs a decorative charm on a cord at the top of the screen", "Recognises your face to unlock the Mac"],
            ["Platforms", "macOS 14+, Windows 10+ (x64 and ARM64)", "macOS 15+"],
            ["Current version", "2.0 on macOS, 0.9.x on Windows", "1.1"],
            ["Price", "Free", "Free"],
            ["Account required", "No", "No"],
            ["Sends data anywhere", "See the privacy page — three things, two optional", "No face data leaves the machine"],
            ["Updates through", "Sparkle on macOS, Velopack on Windows", "Sparkle"],
            ["Maturity", "macOS mature; Windows is a pre-release", "Stable, small in scope"],
            ["Uses the camera", "No", "Yes, locally"],
          ]}
        />
      </Prose>

      <Prose id="use-cases" heading="Who each one is for">
        <p>
          <strong>Hangly suits you if</strong> you spend the day looking at a screen and would
          like something on it that is pleasant and asks nothing of you. It is the right pick over
          a desktop pet specifically when you cannot afford interruptions — if you present, teach,
          demo or screen-share, a roaming character will eventually walk across your slides and a
          charm structurally cannot. It also suits anyone who wants a particular cultural or lucky
          charm, or their own photograph, hanging on a cord.
        </p>
        <p>
          <strong>Hangly is the wrong pick if</strong> what you actually want is a creature that
          moves about under its own control. That is a desktop pet, it is a different category,
          and the guides on this site recommend other people&apos;s apps for it without hedging.
        </p>
        <p>
          <strong>Vision suits you if</strong> you unlock your Mac dozens of times a day and want
          that to happen by looking at it, and if you care that the recognition runs on your own
          hardware rather than someone&apos;s server. It is a small, quiet utility rather than a
          platform.
        </p>
        <p>
          <strong>Vision is the wrong pick if</strong> you are on macOS 14 or earlier, since it
          requires macOS 15, or if you need enterprise identity management — it is a personal
          convenience, not an authentication product for an organisation.
        </p>
      </Prose>

      <Prose id="get-them" heading="Downloading and installing">
        <p>
          Everything is free and nothing asks for an account. On a Mac, Hangly is a disk image you
          drag into Applications and it is signed and notarised, so it opens without a Gatekeeper
          warning. On Windows, check Settings then System then About for your processor type
          first, because a Windows-on-ARM machine reports itself as x64 and taking the wrong build
          costs you the native performance — and expect one SmartScreen warning, because the
          Windows build is not code-signed yet.
        </p>
        <ProseLinks
          links={[
            { label: "Download Hangly", href: "/download", note: "all three builds" },
            { label: "Hangly for Mac", href: "/download/mac" },
            { label: "Hangly for Windows", href: "/download/windows", note: "x64 and ARM64" },
            { label: "How to install", href: "/install", note: "step by step, both platforms" },
            { label: "Vision", href: "/products/vision" },
            { label: "Vision documentation", href: "/products/vision/docs" },
            { label: "Release history", href: "/changelog", note: "generated from the update feeds" },
          ]}
        />
      </Prose>

      <ProseFaq id="products-faq" faqs={FAQS} />

      <Prose id="products-more" heading="Deciding between Hangly and something else">
        <p>
          The comparison pages on this site put Hangly against the apps people actually weigh it
          against, and each one names where the other product wins — a comparison that concludes
          &ldquo;ours&rdquo; every time is an advertisement, and both readers and answer engines
          discount it.
        </p>
        <ProseLinks
          links={[
            { label: "Every comparison", href: "/compare", note: "eight competitors" },
            { label: "Category guides", href: "/guides", note: "charms, pets and Mac customization" },
            { label: "Best desktop pets for Mac", href: "/guides/best-desktop-pets-for-mac" },
            { label: "Hangly FAQ", href: "/faq", note: "fifty answers" },
            { label: "Hangly privacy", href: "/products/hangly/privacy" },
          ]}
        />
      </Prose>

      <ContactCTA />
    </>
  );
}
