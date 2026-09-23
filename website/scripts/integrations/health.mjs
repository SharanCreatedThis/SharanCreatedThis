/**
 * One screen answering "is the site up and is anything watching it".
 *
 * Distinct from `integrations:check`, which asks whether every credential
 * works. This asks the operational question — what is deployed, what is being
 * served, and which of the four measurement services is actually receiving
 * anything — and it answers as much of that as possible with no credentials at
 * all, so it stays useful on a machine that has none.
 *
 * Eight rows, fixed. A row never disappears: a service that is not set up says
 * so in place rather than vanishing, because a dashboard that silently drops
 * what it cannot check is worse than one that admits it.
 */

import { STATUS } from "./lib.mjs";
import * as site from "./site.mjs";
import * as cloudflare from "./cloudflare.mjs";
import * as github from "./github.mjs";
import * as google from "./google.mjs";
import * as clarity from "./clarity.mjs";
import * as bing from "./bing.mjs";

const ESC = String.fromCharCode(27);
const c = (code, text) => `${ESC}[${code}m${text}${ESC}[0m`;
const MARK = {
  [STATUS.ok]: c(32, "●"),
  [STATUS.unconfigured]: c(90, "○"),
  [STATUS.denied]: c(31, "●"),
  [STATUS.error]: c(33, "●"),
};

/** Runs one service's checks, surviving a service that throws. */
async function run(service) {
  try {
    return await service.check();
  } catch (error) {
    return [{ name: "", status: STATUS.error, detail: error.message }];
  }
}

const [siteRows, cfRows, ghRows, googleRows, clarityRows, bingRows] = await Promise.all([
  run(site), run(cloudflare), run(github), run(google), run(clarity), run(bing),
]);

/** First row whose name contains all the given fragments. */
const pick = (rows, ...parts) =>
  rows.find((r) => parts.every((p) => r.name.toLowerCase().includes(p.toLowerCase())));

/** Collapses a service's rows into one verdict for its dashboard line. */
function summarise(rows, label, whenMissing) {
  if (!rows.length) return { status: STATUS.unconfigured, detail: whenMissing };
  const unconfigured = rows.find((r) => r.status === STATUS.unconfigured);
  if (unconfigured && rows.every((r) => r.status === STATUS.unconfigured)) {
    return { status: STATUS.unconfigured, detail: whenMissing };
  }
  const bad = rows.find((r) => r.status === STATUS.denied || r.status === STATUS.error);
  if (bad) return { status: bad.status, detail: bad.detail };
  return { status: STATUS.ok, detail: rows.find((r) => r.name.includes(label))?.detail ?? rows[0].detail };
}

const deployment = pick(cfRows, "latest deployment") ?? pick(cfRows, "auth");
const commit = pick(ghRows, "latest commit") ?? pick(ghRows, "auth");
const sitemap = pick(siteRows, "sitemap contents");
const robots = pick(siteRows, "robots.txt");
const indexnow = pick(siteRows, "indexnow");
const ga = pick(siteRows, "deployed GA4");

// Google covers two products; the dashboard reports what is actually flowing.
const gaLive = pick(googleRows, "GA4 · realtime") ?? pick(googleRows, "GA4 · Data API");
const gscSitemap = pick(googleRows, "Search Console · sitemaps");

const ROWS = [
  ["Cloudflare deployment", deployment],
  ["GitHub latest commit", commit],
  ["sitemap.xml", sitemap],
  ["robots.txt", robots],
  [
    "Google Analytics",
    gaLive ?? { status: ga?.status ?? STATUS.error, detail: `${ga?.detail ?? "unknown"} — deployed, but GOOGLE_SERVICE_ACCOUNT_JSON unset so no data can be read back` },
  ],
  ["Search Console", gscSitemap ?? summarise(googleRows, "Search Console", "GOOGLE_SERVICE_ACCOUNT_JSON not set")],
  ["Bing Webmaster", summarise(bingRows, "verification", "BING_WEBMASTER_API_KEY not set")],
  ["Microsoft Clarity", summarise(clarityRows, "project", "CLARITY_API_TOKEN not set")],
  ["IndexNow", indexnow],
];

console.log(`\n  ${c(1, "sharancreatedthis.in")}  ${c(90, new Date().toISOString().replace("T", " ").slice(0, 16))}\n`);
for (const [label, row] of ROWS) {
  const status = row?.status ?? STATUS.error;
  console.log(`  ${MARK[status] ?? "?"} ${label.padEnd(23)} ${c(90, row?.detail ?? "no data")}`);
}

const all = ROWS.map(([, r]) => r?.status);
const broken = all.filter((s) => s === STATUS.denied || s === STATUS.error).length;
const waiting = all.filter((s) => s === STATUS.unconfigured).length;
console.log(
  `\n  ${all.filter((s) => s === STATUS.ok).length}/${ROWS.length} healthy` +
    (waiting ? c(90, ` · ${waiting} not set up`) : "") +
    (broken ? c(31, ` · ${broken} need attention`) : ""),
);
console.log(c(90, `  detail: npm run integrations:check\n`));

// Only a genuine fault is worth a non-zero exit — something not yet configured
// is not a failure, and this has to stay usable from a cron job.
process.exit(broken ? 1 : 0);
