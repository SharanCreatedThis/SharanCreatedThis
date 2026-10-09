/**
 * Every number the site states about Hangly, in one place.
 *
 * Nothing outside this file may hardcode a charm count. `scripts/validate-charm-counts.mjs`
 * fails the build if one appears, and it is wired into `prebuild`.
 *
 * **Why this file exists.** The count has been wrong three separate ways. It
 * was "80+" written by hand with nothing behind it; then "75", which counted
 * SVG files in `website/public/charms/` rather than the product; then "49",
 * which came from `apps/Hangly/` — a copy of the app source that predates the
 * shipped 2.0 build by two days and is missing 32 charms. Each correction was
 * confidently reported and each was wrong, because each counted something
 * adjacent to the product instead of the product.
 *
 * **The source of truth is the shipped binary.** `charm-library.shipped.json`
 * was extracted from `Hangly-2.3.1.dmg` — `CFBundleShortVersionString 2.3.1`,
 * `CFBundleVersion 231` — at `Contents/Resources/CharmLibrary.json` (9 Oct 2026;
 * the DMG's SHA-256 begins 714b60b8). Windows 2.3.1 ships the same catalogue. That is
 * the file the running application reads, so it cannot disagree with what a
 * user has installed.
 *
 * The validator re-counts that JSON on every build and fails if the numbers
 * below drift from it. `charmCount` is therefore checked, not asserted.
 */

import shipped from "@/data/hangly/charm-library.shipped.json";
import { HANGLY_MAC, HANGLY_MARKETING, HANGLY_PRODUCT, HANGLY_RELEASES, HANGLY_WINDOWS } from "@/lib/hangly-product";

export const HANGLY_STATS = {
  /** Exact count in the macOS build. */
  charmCount: HANGLY_MAC.charms,
  /** Exact count in the Windows build. */
  windowsCharmCount: HANGLY_WINDOWS.charms,
  /** Shared across both platform builds. */
  ropeStyleCount: HANGLY_MAC.ropeStyles,
  /** Installations ever registered, rounded down: see installsEvidence in product.json. Not people. */
  installCount: HANGLY_PRODUCT.installs,
  /** The exact shipped count; the site no longer rounds it to "100+". */
  marketingCharmCount: String(HANGLY_MAC.charms),
  marketingInstallCount: HANGLY_MARKETING.installs,
  macVersion: HANGLY_RELEASES.macOS,
  /** Backward-compatible macOS release reference for catalogue copy. */
  appVersion: HANGLY_RELEASES.macOS,
  windowsVersion: HANGLY_RELEASES.windows,
  /** Catalogue dimensions used by the library reference pages. */
  categoryCount: HANGLY_PRODUCT.catalogue.macCategories,
} as const;

/** Category names and sizes, read from the shipped catalogue rather than typed. */
export const HANGLY_CATEGORIES: { id: string; name: string; charms: number }[] =
  shipped.categories.map((c) => ({
    id: c.id,
    name: c.name,
    charms: shipped.charms.filter((x) => x.category === c.id).length,
  }));

/** Every charm the shipped app contains. */
export const SHIPPED_CHARMS = shipped.charms;

/**
 * Ready-made phrases, so the same fact is not worded five ways across the site.
 *
 * Anything stating a count should use one of these rather than composing its
 * own — that is what lets the validator check the whole site by looking for
 * digits next to the word "charm".
 */
export const HANGLY_COPY = {
  marketing: `${HANGLY_STATS.charmCount} charms`,
  installs: `${HANGLY_STATS.marketingInstallCount} installs`,
  mac: `${HANGLY_STATS.charmCount} charms`,
  windows: `${HANGLY_STATS.windowsCharmCount} charms`,
  ropes: `${HANGLY_STATS.ropeStyleCount} rope styles`,
  exact: `${HANGLY_STATS.charmCount} charms`,
  exactWithCategories: `${HANGLY_STATS.charmCount} charms across ${HANGLY_STATS.categoryCount} categories`,
  growth: `${HANGLY_STATS.charmCount} charms for macOS and Windows`,
} as const;
