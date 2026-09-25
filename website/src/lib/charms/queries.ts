/**
 * Every way the site reads the charm registry.
 *
 * All of it derives from `CHARMS`. Nothing here may hardcode a charm, a
 * collection or a count — that rule is what makes the registry a source of
 * truth rather than a fourth place charm facts live.
 *
 * Several functions deliberately return charms whose `displayName` is null.
 * Filtering them out silently would recreate the original problem, where
 * twenty charms existed and no page admitted it. A caller that cannot render
 * an unnamed charm should say so; see `needsAuthoring`.
 */

import { CHARMS, type Charm, type CharmCategory, type CharmSeason } from "./charm-registry";

export type CharmFilter = {
  collection?: string | null;
  category?: CharmCategory;
  season?: CharmSeason;
  /** Exclude charms that are someone else's IP. Defaults to including them. */
  excludeLicensed?: boolean;
  /** Only charms with a display name — what a rendered list usually wants. */
  namedOnly?: boolean;
  /** Free-text match over name, id, collection and meaning. */
  search?: string;
};

export function filterCharms(filter: CharmFilter = {}): Charm[] {
  const needle = filter.search?.trim().toLowerCase();
  return CHARMS.filter((c) => {
    if (filter.collection !== undefined && c.collection !== filter.collection) return false;
    if (filter.category && c.category !== filter.category) return false;
    if (filter.season && c.season !== filter.season) return false;
    if (filter.excludeLicensed && c.licensed) return false;
    if (filter.namedOnly && !c.displayName) return false;
    if (needle && !searchText(c).includes(needle)) return false;
    return true;
  });
}

/** Everything about a charm that is worth matching a query against. */
function searchText(c: Charm): string {
  return [c.displayName, c.id, c.collection, c.category, c.season, c.meaning, c.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * A prebuilt search index, so a page ships one array rather than recomputing
 * `searchText` for 81 charms on every keystroke.
 */
export type CharmSearchEntry = { id: string; label: string; haystack: string };

export function buildSearchIndex(): CharmSearchEntry[] {
  return CHARMS.map((c) => ({
    id: c.id,
    // An unnamed charm still needs a label, and the id is the honest one.
    label: c.displayName ?? c.id,
    haystack: searchText(c),
  }));
}

export type CharmGroup = { key: string; label: string; charms: Charm[] };

/** Charms grouped by collection. Charms in none are grouped under `null`. */
export function groupByCollection(charms: Charm[] = CHARMS): CharmGroup[] {
  const groups = new Map<string | null, Charm[]>();
  for (const c of charms) groups.set(c.collection, [...(groups.get(c.collection) ?? []), c]);
  return [...groups].map(([key, list]) => ({
    key: key ?? "uncollected",
    label: key ?? "Seasonal and lucky",
    charms: list,
  }));
}

export function groupByCategory(charms: Charm[] = CHARMS): CharmGroup[] {
  const groups = new Map<CharmCategory, Charm[]>();
  for (const c of charms) groups.set(c.category, [...(groups.get(c.category) ?? []), c]);
  return [...groups].map(([key, list]) => ({ key, label: key, charms: list }));
}

export function groupBySeason(charms: Charm[] = CHARMS): CharmGroup[] {
  const groups = new Map<string, Charm[]>();
  for (const c of charms) {
    if (!c.season) continue;
    groups.set(c.season, [...(groups.get(c.season) ?? []), c]);
  }
  return [...groups].map(([key, list]) => ({ key, label: key, charms: list }));
}

/** Distinct collections, in the order they appear in the registry. */
export function collections(): string[] {
  return [...new Set(CHARMS.map((c) => c.collection).filter((x): x is string => !!x))];
}

/** Counts, derived. Nothing may state a charm total from memory. */
export const CHARM_STATS = {
  total: CHARMS.length,
  inCollections: CHARMS.filter((c) => c.collection).length,
  uncollected: CHARMS.filter((c) => !c.collection).length,
  licensed: CHARMS.filter((c) => c.licensed).length,
  unlicensed: CHARMS.filter((c) => !c.licensed).length,
  named: CHARMS.filter((c) => c.displayName).length,
  collections: new Set(CHARMS.map((c) => c.collection).filter(Boolean)).size,
} as const;

/**
 * What a charm still needs before it can carry a public page.
 *
 * A licensed charm can never qualify, whatever is written about it — that is
 * the guard against a template generating a landing page aimed at somebody
 * else's trademark.
 */
export function needsAuthoring(c: Charm): string[] {
  const missing: string[] = [];
  if (!c.displayName) missing.push("displayName");
  if (!c.description) missing.push("description");
  if (!c.meaning) missing.push("meaning");
  if (!c.sourceUrls.length) missing.push("sourceUrls");
  if (c.category === "unknown") missing.push("category");
  return missing;
}

/** Charms eligible for a standalone indexable page, today. */
export function pageEligible(): Charm[] {
  return CHARMS.filter((c) => !c.licensed && needsAuthoring(c).length === 0);
}
