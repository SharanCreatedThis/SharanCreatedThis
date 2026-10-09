/**
 * Where each charm's artwork lives on the website.
 *
 * The app and the website name the same charms differently. The shipped
 * catalogue calls them `walterWhite` and `ronaldoJersey`; the website's artwork
 * was filed under `breakingBad1` and `football25` before those names existed.
 * Reading one set of ids against the other directory is how thirty shipping
 * charms were once reported as "marketed but never built".
 *
 * So the alias below is the bridge, and it is derived rather than guessed:
 * every pair was matched by display name between `CharmLibrary.json` and
 * `Collections.tsx`, and the four that differ in formatting — "Cristiano
 * Ronaldo" against "Ronaldo 7" — were confirmed by hand against both files.
 *
 * A charm with no website SVG shows the app's own Library preview as WebP,
 * imported by `scripts/import-charm-previews.mjs` and listed in
 * `charm-artwork-webp.json` (98 of the 161 in 2.3.1: everything added since 2.0,
 * and the five Classic charms the app draws in code).
 *
 * `scripts/validate-charm-artwork.mjs` re-checks every path on each build, so
 * a rename in either place fails rather than ships a broken image.
 */

import { SHIPPED_CHARMS } from "@/lib/stats/hangly";
import WEBP_ARTWORK_IDS from "@/data/hangly/charm-artwork-webp.json";

/** Shipped charm id → the filename its artwork is stored under. */
export const ARTWORK_ALIAS: Record<string, string> = {
  // Breaking Bad
  walterWhite: "breakingBad1", jessePinkman: "breakingBad2", saulGoodman: "breakingBad3",
  gusFring: "breakingBad4", mikeEhrmantraut: "breakingBad5", heisenberg: "breakingBad6",
  rv: "breakingBad7",              // "RV"        ← "The RV"
  // Stranger Things
  eleven: "strangerThings8", mikeWheeler: "strangerThings9", dustinHenderson: "strangerThings10",
  lucasSinclair: "strangerThings11", willByers: "strangerThings12", demogorgon: "strangerThings13",
  // Friends
  rachelGreen: "friends14", monicaGeller: "friends15", rossGeller: "friends16",
  joeyTribbiani: "friends17", chandlerBing: "friends18", phoebeBuffay: "friends19",
  // Music Legends
  billieEilish: "singer20", xxxtentacion: "singer21", michaelJackson: "singer22",
  taylorSwift: "singer23", juiceWrld: "singer24",
  // Football Legends — names differ in formatting, confirmed by hand
  ronaldoJersey: "football25",     // "Ronaldo 7"  ← "Cristiano Ronaldo"
  messiJersey: "football26",       // "Messi 10"   ← "Lionel Messi"
  neymarJersey: "football27",      // "Neymar 10"  ← "Neymar Jr."
  realMadridCrest: "football28", fcBarcelonaCrest: "football29",
};

/** Charms shown from the app's preview (WebP) because the website has no SVG for them. */
export const WEBP_ARTWORK = new Set<string>(WEBP_ARTWORK_IDS);

/**
 * Charms the website has no artwork for. Empty since 2.3.1's previews were
 * imported. A charm listed here renders as a labelled placeholder rather than a
 * broken image, and is left out of image schema, because a page may not claim
 * an image it does not have.
 */
export const CHARMS_WITHOUT_ARTWORK = new Set([] as string[]);

const fileFor = (id: string) => ARTWORK_ALIAS[id] ?? id;

/** Plain artwork path, or null when none exists. */
export function artworkPath(id: string): string | null {
  if (CHARMS_WITHOUT_ARTWORK.has(id)) return null;
  return WEBP_ARTWORK.has(id) ? `/charms/${id}.webp` : `/charms/${fileFor(id)}.svg`;
}

/** The rendering with the hanging thread, or null. A preview has no thread drawn in, so it is its own. */
export function connectedArtworkPath(id: string): string | null {
  if (CHARMS_WITHOUT_ARTWORK.has(id)) return null;
  return WEBP_ARTWORK.has(id) ? `/charms/${id}.webp` : `/charms/connected/${fileFor(id)}.svg`;
}

export const ARTWORK_COVERAGE = {
  total: SHIPPED_CHARMS.length,
  withArtwork: SHIPPED_CHARMS.length - CHARMS_WITHOUT_ARTWORK.size,
  without: CHARMS_WITHOUT_ARTWORK.size,
} as const;
