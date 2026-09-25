import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BUILDS } from "@/lib/downloads";
import { RELEASES } from "@/data/changelog.generated";
import { ID, HANGLY_APP, breadcrumb, faqNode, serialise, softwareNode } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/download/windows";
const URL_ = absoluteUrl(PATH);
const TITLE = "Download Hangly for Windows — x64 and ARM64";
const DESCRIPTION =
  "Hangly for Windows 10 and 11, free: an x64 build for Intel and AMD, and a native ARM64 build for Snapdragon laptops. Which one you need, and what SmartScreen says.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/download-windows.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/download-windows.png"] },
};

const x64 = BUILDS["windows-x64"];
const arm = BUILDS["windows-arm64"];
const release = RELEASES.find((r) => r.product === "hangly" && r.platform === "Windows");

const FAQS = [
  {
    q: "Which Windows build do I need, x64 or ARM64?",
    a: "Open Settings, then System, then About, and read System type. If it says ARM-based processor, take the ARM64 build. Anything else takes x64. Do not trust the browser: a Windows-on-ARM machine reports Win64; x64 because the browser itself is running under emulation.",
  },
  {
    q: "Why does Windows say it protected my PC?",
    a: "That is SmartScreen, and it appears because the Windows build is not code-signed yet. Choose More info and then Run anyway. Code signing is on the list; until it is done, the warning is expected rather than a sign that something is wrong.",
  },
  {
    q: "Is the Windows version finished?",
    a: "No. It is at 0.9.x and published as a pre-release, while the Mac version is at 2.0. It works, but expect rough edges and fewer settings than the Mac build has.",
  },
  {
    q: "Does the ARM64 build run faster than x64 on a Snapdragon laptop?",
    a: "It should, because it runs natively instead of through the x64 emulation layer, which costs both speed and battery. The x64 build does still run there if you take the wrong one.",
  },
  {
    q: "What version of Windows does Hangly need?",
    a: "Windows 10 or newer for the x64 build. The ARM64 build targets Windows 11, which is what ships on every ARM machine currently sold.",
  },
  {
    q: "How does the Windows build update itself?",
    a: "Through Velopack. It checks when the app launches and applies the update the next time you start it, so an update never interrupts what you are doing.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    softwareNode(HANGLY_APP),
    { "@type": "WebPage", "@id": `${URL_}#page`, url: URL_, name: TITLE, description: DESCRIPTION,
      inLanguage: "en-IN", isPartOf: { "@id": ID.website }, about: { "@id": ID.hangly } },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Download", path: "/download" }, { name: "Windows", path: PATH }], URL_),
    faqNode(FAQS, URL_),
  ],
};

export default function DownloadWindowsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <Link href="/download">Download</Link> <span>/</span> Windows
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">WINDOWS {release?.version ?? "0.9.4"} · PRE-RELEASE · FREE</p>
          <h1>Hangly for Windows<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Two builds, one of them native for Windows on ARM — which almost nothing in this category
            ships. Both free, and both still young.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={x64.href}>
              Download for Windows (x64) <ArrowUpRight size={17} />
            </a>
            <a className="button button-quiet" href={arm.href}>
              Windows on ARM (ARM64) <ArrowUpRight size={17} />
            </a>
          </div>
          <DownloadNote />
        </header>

        <QuickAnswer>
          Hangly for Windows is free and ships in two builds: x64 for Intel and AMD machines on
          Windows 10 or newer, and a native ARM64 build for Snapdragon laptops on Windows 11. It is
          at version {release?.version ?? "0.9.4"} and published as a pre-release, so it is behind
          the Mac version. SmartScreen will warn once, because the build is not code-signed yet.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `Version ${release?.version ?? "0.9.4"}, free, still a pre-release`,
            "x64 for Intel and AMD on Windows 10+; ARM64 for Snapdragon on Windows 11",
            "The ARM64 build is native, not emulated",
            "SmartScreen warns once — the build is not code-signed yet",
            "Updates through Velopack, applied at the next launch",
          ]}
        />

        <section aria-labelledby="win-which">
          <h2 id="win-which">Which build?</h2>
          <p>
            Open Settings → System → About and read <em>System type</em>. An ARM-based processor
            takes the ARM64 build; everything else takes x64. This is worth checking rather than
            guessing, because a Windows-on-ARM machine reports <code>Win64; x64</code> in its user
            agent — the browser is itself running under the x64 emulator — and reading that string
            sends every ARM laptop to the wrong file.
          </p>
          <p>
            Taking x64 on an ARM machine is not fatal: Windows runs it under emulation, more slowly
            and at some cost to battery. Taking ARM64 anywhere else simply will not run.
          </p>
          <div className="guide-notes">
            <div>
              <h3>{x64.name} — x64</h3>
              <p><strong>Needs:</strong> {x64.requirement} · {x64.detail}</p>
              <p>{x64.architecture}</p>
              <p><a className="button button-quiet" href={x64.href}>Download x64 <ArrowUpRight size={15} /></a></p>
            </div>
            <div>
              <h3>{arm.name} — ARM64</h3>
              <p><strong>Needs:</strong> {arm.requirement} · {arm.detail}</p>
              <p>{arm.architecture}</p>
              <p><a className="button button-quiet" href={arm.href}>Download ARM64 <ArrowUpRight size={15} /></a></p>
            </div>
          </div>
        </section>

        <section aria-labelledby="win-smartscreen">
          <h2 id="win-smartscreen">What SmartScreen will say</h2>
          <p>{x64.firstRun}</p>
          <p>
            The reason is plain: code-signing certificates cost money annually and this is a free
            app from one person. Until one is in place, Windows has no publisher to attribute the
            installer to and says so. The files are served from the project&apos;s own GitHub
            releases, so you can verify where they came from before running anything.
          </p>
        </section>

        <section aria-labelledby="win-beta">
          <h2 id="win-beta">It is still a pre-release</h2>
          <p>
            The Mac version is at 2.0 and the Windows version is at{" "}
            {release?.version ?? "0.9.4"}. That gap is real: Windows has fewer settings, fewer cord
            options and less polish, and it is where bugs surface first. It hangs a charm, it stays
            out of every click, and it updates itself — but if you want the mature version of
            Hangly, that is the Mac one.
          </p>
          <p>{x64.updater}</p>
        </section>

        <section className="comparison-faq-block" aria-labelledby="win-faq">
          <h2 id="win-faq">Frequently asked questions</h2>
          <div className="comparison-faq">
            {FAQS.map((f) => (
              <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
            ))}
          </div>
        </section>

        <InShort>
          Check System type in Settings, take ARM64 if it says ARM and x64 otherwise, and expect one
          SmartScreen warning because the build is not signed yet. It is free and it works, but it
          is a pre-release and the Mac build is the finished one.
        </InShort>

        <section aria-labelledby="win-more">
          <h2 id="win-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/download/mac">The Mac build</Link></li>
            <li><Link href="/install">How to install Hangly</Link></li>
            <li><Link href="/changelog">What changed in each release</Link></li>
            <li><Link href="/products/hangly">The Hangly product page</Link></li>
            <li><Link href="/faq">Frequently asked questions</Link></li>
            <li><Link href="/compare/lucky-dangle">Hangly compared with Lucky Dangle</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
