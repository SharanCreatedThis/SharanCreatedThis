/**
 * Fails the build if a charm count is written by hand.
 *
 * This exists because the count has been wrong three times, each correction
 * confidently reported and each wrong in a new way:
 *
 *   "80+"  written by hand, nothing behind it
 *   "75"   counted SVG files in public/charms — the website, not the product
 *   "49"   counted apps/Hangly/ — a copy of the app source two days older
 *          than the shipped build, missing 32 charms
 *
 * The shipped figure is 81, read from Hangly-2.0.0.dmg. Two checks keep it that
 * way:
 *
 *   1. HANGLY_STATS must agree with the shipped catalogue. If someone edits the
 *      constant without the product changing, the build stops.
 *   2. No file outside HANGLY_STATS may write a count next to the word "charm".
 *
 * The second check is deliberately loose. Its predecessor required the number
 * to sit immediately beside "charms" and therefore missed "80+ across eleven
 * collections", "80+ ready-made charms" and "Over eighty ready-made charms" —
 * three claims that were live in production while a sweep was reported clean.
 * A guard that passes on a variant it was written to catch is worse than none,
 * because it stops people looking.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const errors = [];

/* ── 1. the constants must match the shipped catalogue ─────────────────── */
const shipped = JSON.parse(read("src/data/hangly/charm-library.shipped.json"));
const actualCharms = shipped.charms.length;
const actualCategories = shipped.categories.length;
const actualSeasonal = shipped.charms.filter((c) => c.category === "seasonal").length;

const statsSrc = read("src/lib/stats/hangly.ts");
const stated = (key) => Number((statsSrc.match(new RegExp(`${key}:\\s*(\\d+)`)) || [])[1]);

for (const [key, actual] of [
  ["charmCount", actualCharms],
  ["categoryCount", actualCategories],
  ["seasonalCharmCount", actualSeasonal],
]) {
  const declared = stated(key);
  if (declared !== actual) {
    errors.push(`HANGLY_STATS.${key} is ${declared}; the shipped catalogue says ${actual}`);
  }
}

/* The marketing figure may round down, never up. */
const marketing = Number((statsSrc.match(/marketingCharmCount:\s*"(\d+)\+"/) || [])[1]);
if (!marketing) errors.push(`marketingCharmCount is not of the form "N+"`);
else if (marketing > actualCharms) {
  errors.push(`marketingCharmCount "${marketing}+" overstates the product, which ships ${actualCharms}`);
}

/* ── 2. no stale count may appear anywhere ────────────────────────────────
   These are the numbers this project has published and had to retract. Any of
   them beside the word charm, design, collection or category is a bug wherever
   it appears, including in prose. */
const STALE = new RegExp(
  String.raw`\b(?:49|55|69|75|100\+|80\+|forty-nine|fifty-five|sixty-nine|seventy-five|over eighty|eighty-plus)\b` +
    String.raw`[^.\n]{0,40}?\b(?:charm|design|collection|categor)|` +
    String.raw`\b(?:charm|design|collection|categor)[a-z]*[^.\n]{0,30}?\b(?:49|55|69|75|100\+|80\+|seventy-five|over eighty)\b`,
  "i",
);

/* ── 3. components and pages must import, never write a number ────────────
   Prose in the content data files may spell the figure out — a comparison
   table reads better as "eighty-one charms" than as an interpolation, and
   check 2 already guarantees the figure is current. Components and pages have
   no such excuse: a number in JSX is a number nobody will update. */
const NUMERIC_COUNT = new RegExp(
  String.raw`\b\d{2,3}\+?\s*(?:charm|design)|` + String.raw`\b(?:charm|design)s?\s*[:=]\s*["'\`]?\d{2,3}`,
  "i",
);

const ALLOWED = new Set([
  "src/lib/stats/hangly.ts",
  "src/data/hangly/charm-library.shipped.json",
  "src/data/stats.generated.ts",
  "src/lib/charms/charm-registry.ts",
  "src/lib/verification/claims.ts",
]);

/** Files whose job is prose. Check 2 applies; check 3 does not. */
const PROSE = /^src\/(data\/hangly-faq|lib\/(comparisons|guides)\/)/;

/**
 * Interpolations from the stats module, removed before a line is checked.
 *
 * The first version skipped any line *containing* one of these, which meant a
 * hardcoded "100+ charms" added beside a legitimate `${HANGLY_COPY.exact}` was
 * waved through. Exempting the reference rather than the line is the fix:
 * whatever remains after the interpolations are stripped still has to be clean.
 */
const STATS_REFERENCE =
  /\$\{[^}]*(?:HANGLY_STATS|HANGLY_COPY|HANGLY_CATEGORIES|CHARM_TOTAL|COLLECTION_COUNT|SEASONAL_COUNT|CHARM_IN_COLLECTIONS|WEBSITE_ARTWORK)[^}]*\}|\b(?:HANGLY_STATS|HANGLY_COPY|HANGLY_CATEGORIES|CHARM_TOTAL|COLLECTION_COUNT|SEASONAL_COUNT|CHARM_IN_COLLECTIONS|WEBSITE_ARTWORK)(?:\.[A-Za-z]+)?/g;

function walk(dir, found = []) {
  for (const entry of readdirSync(join(root, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(root, rel)).isDirectory()) walk(rel, found);
    else if (/\.tsx?$/.test(entry)) found.push(rel);
  }
  return found;
}

for (const file of walk("src")) {
  if (ALLOWED.has(file)) continue;
  read(file).split("\n").forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) return;

    // Strip legitimate references first, then check what is left.
    const bare = line.replace(STATS_REFERENCE, " ");

    const stale = bare.match(STALE);
    if (stale) errors.push(`${file}:${i + 1} stale count — "${stale[0].trim().slice(0, 60)}"`);

    if (!PROSE.test(file)) {
      const numeric = bare.match(NUMERIC_COUNT);
      if (numeric) errors.push(`${file}:${i + 1} numeric count in a component — "${numeric[0].trim().slice(0, 50)}"`);
    }
  });
}

const ESC = String.fromCharCode(27);
const c = (n, t) => `${ESC}[${n}m${t}${ESC}[0m`;

console.log(`\n  ${c(1, "charm counts")}  shipped ${actualCharms} charms, ${actualCategories} categories\n`);
if (errors.length) {
  console.log(`  ${c(31, `${errors.length} error(s)`)}`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log(`\n  Import from @/lib/stats/hangly instead of writing a number.\n`);
  process.exit(1);
}
console.log(`  ${c(32, "no hardcoded charm counts")}\n`);
