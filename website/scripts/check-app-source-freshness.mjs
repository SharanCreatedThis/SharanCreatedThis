/**
 * Reports how far `apps/Hangly/` has drifted from the shipped application.
 *
 * Documentation alone does not stop this: the stale source was read by an audit
 * that never opened a README, and the resulting figure — 49 charms against a
 * real 81 — was published in six documents. A file nobody opens cannot warn
 * anybody, so the divergence is measured instead.
 *
 * Warns by default and exits 0, because a stale copy of the app is not a reason
 * to fail a website build. `--strict` exits 1, for anyone who wants it enforced.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(root, "..");
const strict = process.argv.includes("--strict");

const SHIPPED = join(root, "src/data/hangly/charm-library.shipped.json");
const IN_REPO = join(repoRoot, "apps/Hangly/Hangly/Assets/CharmLibrary.json");

const ESC = String.fromCharCode(27);
const c = (n, t) => `${ESC}[${n}m${t}${ESC}[0m`;

if (!existsSync(IN_REPO)) {
  console.log(`\n  ${c(32, "app source freshness")}  apps/Hangly has no catalogue — nothing to drift\n`);
  process.exit(0);
}

const shipped = JSON.parse(readFileSync(SHIPPED, "utf8"));
const inRepo = JSON.parse(readFileSync(IN_REPO, "utf8"));

const shipIds = new Set(shipped.charms.map((x) => x.id));
const repoIds = new Set(inRepo.charms.map((x) => x.id));
const shipCats = new Set(shipped.categories.map((x) => x.id));
const repoCats = new Set(inRepo.categories.map((x) => x.id));

const missingCharms = [...shipIds].filter((i) => !repoIds.has(i));
const extraCharms = [...repoIds].filter((i) => !shipIds.has(i));
const missingCats = [...shipCats].filter((i) => !repoCats.has(i));

/** Charms present in both whose published metadata differs. */
const shipById = new Map(shipped.charms.map((x) => [x.id, x]));
const repoById = new Map(inRepo.charms.map((x) => [x.id, x]));
const renamed = [...shipIds]
  .filter((i) => repoIds.has(i) && shipById.get(i).name !== repoById.get(i).name)
  .map((i) => `${repoById.get(i).name} → ${shipById.get(i).name}`);

const drifted = missingCharms.length || extraCharms.length || missingCats.length || renamed.length;

// npm_package_version is the website's, not the app's — read the app version
// from the stats module, which reads it from the shipped binary.
const appVersion =
  (readFileSync(join(root, "src/lib/stats/hangly.ts"), "utf8").match(/appVersion:\s*"([^"]+)"/) || [, "?"])[1];
console.log(`\n  ${c(1, "app source freshness")}  apps/Hangly vs shipped Hangly ${appVersion}\n`);
console.log(`    charms      repo ${String(repoIds.size).padStart(3)}   shipped ${String(shipIds.size).padStart(3)}`);
console.log(`    categories  repo ${String(repoCats.size).padStart(3)}   shipped ${String(shipCats.size).padStart(3)}`);

if (!drifted) {
  console.log(`\n  ${c(32, "in sync")}\n`);
  process.exit(0);
}

console.log(`\n  ${c(33, "STALE — apps/Hangly does not match the shipped application")}`);
if (missingCharms.length) {
  console.log(`    ${missingCharms.length} charms missing from apps/Hangly:`);
  console.log(`      ${missingCharms.join(", ")}`);
}
if (missingCats.length) console.log(`    ${missingCats.length} categories missing: ${missingCats.join(", ")}`);
if (extraCharms.length) console.log(`    ${extraCharms.length} charms in apps/Hangly that do not ship: ${extraCharms.join(", ")}`);
if (renamed.length) {
  console.log(`    ${renamed.length} charms renamed since the snapshot:`);
  for (const r of renamed) console.log(`      ${r}`);
}
console.log(`
    Do not use apps/Hangly to answer "how many" or "which ones".
    Use src/data/hangly/charm-library.shipped.json, or HANGLY_STATS.
    Background: apps/Hangly/STALE.md
`);

process.exit(strict ? 1 : 0);
