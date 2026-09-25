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
 * was extracted from `Hangly-2.0.0.dmg` — `CFBundleShortVersionString 2.0.0`,
 * `CFBundleVersion 200` — at `Contents/Resources/CharmLibrary.json`. That is
 * the file the running application reads, so it cannot disagree with what a
 * user has installed.
 *
 * The validator re-counts that JSON on every build and fails if the numbers
 * below drift from it. `charmCount` is therefore checked, not asserted.
 */

import shipped from "@/data/hangly/charm-library.shipped.json";

export const HANGLY_STATS = {
  /** Exact count from the shipped catalogue. Use for facts, schema, datasets. */
  charmCount: 81,
  /**
   * Rounded down, for hero copy and promotional lines.
   *
   * Never round up. "80+" is true of 81; "100+" would not be, and a marketing
   * figure that overstates the product is the thing this module exists to stop.
   */
  marketingCharmCount: "80+",
  /** Categories in the shipped catalogue. */
  categoryCount: 14,
  /** Seasonal charms, in four packs: Halloween, Diwali, Christmas, New Year. */
  seasonalCharmCount: 11,
  /** The version these figures were read from. */
  appVersion: "2.0.0",
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
  /** Hero and promotional. */
  marketing: `${HANGLY_STATS.marketingCharmCount} charms`,
  /** Factual, for schema, stats and comparison tables. */
  exact: `${HANGLY_STATS.charmCount} charms`,
  /** Factual, with structure. */
  exactWithCategories: `${HANGLY_STATS.charmCount} charms across ${HANGLY_STATS.categoryCount} categories`,
  /** Marketing, with structure. */
  marketingWithCategories: `${HANGLY_STATS.marketingCharmCount} charms across ${HANGLY_STATS.categoryCount} collections`,
  /** Where growth is mentioned. Today's number first, always. */
  growth: `${HANGLY_STATS.charmCount} charms today, with 100+ planned`,
} as const;
