/**
 * One command that says whether every integration is actually working.
 *
 * The distinction this exists to make: "configured" and "working" are not the
 * same, and only the second one is worth reporting. A token that is present and
 * a token that is accepted are different facts, so every check does something
 * real against the service rather than testing whether a variable is set.
 *
 * Exit code is 0 unless something is configured and broken. Services that are
 * simply not set up yet are reported and do not fail the run — this is meant to
 * be usable from the first day, when most of it is unconfigured, and to stay
 * usable in CI later, when it should be silent unless something breaks.
 */

import { STATUS } from "./lib.mjs";
import * as site from "./site.mjs";
import * as cloudflare from "./cloudflare.mjs";
import * as github from "./github.mjs";
import * as google from "./google.mjs";
import * as clarity from "./clarity.mjs";
import * as bing from "./bing.mjs";

const SERVICES = [
  ["Live site", site],
  ["Cloudflare", cloudflare],
  ["GitHub", github],
  ["Google (Search Console + GA4)", google],
  ["Microsoft Clarity", clarity],
  ["Bing Webmaster", bing],
];

const ESC = String.fromCharCode(27);
const colour = (code, text) => `${ESC}[${code}m${text}${ESC}[0m`;
const MARK = {
  [STATUS.ok]: colour(32, "✓"),
  [STATUS.unconfigured]: colour(90, "·"),
  [STATUS.denied]: colour(31, "✗"),
  [STATUS.error]: colour(33, "!"),
};

const args = process.argv.slice(2);
const json = args.includes("--json");
const only = args.find((a) => !a.startsWith("--"))?.toLowerCase();

const all = [];
for (const [name, service] of SERVICES) {
  if (only && !name.toLowerCase().includes(only)) continue;
  let rows;
  try {
    rows = await service.check();
  } catch (error) {
    rows = [{ name, status: STATUS.error, detail: `check itself failed: ${error.message}` }];
  }
  all.push({ service: name, rows });
}

if (json) {
  console.log(JSON.stringify(all, null, 2));
} else {
  for (const { service, rows } of all) {
    console.log(`\n${colour(1, service)}`);
    for (const row of rows) {
      console.log(`  ${MARK[row.status] ?? "?"} ${row.name.padEnd(38)} ${row.detail}`);
    }
  }
  const flat = all.flatMap((s) => s.rows);
  const counts = Object.fromEntries(
    Object.values(STATUS).map((s) => [s, flat.filter((r) => r.status === s).length]),
  );
  console.log(
    `\n${counts.ok} working · ${counts.unconfigured} not set up yet · ` +
      `${counts.denied} rejected · ${counts.error} failing`,
  );
  if (counts.unconfigured) console.log("  setup steps: docs/integrations.md");
}

// A service nobody has configured is not a failure. A service that was
// configured and no longer answers is, and that is what should wake someone.
const broken = all
  .flatMap((s) => s.rows)
  .filter((r) => r.status === STATUS.denied || r.status === STATUS.error);
process.exit(broken.length ? 1 : 0);
