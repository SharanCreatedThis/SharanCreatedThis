/**
 * Every factual claim the site makes about itself or a competitor.
 *
 * This file exists because the comparison pages criticise competitors for not
 * publishing figures, which only works if ours are right. A claim recorded
 * here has a source, a date it was last read, and an honest confidence — and
 * where something could not be verified that is stated rather than softened.
 *
 * `confidence` means:
 *   high    read directly from a primary source (a repository, an appcast, a
 *           developer's own page) on the date recorded
 *   medium  read from a primary source, but the source is one the owner
 *           controls and cannot be independently checked (self-reported)
 *   low     from a secondary source, or from a source that has since changed
 *   none    not verified — the claim is currently unsupported
 */

export type Claim = {
  /** Where the claim appears. */
  surface: string;
  claim: string;
  /** The primary source, or "" where there is none. */
  source: string;
  verified: boolean;
  lastChecked: string;
  confidence: "high" | "medium" | "low" | "none";
  /** Why it is not fully verified, where that applies. */
  note?: string;
};

const OWN = "2026-09-25";
const LIVE = "2026-09-25";
const PRIOR = "2026-09-24";

export const CLAIMS: Claim[] = [
  /* ── Our own product facts ───────────────────────────────────────────── */
  {
    surface: "Sitewide, schema, ~20 files",
    claim: "Hangly ships 80+ charms across 11 collections",
    source: "src/components/hangly/Collections.tsx",
    verified: false,
    lastChecked: OWN,
    confidence: "none",
    note:
      "UNSUPPORTED. The collections component lists 55 charms across 11 collections; public/charms holds 75 SVG files; the generated CHARM_ART manifest has 56 entries. No artefact in the repository produces 80. The collection count of 11 is correct. Introduced by hand in commit efe8c5e. The in-app total may genuinely exceed 80 if seasonal charms and variants are counted, but the website cannot currently show that, and the comparison tables present it as a *published* count while criticising rivals for not publishing one.",
  },
  {
    surface: "/products/hangly/stats",
    claim: "55 charms listed across 11 collections; 75 charm artwork files",
    source: "scripts/generate-stats.mjs, counted at build time",
    verified: true, lastChecked: OWN, confidence: "high",
  },
  {
    surface: "Sitewide",
    claim: "Hangly macOS is at version 2.0.0, 34 MB, requires macOS 14",
    source: "public/products/hangly/appcast.xml",
    verified: true, lastChecked: OWN, confidence: "high",
    note: "Read from the same feed the Sparkle updater reads, so it cannot disagree with what users are offered.",
  },
  {
    surface: "Sitewide",
    claim: "Hangly Windows is at 0.9.4 and is a pre-release",
    source: "public/_redirects, generated from the GitHub releases API",
    verified: true, lastChecked: OWN, confidence: "high",
  },
  {
    surface: "Sitewide",
    claim: "Vision is at 1.1 and requires macOS 15",
    source: "public/products/vision/appcast.xml",
    verified: true, lastChecked: OWN, confidence: "high",
  },
  {
    surface: "/changelog, /products/hangly/stats",
    claim: "The macOS download fell from 89 MB to 33 MB at version 2.0",
    source: "public/products/hangly/appcast.xml release notes",
    verified: true, lastChecked: OWN, confidence: "medium",
    note: "Self-reported in our own release notes. The 34 MB current figure is verifiable from the enclosure length; the 89 MB prior figure is not independently checkable.",
  },
  {
    surface: "Sitewide",
    claim: "Hangly is click-through and never takes keyboard focus",
    source: "Application behaviour",
    verified: false, lastChecked: OWN, confidence: "medium",
    note: "A product behaviour claim that cannot be verified from this repository. It is consistent everywhere it appears and is core to the positioning, so it is worth confirming against the shipping build before it is quoted more widely.",
  },
  {
    surface: "/download/windows, /install",
    claim: "The Windows build is not code-signed, so SmartScreen warns once",
    source: "Stated in our own docs and roadmap",
    verified: true, lastChecked: OWN, confidence: "medium",
    note: "Self-reported, and consistent with the absence of a signing step in the release pipeline.",
  },
  {
    surface: "Sitewide",
    claim: "macOS build is Developer ID signed and notarised",
    source: "Self-reported",
    verified: false, lastChecked: OWN, confidence: "medium",
    note: "Plausible and consistent with Sparkle EdDSA signatures in the appcast, but not verified against the shipping DMG in this pass.",
  },
  {
    surface: "/guides, /products/hangly/roadmap",
    claim: "Six of the eleven collections are unfinished: Football, Stranger Things, Singers, Breaking Bad, Friends, Dream Catcher",
    source: "ROADMAP.md and src/data/hangly-faq.ts",
    verified: true, lastChecked: OWN, confidence: "high",
  },

  /* ── Competitors read live on 2026-09-25 ─────────────────────────────── */
  {
    surface: "/guides/desktop-goose-alternatives, /guides/best-desktop-pets-for-mac",
    claim: "Desktop Goose is at 0.31 on Windows and 0.22 on macOS, with no mod support on Mac",
    source: "https://samperson.itch.io/desktop-goose",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "The developer's note reading \"Mac doesn't support mods yet. Wait for 2023 :)\" was present on the page when read.",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "Bartender 7 requires macOS 27; earlier systems need Bartender 6",
    source: "https://www.macbartender.com/",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "Prices load dynamically on their page and are deliberately not quoted anywhere on this site.",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "Ice is GPL-3.0, free, requires macOS 14+, 29.7k GitHub stars",
    source: "https://github.com/jordanbaird/Ice",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "Star counts drift. Treat as accurate to the date, not indefinitely.",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "Raycast free tier covers the launcher; Pro $10/mo, Plus $20, Max $50",
    source: "https://www.raycast.com/pricing",
    verified: true, lastChecked: LIVE, confidence: "high",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "Maccy is MIT, free, macOS 14+, 21.7k stars, no cloud sync",
    source: "https://github.com/p0deje/Maccy",
    verified: true, lastChecked: LIVE, confidence: "high",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "AltTab is GPL-3.0, free, 16.3k stars",
    source: "https://github.com/lwouis/alt-tab-macos",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "Minimum macOS version is not stated on the repository page and is not claimed on the site.",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "SketchyBar is GPL-3.0, free, 12.4k stars, configured by shell script",
    source: "https://github.com/FelixKratz/SketchyBar",
    verified: true, lastChecked: LIVE, confidence: "high",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "iStat Menus is at 7.5, needs macOS 11+, 14-day trial, Setapp at USD$9.99/month",
    source: "https://bjango.com/mac/istatmenus/",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "Their own page shows price placeholders, so no purchase price is quoted on this site.",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "Rectangle is free and open source, macOS 10.15+, Pro has a 10-day trial",
    source: "https://rectangleapp.com/",
    verified: true, lastChecked: LIVE, confidence: "high",
  },
  {
    surface: "/guides/best-mac-customization-apps",
    claim: "BetterTouchTool has a 45-day trial with no account, 600+ actions and triggers",
    source: "https://folivora.ai/",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "Price tiers are behind a separate buy page and are not quoted on this site.",
  },
  {
    surface: "/guides/best-desktop-pets-for-mac",
    claim: "Pets Therapy: 100+ pets, 37 free forever, macOS/Windows/Linux, free on the Mac App Store",
    source: "https://pets-therapy.com/",
    verified: true, lastChecked: LIVE, confidence: "high",
  },
  {
    surface: "/guides/best-desktop-pets-for-mac",
    claim: "Mac Pet is $9.99, macOS 10.15+, menu bar or notch, under 1% CPU",
    source: "https://mac-pet.com/en",
    verified: true, lastChecked: LIVE, confidence: "medium",
    note: "The CPU figure is the developer's own claim and was not independently measured.",
  },
  {
    surface: "/guides/best-desktop-pets-for-mac",
    claim: "NotiSprite has 22 characters with 5 free and fully featured",
    source: "https://notisprite.com/",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "Minimum macOS version is not published and is not claimed on this site.",
  },
  {
    surface: "/guides",
    claim: "Bongo Cat is free with paid cosmetics, Windows and macOS via Steam",
    source: "https://openpets.dev/alternatives",
    verified: true, lastChecked: LIVE, confidence: "low",
    note: "Read from a competitor's comparison page rather than from Steam directly. Should be checked against the Steam listing before being relied on.",
  },
  {
    surface: "/guides",
    claim: "VPet Simulator is open source, Windows, Linux via Wine, no native macOS build",
    source: "https://openpets.dev/alternatives",
    verified: true, lastChecked: LIVE, confidence: "low",
    note: "Secondary source. The absence of a macOS build was not confirmed against the project's own repository.",
  },
  {
    surface: "/guides/best-desktop-pets-for-mac, /guides/desktop-goose-alternatives",
    claim: "Cat Fidget is published at highroadsoftware.com, not tryfidget.com",
    source: "https://tryfidget.com/ (confirmed to be an unrelated recruitment platform)",
    verified: true, lastChecked: LIVE, confidence: "high",
    note: "The negative half is verified: tryfidget.com is definitively not Cat Fidget. The positive half — that highroadsoftware.com is the correct home — carries over from the 2026-09-24 pass and was not re-fetched.",
  },
  {
    surface: "/guides/best-desktop-pets-for-mac",
    claim: "MicroJoyz costs around $9.99 after a 3-day trial",
    source: "Search result summaries",
    verified: false, lastChecked: LIVE, confidence: "low",
    note: "Their own landing page does not publish a price. The guide says so explicitly and attributes the figure to third parties rather than stating it as fact. Do not promote this to a stated price without a primary source.",
  },

  /* ── Carried over from the 2026-09-24 pass, not re-verified ──────────── */
  {
    surface: "/compare/*, /guides/best-desktop-charm-apps-for-mac",
    claim: "Competitor charm apps: Lucky Dangle, Screen Dangle, DangleJoy, Charmly, Screen Charms, Drishti Dangle (₹99), Book My Luck — platforms, prices and feature claims",
    source: "Each product's own site",
    verified: true, lastChecked: PRIOR, confidence: "medium",
    note: "Read on 2026-09-24 and not re-fetched in this pass. Every comparison page states its own check date on the page, which is the mitigation. Re-verify before any of these are cited as current.",
  },
  {
    surface: "guide-data.ts header comment",
    claim: "Screen Dangle has 1,427 indexed URLs, Shimeji 6,899, Cat Fidget 673",
    source: "A site: query crawl on 2026-09-24",
    verified: true, lastChecked: PRIOR, confidence: "low",
    note: "Index counts from a site: query are approximate by nature and move constantly. These appear only in a source comment explaining why the guides exist — they are not published on any page. Keep it that way.",
  },
  {
    surface: "/guides, /compare",
    claim: "Shimeji's popular form today is a browser extension confined to web pages",
    source: "https://shimejis.xyz",
    verified: true, lastChecked: PRIOR, confidence: "medium",
    note: "Not re-fetched in this pass.",
  },

  /* ── Repository documentation ────────────────────────────────────────── */
  {
    surface: "ROADMAP.md, standing constraints table",
    claim: "Vision's appcast is served from the apex domain",
    source: "Vision-1.1.dmg Info.plist SUFeedURL",
    verified: false, lastChecked: OWN, confidence: "none",
    note:
      "INCORRECT. The SUFeedURL compiled into Vision 1.1 points at www, not the apex. This was found and corrected in docs/cloudflare-migration.md and docs/apex-to-www-plan.md in an earlier pass, but ROADMAP.md was missed and still says apex. It is documentation only — no shipping behaviour depends on it — but it is the kind of error that causes a wrong decision later about an apex-to-www redirect.",
  },
];
