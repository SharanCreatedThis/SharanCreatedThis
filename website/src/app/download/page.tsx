import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BUILDS, BUILD_ORDER, VISION_BUILD } from "@/lib/downloads";
import { RELEASES } from "@/data/changelog.generated";
import { ID, HANGLY_APP, VISION_APP, breadcrumb, serialise, softwareNode } from "@/lib/schema/entities";
import { InShort, KeyTakeaways, QuickAnswer } from "@/components/aeo/AnswerBlocks";
import { DownloadButton, DownloadNote, PlatformSheet } from "@/components/hangly/shared";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

const PATH = "/download";
const URL_ = absoluteUrl(PATH);
const TITLE = "Download Hangly — Free for Mac and Windows";
const DESCRIPTION =
  "Every build of Hangly in one place: macOS 14+, Windows 10+ on x64, and a native Windows ARM64 build. Free, with what each one needs and what it does on first launch.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: URL_, title: TITLE,
    description: DESCRIPTION, images: [{ url: "/og/hangly.png", width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og/hangly.png"] },
};

const mac = RELEASES.find((r) => r.product === "hangly" && r.platform === "macOS");
const windows = RELEASES.find((r) => r.product === "hangly" && r.platform === "Windows");
const megabytes = (bytes: number) => `${Math.round(bytes / 1_000_000)} MB`;

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
    },
    breadcrumb([{ name: "Home", path: "/" }, { name: "Download", path: PATH }], URL_),
  ],
};

export default function DownloadPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(schema) }} />
      <main className="comparison wrap">
        <nav className="comparison-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> Download
        </nav>

        <header className="comparison-head">
          <p className="eyebrow">FREE · NO ACCOUNT · NO TRIAL</p>
          <h1>Download Hangly<span className="orange">.</span></h1>
          <p className="comparison-verdict">
            Three builds, because Windows on ARM deserves its own. Pick the one that matches your
            machine, or let the button work it out.
          </p>
          <div className="hero-actions">
            <DownloadButton />
            <Link className="button button-quiet" href="/install">
              Installation steps <ArrowUpRight size={17} />
            </Link>
          </div>
          <DownloadNote />
        </header>

        <QuickAnswer>
          Hangly is free on macOS 14 or newer and on Windows 10 or newer. The Mac build is universal
          and runs natively on Apple Silicon and Intel. Windows ships twice: an x64 build for Intel
          and AMD machines, and a native ARM64 build for Snapdragon laptops. There is no account, no
          trial and no paid tier.
        </QuickAnswer>

        <KeyTakeaways
          points={[
            `The current Mac build is ${mac?.version ?? "2.0.0"}${mac?.bytes ? `, a ${megabytes(mac.bytes)} download` : ""}`,
            `The current Windows build is ${windows?.version ?? "0.9.4"}, still a pre-release`,
            "The Mac build is signed and notarised, so it opens without a Gatekeeper warning",
            "Windows is not code-signed yet, so SmartScreen will ask once",
            "Both update themselves after installation — Sparkle on Mac, Velopack on Windows",
          ]}
        />

        <section aria-labelledby="builds">
          <h2 id="builds">The three builds</h2>
          <div className="guide-notes">
            {BUILD_ORDER.map((id) => {
              const b = BUILDS[id];
              return (
                <div key={id}>
                  <h3>
                    {b.name}
                    {b.beta ? " (pre-release)" : ""}
                  </h3>
                  <p><strong>Needs:</strong> {b.requirement} · {b.detail}</p>
                  <p>{b.architecture}</p>
                  <p><strong>First launch:</strong> {b.firstRun}</p>
                  <p><strong>Updates:</strong> {b.updater}</p>
                  <p>
                    <a className="button button-quiet" href={b.href}>
                      Download {b.name} <ArrowUpRight size={15} />
                    </a>
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="which-build">
          <h2 id="which-build">Which one do I need?</h2>
          <p>
            On a Mac, there is only one answer: the macOS build is universal and the same file runs
            on an M-series Mac and on an Intel one. Nothing to choose.
          </p>
          <p>
            On Windows the answer depends on the processor, and the honest complication is that a
            Windows-on-ARM machine reports itself as <code>Win64; x64</code> because the browser
            itself is usually running under emulation. Open Settings → System → About and read{" "}
            <em>System type</em>: if it says ARM-based processor, take the ARM64 build. Anything
            else — Intel, AMD, an older laptop — takes x64. If you take the wrong one, the x64 build
            still runs on ARM under emulation; the ARM64 build will not run anywhere else.
          </p>
        </section>

        <section aria-labelledby="also-vision">
          <h2 id="also-vision">Vision, for Mac</h2>
          <p>
            Vision is the other app on this site: local face recognition for Mac with a native notch
            experience, and nothing leaves your machine. It needs {VISION_BUILD.requirement} and is
            also free.
          </p>
          <p>
            <a className="button button-quiet" href={VISION_BUILD.href}>
              Download Vision <ArrowUpRight size={15} />
            </a>{" "}
            <Link className="button button-quiet" href="/products/vision">
              About Vision <ArrowUpRight size={15} />
            </Link>
          </p>
        </section>

        <InShort>
          Take the macOS build if you are on a Mac, the ARM64 build if Windows reports an ARM-based
          processor, and the x64 build otherwise. All three are free and all three update themselves
          afterwards. If the first launch looks like a warning rather than an app, the{" "}
          <Link href="/install">installation page</Link> covers what each operating system says and
          why.
        </InShort>

        <section aria-labelledby="dl-more">
          <h2 id="dl-more">More</h2>
          <ul className="comparison-others">
            <li><Link href="/download/mac">Hangly for Mac, in detail</Link></li>
            <li><Link href="/download/windows">Hangly for Windows, in detail</Link></li>
            <li><Link href="/install">How to install Hangly</Link></li>
            <li><Link href="/changelog">What changed in each release</Link></li>
            <li><Link href="/faq">Frequently asked questions</Link></li>
            <li><Link href="/products/hangly">The Hangly product page</Link></li>
          </ul>
        </section>
      </main>
      <PlatformSheet />
    </>
  );
}
