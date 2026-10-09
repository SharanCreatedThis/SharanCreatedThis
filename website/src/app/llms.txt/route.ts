import { COMPARISONS } from "@/lib/comparisons/comparison-data";
import { GUIDES } from "@/lib/guides/guide-data";
import { HANGLY_ROPES } from "@/lib/hangly-product";
import { HANGLY_CATEGORIES, HANGLY_STATS } from "@/lib/stats/hangly";
import { absoluteUrl } from "@/lib/seo";

/**
 * /llms.txt (llmstxt.org): the facts about Hangly in one plain file, for the answer engines that read it.
 *
 * Built from the same data as the pages, at build time, so it cannot say something the site does not: the version
 * comes from the update feeds, the counts from the shipped catalogue, the comparisons and guides from their data.
 */
export const dynamic = "force-static";

export function GET() {
  const s = HANGLY_STATS;
  const link = (title: string, path: string, note?: string) => `- [${title}](${absoluteUrl(path)})${note ? `: ${note}` : ""}`;
  const body = [
    "# Hangly",
    "",
    `> Hangly is a free desktop app for macOS and Windows that hangs a decorative charm from the top of your screen on a rope with real pendulum physics. It ships ${s.charmCount} charms across ${s.categoryCount} categories and ${s.ropeStyleCount} rope styles, turns any image into a charm, and lets clicks pass through everywhere but the charm. Made by Sharan Created This, in India. Not related to the "Hangly Social" iPhone app.`,
    "",
    "## Facts",
    "",
    `- Current version: ${s.macVersion} on macOS, ${s.windowsVersion} on Windows, released together.`,
    "- macOS 14 Sonoma or later, Apple Silicon and Intel (one universal build).",
    "- Windows 10 version 1809 or later on x64; Windows 11 on ARM with a native ARM64 build.",
    "- Price: free. No paid tier, subscription, trial or advertising. An optional tip (Buy the Creator a Coffee).",
    `- Charms: ${s.charmCount} in ${s.categoryCount} categories, the same on both platforms: ${HANGLY_CATEGORIES.map((c) => c.name).join(", ")}.`,
    `- Rope styles: ${HANGLY_ROPES.map((r) => r.name).join(", ")}.`,
    "- Up to three charms on one rope; choose the display; Creator Studio cuts the subject out of any photo to make a charm.",
    "- Updates: checks hourly; a card under the charm offers Update in Background (Sparkle on macOS, Velopack on Windows).",
    "- Privacy: no account; never reads the screen, files or imported images. Each installation registers a random ID, the nickname chosen, a city derived from the IP address (the address is not stored), versions and activity; anonymous usage events and crash reports are sent. There is no switch to turn the registration off.",
    "- Windows installer is not yet code-signed, so SmartScreen may warn on first run (More info, then Run anyway).",
    "- The Windows app's source is public on GitHub under the MIT licence: https://github.com/SharanCreatedThis/Hangly-Windows",
    "",
    "## Pages",
    "",
    link("Hangly", "/products/hangly", "the product page"),
    link("Download", "/download", "macOS, Windows x64 and Windows ARM64"),
    link("Install and uninstall", "/install"),
    link("Every charm", "/charms"),
    link("FAQ", "/faq"),
    link("Privacy", "/products/hangly/privacy"),
    link("Changelog", "/changelog"),
    link("Statistics", "/products/hangly/stats"),
    "",
    "## Comparisons",
    "",
    ...COMPARISONS.map((c) => link(c.title, `/compare/${c.slug}`, c.description)),
    "",
    "## Guides",
    "",
    ...GUIDES.map((g) => link(g.title, `/guides/${g.slug}`, g.description)),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
