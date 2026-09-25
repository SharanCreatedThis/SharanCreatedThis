/**
 * Every artwork path a charm page can render must resolve to a real file.
 *
 * `src/lib/charms/artwork.ts` maps shipped charm ids onto website filenames,
 * because the two name the same charms differently — `walterWhite` in the app
 * is `breakingBad1` on disk. A rename on either side would silently produce a
 * broken image on a page whose whole purpose is showing the charms.
 *
 * Three failures stop the build:
 *
 *   1. A charm resolves to a path that does not exist.
 *   2. A charm is listed in CHARMS_WITHOUT_ARTWORK but the file is there —
 *      the placeholder is hiding a charm that could be shown.
 *   3. An alias points at a file that does not exist.
 *
 * Orphan SVGs — files matching no charm — are reported, not failed. They are
 * dead weight rather than a broken page.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const shipped = JSON.parse(read("src/data/hangly/charm-library.shipped.json"));
const src = read("src/lib/charms/artwork.ts");

/** Pull the alias map and the no-artwork set out of the TypeScript. */
const aliasBody = src.slice(src.indexOf("ARTWORK_ALIAS: Record<string, string> = {"));
const alias = Object.fromEntries(
  [...aliasBody.slice(0, aliasBody.indexOf("\n};")).matchAll(/(\w+):\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]),
);
const withoutBody = src.slice(src.indexOf("CHARMS_WITHOUT_ARTWORK = new Set(["));
const without = new Set(
  [...withoutBody.slice(0, withoutBody.indexOf("]);")).matchAll(/"([^"]+)"/g)].map((m) => m[1]),
);

const errors = [];
const warnings = [];
const fileFor = (id) => alias[id] ?? id;

let resolved = 0;
for (const charm of shipped.charms) {
  const file = fileFor(charm.id);
  const plain = `public/charms/${file}.svg`;
  const exists = existsSync(join(root, plain));

  if (without.has(charm.id)) {
    if (exists) {
      errors.push(`${charm.id} is listed as having no artwork, but ${plain} exists — remove it from CHARMS_WITHOUT_ARTWORK`);
    }
    continue;
  }
  if (!exists) {
    errors.push(`${charm.id} ("${charm.name}") resolves to ${plain}, which does not exist`);
    continue;
  }
  resolved++;
  const connected = `public/charms/connected/${file}.svg`;
  if (!existsSync(join(root, connected))) warnings.push(`${charm.id}: no connected rendering at ${connected}`);
}

for (const [id, file] of Object.entries(alias)) {
  if (!existsSync(join(root, `public/charms/${file}.svg`))) {
    errors.push(`alias ${id} → ${file} points at a file that does not exist`);
  }
  if (!shipped.charms.some((c) => c.id === id)) {
    errors.push(`alias ${id} names a charm that is not in the shipped catalogue`);
  }
}

const shippedIds = new Set(shipped.charms.map((c) => c.id));
const used = new Set(shipped.charms.map((c) => fileFor(c.id)));
const orphans = readdirSync(join(root, "public/charms"))
  .filter((f) => f.endsWith(".svg"))
  .map((f) => f.replace(/\.svg$/, ""))
  .filter((f) => !used.has(f) && !shippedIds.has(f));

const ESC = String.fromCharCode(27);
const c = (n, t) => `${ESC}[${n}m${t}${ESC}[0m`;

console.log(`\n  ${c(1, "charm artwork")}  ${resolved}/${shipped.charms.length} charms illustrated, ${without.size} without\n`);
if (orphans.length) console.log(`    ${orphans.length} orphan file(s) matching no charm: ${orphans.join(", ")}`);
if (warnings.length) {
  console.log(`\n  ${c(33, `${warnings.length} warning(s)`)}`);
  for (const w of warnings.slice(0, 8)) console.log(`    · ${w}`);
  if (warnings.length > 8) console.log(`    · …and ${warnings.length - 8} more`);
}
if (errors.length) {
  console.log(`\n  ${c(31, `${errors.length} error(s)`)}`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log();
  process.exit(1);
}
console.log(`\n  ${c(32, "every rendered charm has artwork")}\n`);
