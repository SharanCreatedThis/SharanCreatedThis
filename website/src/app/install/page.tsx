import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BUILDS } from "@/lib/downloads";
import { ID, HANGLY_APP, breadcrumb, faqNode, serialise, softwareNode } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/install";
const URL_ = absoluteUrl(PATH);
const TITLE = "How to Install Hangly on Mac and Windows";
const DESCRIPTION =
  "Step by step: installing Hangly on macOS from the disk image, and on Windows past the SmartScreen warning. Plus what to do when the charm does not appear.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/install.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/install.png"] },
};

type Step = { name: string; text: string };

const MAC_STEPS: Step[] = [
  { name: "Download the disk image", text: "Open the download page and choose macOS. The file is a .dmg of about 33 MB and there is one build for every Mac — Apple Silicon and Intel alike." },
  { name: "Open the disk image", text: "Double-click the downloaded .dmg. A window opens showing the Hangly app beside a shortcut to your Applications folder." },
  { name: "Drag Hangly into Applications", text: "Drag the app icon onto the Applications shortcut. Copying takes a second or two." },
  { name: "Eject the disk image", text: "Click the eject arrow beside the mounted image in the Finder sidebar, then move the downloaded .dmg to the Trash. Nothing needs it again." },
  { name: "Launch Hangly", text: "Open Applications and double-click Hangly. It is signed and notarised, so it opens without a Gatekeeper warning." },
  { name: "Pick a charm", text: "A charm appears hanging from the top of your screen. Use the Hangly icon in the menu bar to open Customize and choose from the fourteen collections, change the cord, or drop in an image of your own." },
];

const WINDOWS_STEPS: Step[] = [
  { name: "Check your processor", text: "Open Settings, then System, then About, and read System type. An ARM-based processor needs the ARM64 build; anything else needs x64. Do not rely on the browser's guess — a Windows-on-ARM machine reports itself as x64." },
  { name: "Download the installer", text: "Take the matching build from the Windows download page. It is a Setup .exe published on the project's GitHub releases." },
  { name: "Run it past SmartScreen", text: "Windows may show a blue \"Windows protected your PC\" panel, because the build is not code-signed yet. Choose More info, then Run anyway." },
  { name: "Let the installer finish", text: "Velopack installs Hangly for the current user and starts it. There is nothing to choose and no bundled extras." },
  { name: "Pick a charm", text: "A charm appears hanging from the top of your screen. The tray icon opens the settings, where the collections, the cord and custom images live." },
];

const FAQS = [
  {
    q: "Do I need an account to install Hangly?",
    a: "No. There is no account, no sign-in, no licence key and no trial period on either platform.",
  },
  {
    q: "macOS says the app is damaged and cannot be opened. What now?",
    a: "That message usually means the download was interrupted rather than that anything is wrong with the app. Delete it, empty the Trash and download again. The build is notarised, so a complete copy opens normally.",
  },
  {
    q: "The charm is not on my screen after installing. Where is it?",
    a: "Check the menu bar on a Mac or the system tray on Windows — the app is running if its icon is there. If you have more than one display, the charm may be hanging on the other one; the Customize window lets you place it.",
  },
  {
    q: "Will Hangly get in the way of what I am clicking?",
    a: "No. The charm is click-through on both platforms and never takes keyboard focus, which is why it is safe during a meeting or a screen share.",
  },
  {
    q: "How do I uninstall Hangly?",
    a: "On a Mac, quit it from the menu bar and drag it from Applications to the Trash. On Windows, use Settings, then Apps, then Installed apps, and remove Hangly there.",
  },
  {
    q: "Does installing Hangly need administrator rights?",
    a: "No. On a Mac it is a plain app bundle you copy into Applications, and on Windows Velopack installs it for the current user only.",
  },
];

function howTo(id: string, name: string, description: string, steps: Step[], os: string) {
  return {
    "@type": "HowTo",
    "@id": `${URL_}#${id}`,
    name,
    description,
    inLanguage: "en-IN",
    totalTime: "PT2M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    supply: [],
    tool: [{ "@type": "HowToTool", name: `A computer running ${os}` }],
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${URL_}#${id}-step-${i + 1}`,
    })),
  };
}

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    softwareNode(HANGLY_APP),
    { "@type": "WebPage", "@id": `${URL_}#page`, url: URL_, name: TITLE, description: DESCRIPTION,
      inLanguage: "en-IN", isPartOf: { "@id": ID.website }, about: { "@id": ID.hangly } },
    howTo("howto-mac", "How to install Hangly on a Mac",
      "Installing Hangly on macOS 14 or newer, from the disk image to the first charm.", MAC_STEPS, "macOS 14 or newer"),
    howTo("howto-windows", "How to install Hangly on Windows",
      "Installing Hangly on Windows 10 or 11, including which build to take and what SmartScreen says.", WINDOWS_STEPS, "Windows 10 or newer"),
    breadcrumb([{ name: "Home", path: "/" }, { name: "Install", path: PATH }], URL_),
    faqNode(FAQS, URL_),
  ],
};

function Steps({ id, heading, steps }: { id: string; heading: string; steps: Step[] }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <ol className="install-steps">
        {steps.map((s, i) => (
          <li key={s.name} id={`${id}-step-${i + 1}`}>
            <h3>{s.name}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function InstallPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> Install
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">TWO MINUTES · NO ACCOUNT · NO ADMIN RIGHTS</p>
          <h1>Installing Hangly<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Drag it to Applications on a Mac. On Windows, check your processor first and expect one
            warning. That is the whole of it.
          </p>
          <div className="hero-actions">
            <DownloadButton />
            <Link className="button button-quiet" href="/download">
              All builds <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </header>

        <QuickAnswer>
          On a Mac, open the downloaded disk image, drag Hangly into Applications and launch it — it
          is notarised, so nothing warns you. On Windows, check Settings → System → About for your
          processor type, take the matching build, and choose More info then Run anyway when
          SmartScreen appears. Neither platform needs an account or administrator rights.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            "Mac: open the .dmg, drag to Applications, launch. No warning.",
            "Windows: check System type first — ARM64 or x64 is not something to guess at",
            "Windows shows one SmartScreen warning, because the build is not signed yet",
            "Neither install needs an account, a licence key or administrator rights",
            "Both builds update themselves afterwards",
          ]}
        />

        <Steps id="howto-mac" heading="Installing on a Mac" steps={MAC_STEPS} />
        <p><strong>First launch:</strong> {BUILDS.mac.firstRun}</p>

        <Steps id="howto-windows" heading="Installing on Windows" steps={WINDOWS_STEPS} />
        <p><strong>First launch:</strong> {BUILDS["windows-x64"].firstRun}</p>

        <section aria-labelledby="install-trouble">
          <h2 id="install-trouble">When something does not look right</h2>
          <p>
            <strong>Nothing appeared after launching.</strong> Look for the Hangly icon in the menu
            bar or the system tray. If it is there, the app is running and the charm is probably on
            another display — open Customize and place it.
          </p>
          <p>
            <strong>macOS says the app is damaged.</strong> Almost always an interrupted download
            rather than a problem with the build, which is notarised. Delete it, empty the Trash and
            download again.
          </p>
          <p>
            <strong>Windows blocked the installer entirely.</strong> Some corporate machines refuse
            unsigned installers outright rather than offering Run anyway. That is a policy set by
            whoever manages the machine, and there is no way around it from this side.
          </p>
          <p>
            <strong>The charm blocks a click.</strong> It should not — it is click-through on both
            platforms. If it does, that is a bug worth reporting from the{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </section>

        <section className="comparison-faq-block" aria-labelledby="install-faq">
          <h2 id="install-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => (
              <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
            ))}
          </div>
        </section>

        <InShort>
          A Mac install is a drag and a double-click; a Windows install is a processor check and one
          dismissed warning. Nothing asks for an account and nothing needs administrator rights.
          After that both builds keep themselves current on their own.
        </InShort>

        <section aria-labelledby="install-more">
          <h2 id="install-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/download">Every build in one place</Link></li>
            <li><Link href="/download/mac">Hangly for Mac, in detail</Link></li>
            <li><Link href="/download/windows">Hangly for Windows, in detail</Link></li>
            <li><Link href="/changelog">What changed in each release</Link></li>
            <li><Link href="/faq">Frequently asked questions</Link></li>
            <li><Link href="/products/hangly/privacy">What Hangly sends, and what it never sends</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
