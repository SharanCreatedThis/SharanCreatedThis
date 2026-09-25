/**
 * Every way the site reads the charm catalogue.
 *
 * The source is `charm-library.shipped.json`, extracted from the shipped
 * application. Nothing here may hardcode a charm, a category or a count.
 *
 * This replaced a registry generated from `public/charms/*.svg`, which
 * described 75 charms that were not the product — it omitted 7 that ship and
 * included 30 filed under names the app stopped using. Counting the website
 * was the mistake; the app is the product.
 */

import { SHIPPED_CHARMS, HANGLY_CATEGORIES, HANGLY_STATS } from "@/lib/stats/hangly";
import { artworkPath, connectedArtworkPath, CHARMS_WITHOUT_ARTWORK } from "./artwork";

export type Charm = {
  id: string;
  name: string;
  region: string;
  category: string;
  description: string;
  tags: string[];
};

/**
 * Categories that are somebody else's intellectual property.
 *
 * Charms in these appear in the index, because a visitor deciding whether to
 * install wants to see them. What they never get is a dedicated page, an
 * optimised title or a schema node of their own — displaying a charm is not
 * the same act as targeting a trademark.
 */
export const LICENSED_CATEGORIES = new Set([
  "marvel", "dc", "bts", "footballLegends", "musicLegends",
  "friends", "breakingBad", "strangerThings",
]);

export const CHARMS: Charm[] = SHIPPED_CHARMS as Charm[];

export const getCharm = (id: string) => CHARMS.find((c) => c.id === id);
export const isLicensed = (c: Charm) => LICENSED_CATEGORIES.has(c.category);
export const hasArtwork = (c: Charm) => !CHARMS_WITHOUT_ARTWORK.has(c.id);

export function charmsIn(...categories: string[]): Charm[] {
  const wanted = new Set(categories);
  return CHARMS.filter((c) => wanted.has(c.category));
}

export const categoryName = (id: string) =>
  HANGLY_CATEGORIES.find((c) => c.id === id)?.name ?? id;

/* ── the three pages' charm sets, named once ──────────────────────────────
   A page's contents are a query, not a list. Adding a charm to a category in
   the app puts it on the right page at the next build with nothing to edit. */

/** Luck, protection and ritual — the twelve the category competes on. */
export const LUCKY_CATEGORIES = ["protection", "luck", "ritual"] as const;
export const luckyCharms = () => charmsIn(...LUCKY_CATEGORIES);

export const seasonalCharms = () => charmsIn("seasonal");
export const classicCharms = () => charmsIn("classic");

/** The four seasonal packs, from SeasonalPack.swift in the application. */
export const SEASONAL_PACKS: { id: string; name: string; window: string; charms: string[] }[] = [
  { id: "halloween", name: "Halloween", window: "1–31 October", charms: ["bat", "ghost", "pumpkin"] },
  { id: "diwali", name: "Diwali", window: "Moves with the lunar calendar — editable in the app", charms: ["lotus", "lantern", "diya"] },
  { id: "christmas", name: "Christmas", window: "1–26 December", charms: ["snowflake", "candyCane", "bell"] },
  { id: "newYear", name: "New Year", window: "27 December – 6 January", charms: ["firework", "luckyCoin"] },
];

export type CharmGroup = { key: string; label: string; charms: Charm[] };

/** Charms grouped by category, in the catalogue's own order. */
export function groupByCategory(charms: Charm[] = CHARMS): CharmGroup[] {
  return HANGLY_CATEGORIES
    .map((cat) => ({ key: cat.id, label: cat.name, charms: charms.filter((c) => c.category === cat.id) }))
    .filter((g) => g.charms.length > 0);
}

/* ── filtering ────────────────────────────────────────────────────────────
   Applied on the client over a list already rendered into the HTML. Filters
   narrow what is shown; they never fetch, and they never change the URL — a
   facet combination is a view, not a page. */

export type CharmSearchEntry = { id: string; haystack: string };

export function buildSearchIndex(charms: Charm[] = CHARMS): CharmSearchEntry[] {
  return charms.map((c) => ({
    id: c.id,
    haystack: [c.name, c.region, c.description, c.tags.join(" "), categoryName(c.category)]
      .join(" ")
      .toLowerCase(),
  }));
}

export const regionsIn = (charms: Charm[] = CHARMS) =>
  [...new Set(charms.map((c) => c.region))].sort();

export const categoriesIn = (charms: Charm[] = CHARMS) =>
  HANGLY_CATEGORIES.filter((cat) => charms.some((c) => c.category === cat.id));

export { artworkPath, connectedArtworkPath, CHARMS_WITHOUT_ARTWORK, HANGLY_STATS };
