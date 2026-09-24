/**
 * Bing Webmaster Tools, from the terminal.
 *
 *   npm run bing -- <command>
 *
 * Bing matters more than its market share suggests: it feeds DuckDuckGo,
 * Ecosia, Yahoo and a share of what several AI assistants answer with, and it
 * has far less competition than Google for the same query.
 *
 * Every command here reads. `submit` is the one exception and it asks first,
 * because the key is write-capable and a submission cannot be taken back.
 */

import { STATUS, request, result } from "../integrations/lib.mjs";
import "../load-env.mjs";

const API = "https://ssl.bing.com/webmaster/api.svc/json";
const SITE = "https://www.sharancreatedthis.in";

const key = process.env.BING_WEBMASTER_API_KEY;
if (!key) {
  console.error("\nBING_WEBMASTER_API_KEY is not set in website/.env.local");
  console.error("  Bing Webmaster Tools → Settings → API access → API key\n");
  process.exit(2);
}

/**
 * Bing answers 200 with an error object in the body as often as it uses a
 * status code, so both are checked. Retries cover its habit of timing out
 * under load rather than refusing cleanly.
 */
async function call(method, params = {}) {
  const query = new URLSearchParams({ apikey: key, ...params });
  const response = await request(`${API}/${method}?${query}`, { timeoutMs: 30_000, retries: 2 });
  if (!response.ok) {
    return { ok: false, error: `HTTP ${response.status}: ${response.text.slice(0, 160)}` };
  }
  if (response.json?.ErrorCode) {
    return { ok: false, error: `${response.json.ErrorCode}: ${response.json.Message ?? ""}` };
  }
  return { ok: true, data: response.json?.d };
}

function table(rows, columns) {
  if (!rows?.length) return console.log("  (no rows)");
  const keys = columns ?? Object.keys(rows[0]);
  const width = Object.fromEntries(keys.map((k) => [k, Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length))]));
  console.log("  " + keys.map((k) => k.padEnd(width[k])).join("  "));
  console.log("  " + keys.map((k) => "-".repeat(width[k])).join("  "));
  for (const row of rows) console.log("  " + keys.map((k) => String(row[k] ?? "").padEnd(width[k])).join("  "));
}

/** Bing returns dates as /Date(1234567890000)/ rather than ISO. */
const date = (v) => {
  const ms = /\/Date\((\d+)/.exec(String(v ?? ""))?.[1];
  return ms ? new Date(Number(ms)).toISOString().slice(0, 10) : "-";
};

async function site() {
  const sites = await call("GetUserSites");
  if (!sites.ok) throw new Error(sites.error);
  const match = (sites.data ?? []).find((s) => s.Url?.includes("sharancreatedthis.in"));
  return { list: sites.data ?? [], url: match?.Url ?? SITE, verified: Boolean(match) };
}

const commands = {
  /** Is the site verified, and what is the submission allowance. */
  async verify() {
    const { list, url, verified } = await site();
    console.log(`\nBing Webmaster · verification\n`);
    console.log(`  ${verified ? "✓" : "✗"} sharancreatedthis.in ${verified ? `verified as ${url}` : "NOT verified on this account"}`);
    console.log(`  sites on this account: ${list.length ? list.map((s) => s.Url).join(", ") : "none"}`);
    if (!verified) {
      console.log(`\n  The API only lists verified sites, so absence here is the answer.`);
      console.log(`  Add it at https://www.bing.com/webmasters — importing from Search`);
      console.log(`  Console carries the DNS verification across without a new tag.\n`);
      return;
    }
    const quota = await call("GetUrlSubmissionQuota", { siteUrl: url });
    if (quota.ok && quota.data) {
      console.log(`  manual submission quota: ${quota.data.DailyQuota ?? "?"}/day, ${quota.data.MonthlyQuota ?? "?"}/month remaining`);
      console.log(`    (separate from IndexNow, which this site uses and which has its own allowance)`);
    }
    console.log();
  },

  /** What Bing has done with the sitemap. */
  async sitemaps() {
    const { url } = await site();
    const feeds = await call("GetFeeds", { siteUrl: url });
    console.log(`\nBing · sitemaps\n`);
    if (!feeds.ok) return console.log(`  ${feeds.error}\n`);
    const rows = (feeds.data ?? []).map((f) => ({
      sitemap: String(f.Url ?? "").replace(SITE, ""),
      submitted: date(f.Submitted),
      "last crawled": date(f.LastCrawled),
      urls: f.UrlsTotal ?? 0,
      indexed: f.UrlsIndexed ?? 0,
      status: f.Status ?? "-",
    }));
    rows.length ? table(rows) : console.log("  None submitted. Bing picks it up from robots.txt, but submitting is faster.");
    console.log();
  },

  /** Impressions and clicks, which is the point of verifying at all. */
  async traffic() {
    const { url } = await site();
    const stats = await call("GetRankAndTrafficStats", { siteUrl: url });
    console.log(`\nBing · traffic\n`);
    if (!stats.ok) return console.log(`  ${stats.error}\n`);
    const rows = (stats.data ?? []).slice(-14).map((d) => ({
      date: date(d.Date),
      impressions: d.Impressions ?? 0,
      clicks: d.Clicks ?? 0,
    }));
    if (!rows.length) {
      console.log("  No data yet. Normal for a site verified this recently — Bing");
      console.log("  reports nothing until it has crawled and served the site.\n");
      return;
    }
    table(rows);
    const impressions = rows.reduce((n, r) => n + r.impressions, 0);
    const clicks = rows.reduce((n, r) => n + r.clicks, 0);
    console.log(`\n  ${impressions} impressions, ${clicks} clicks over ${rows.length} days\n`);
  },

  /** The queries Bing thinks this site answers. */
  async keywords() {
    const { url } = await site();
    const stats = await call("GetQueryStats", { siteUrl: url });
    console.log(`\nBing · query performance\n`);
    if (!stats.ok) return console.log(`  ${stats.error}\n`);
    const rows = (stats.data ?? []).slice(0, 25).map((q) => ({
      query: String(q.Query ?? "").slice(0, 44),
      impressions: q.Impressions ?? 0,
      clicks: q.Clicks ?? 0,
      position: q.AvgImpressionPosition ?? "-",
    }));
    rows.length ? table(rows) : console.log("  No queries recorded yet.");
    console.log();
  },

  /** Anything Bing could not fetch. */
  async crawl() {
    const { url } = await site();
    console.log(`\nBing · crawl\n`);
    const issues = await call("GetCrawlIssues", { siteUrl: url });
    if (issues.ok) {
      const rows = (issues.data ?? []).slice(0, 25).map((i) => ({
        url: String(i.Url ?? "").replace(SITE, "").slice(0, 46),
        issue: i.Issues ?? "-",
        code: i.HttpCode ?? "-",
      }));
      rows.length ? table(rows) : console.log("  No crawl issues reported.");
    } else {
      console.log(`  crawl issues: ${issues.error}`);
    }
    const stats = await call("GetCrawlStats", { siteUrl: url });
    if (stats.ok && (stats.data ?? []).length) {
      const recent = stats.data.slice(-7);
      console.log(`\n  Recent crawl activity\n`);
      table(recent.map((d) => ({
        date: date(d.Date),
        crawled: d.CrawledPages ?? 0,
        "in index": d.InIndex ?? 0,
        "2xx": d.CrawlErrors === undefined ? "-" : (d.CrawledPages ?? 0) - (d.CrawlErrors ?? 0),
        errors: d.CrawlErrors ?? 0,
      })));
    }
    console.log();
  },

  /** Which of the site's URLs Bing has indexed. */
  async indexed() {
    const { url } = await site();
    const links = await call("GetUrlInfo", { siteUrl: url, url });
    console.log(`\nBing · index status for ${url}\n`);
    if (!links.ok) return console.log(`  ${links.error}\n`);
    const d = links.data ?? {};
    console.log(`  discovered   ${date(d.DiscoveryDate)}`);
    console.log(`  last crawled ${date(d.LastCrawledDate)}`);
    console.log(`  document id  ${d.DocumentId ?? "-"}`);
    console.log(`  in index     ${d.TotalChildUrlCount !== undefined ? "yes" : "unknown"}\n`);
  },

  /** Everything readable, for a morning look. */
  async all() {
    for (const name of ["verify", "sitemaps", "crawl", "traffic", "keywords"]) {
      try {
        await commands[name]();
      } catch (error) {
        console.log(`  ${name} failed: ${error.message}\n`);
      }
    }
  },
};

const name = process.argv[2];
if (!name || !commands[name]) {
  console.log(`\nUsage: npm run bing -- <command>\n`);
  console.log(`  verify     is the site verified, and the submission allowance`);
  console.log(`  sitemaps   what Bing has done with the sitemap`);
  console.log(`  traffic    impressions and clicks by day`);
  console.log(`  keywords   the queries Bing thinks this site answers`);
  console.log(`  crawl      crawl issues and recent crawl activity`);
  console.log(`  indexed    index status for the site root`);
  console.log(`  all        every one of the above\n`);
  process.exit(name ? 1 : 0);
}

try {
  await commands[name]();
} catch (error) {
  console.error(`\nBing request failed: ${error.message}`);
  console.error(`  Check BING_WEBMASTER_API_KEY in website/.env.local.\n`);
  process.exit(1);
}
