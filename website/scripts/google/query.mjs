/**
 * The seven questions worth asking Google from a terminal.
 *
 *   npm run google -- <command>
 *
 * Read-only throughout. Each command prints a table and exits non-zero only
 * when the API itself refused, so these compose into a cron job without
 * further wrapping.
 */

import { GA4, PROPERTY, SITE, explain, ga, gsc, rows, table, token } from "./api.mjs";

const DAYS = Number(process.env.DAYS ?? 28);
const since = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

/** Search Console reports lag by two to three days; asking for today is empty. */
const GSC_RANGE = { startDate: since(DAYS + 3), endDate: since(3) };

const commands = {
  /**
   * Indexing status, per URL.
   *
   * Search Console has no API for the Index Coverage report — the list of every
   * indexed page simply is not exposed. URL Inspection is, one URL at a time,
   * so this walks the sitemap and asks about each. That is the real answer to
   * "which pages are indexed" and it is exact rather than aggregate.
   *
   * Quota is 2000 inspections a day and 600 a minute, which nine URLs will
   * never trouble.
   */
  async indexed() {
    const sitemap = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    console.log(`\nIndexing status · ${urls.length} URLs from the sitemap\n`);

    const out = [];
    for (const url of urls) {
      const response = await gsc("/v1/urlInspection/index:inspect", {
        method: "POST",
        body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY }),
      });
      if (!response.ok) return explain(response, "URL inspection"), process.exit(1);
      const result = response.json.inspectionResult?.indexStatusResult ?? {};
      out.push({
        page: new URL(url).pathname,
        verdict: result.verdict ?? "?",
        coverage: (result.coverageState ?? "").slice(0, 44),
        crawled: result.lastCrawlTime?.slice(0, 10) ?? "never",
        robots: result.robotsTxtState ?? "?",
      });
    }
    table(out);
    const indexed = out.filter((r) => r.verdict === "PASS").length;
    console.log(`\n  ${indexed}/${out.length} indexed. "never" crawled means Google has not reached it yet.\n`);
  },

  /** Sitemap status, including the field that answers "Couldn't fetch". */
  async sitemaps() {
    const response = await gsc(`/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/sitemaps`);
    if (!response.ok) return explain(response, "Sitemaps"), process.exit(1);
    const list = response.json.sitemap ?? [];
    console.log(`\nSitemaps · ${PROPERTY}\n`);
    if (!list.length) {
      console.log("  None submitted to this property.\n");
      return;
    }
    table(list.map((s) => ({
      sitemap: s.path.replace(SITE, ""),
      submitted: s.lastSubmitted?.slice(0, 10) ?? "-",
      // The one that matters: never downloaded is exactly what the UI calls
      // "Couldn't fetch", and it distinguishes "not yet tried" from "failed".
      downloaded: s.lastDownloaded?.slice(0, 10) ?? "NEVER",
      urls: s.contents?.[0]?.submitted ?? 0,
      errors: s.errors ?? 0,
      warnings: s.warnings ?? 0,
      pending: s.isPending ? "yes" : "no",
    })));
    const never = list.filter((s) => !s.lastDownloaded);
    console.log(never.length
      ? `\n  ${never.length} never downloaded — Google has not fetched it yet. Re-submit in Search Console to force a retry.\n`
      : `\n  All fetched.\n`);
  },

  /**
   * Crawl problems.
   *
   * The old Crawl Errors API was withdrawn and nothing replaced it wholesale,
   * so this is assembled from what is still exposed: sitemap-level errors, and
   * the per-URL verdicts that are not PASS.
   */
  async errors() {
    console.log(`\nCrawl problems · ${PROPERTY}\n`);
    const sitemaps = await gsc(`/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/sitemaps`);
    if (sitemaps.ok) {
      const bad = (sitemaps.json.sitemap ?? []).filter((s) => s.errors > 0 || s.warnings > 0);
      console.log(bad.length ? "  Sitemap-level:" : "  Sitemap-level: none");
      for (const s of bad) console.log(`    ${s.path}  ${s.errors} errors, ${s.warnings} warnings`);
    }

    const sitemap = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const problems = [];
    for (const url of urls) {
      const response = await gsc("/v1/urlInspection/index:inspect", {
        method: "POST",
        body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY }),
      });
      if (!response.ok) return explain(response, "URL inspection"), process.exit(1);
      const r = response.json.inspectionResult ?? {};
      const index = r.indexStatusResult ?? {};
      if (index.verdict !== "PASS") {
        problems.push({
          page: new URL(url).pathname,
          verdict: index.verdict ?? "?",
          reason: (index.coverageState ?? "").slice(0, 50),
          robots: index.robotsTxtState ?? "?",
        });
      }
      for (const [name, section] of [["mobile", r.mobileUsabilityResult], ["rich results", r.richResultsResult]]) {
        if (section && section.verdict && section.verdict !== "PASS") {
          problems.push({ page: new URL(url).pathname, verdict: section.verdict, reason: `${name} issue`, robots: "" });
        }
      }
    }
    console.log(`\n  Per-URL:`);
    problems.length ? table(problems) : console.log("    none — every sitemap URL passes\n");
  },

  /** Which pages earn impressions and clicks. */
  async pages() {
    const response = await gsc(`/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`, {
      method: "POST",
      body: JSON.stringify({ ...GSC_RANGE, dimensions: ["page"], rowLimit: 25 }),
    });
    if (!response.ok) return explain(response, "Search analytics"), process.exit(1);
    console.log(`\nPage performance · ${GSC_RANGE.startDate} to ${GSC_RANGE.endDate}\n`);
    const data = (response.json.rows ?? []).map((r) => ({
      page: new URL(r.keys[0]).pathname,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: `${(r.ctr * 100).toFixed(1)}%`,
      position: r.position.toFixed(1),
    }));
    data.length ? table(data) : console.log("  No impressions yet. Normal for a site indexed this recently.\n");
  },

  /** What people typed before they arrived. */
  async queries() {
    const response = await gsc(`/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`, {
      method: "POST",
      body: JSON.stringify({ ...GSC_RANGE, dimensions: ["query"], rowLimit: 25 }),
    });
    if (!response.ok) return explain(response, "Search analytics"), process.exit(1);
    console.log(`\nSearch queries · ${GSC_RANGE.startDate} to ${GSC_RANGE.endDate}\n`);
    const data = (response.json.rows ?? []).map((r) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: `${(r.ctr * 100).toFixed(1)}%`,
      position: r.position.toFixed(1),
    }));
    data.length ? table(data) : console.log("  No queries yet.\n");
  },

  /**
   * Where people are, from both sources, because they answer different things.
   *
   * Search Console says which countries *see* the site in results — demand that
   * has not converted yet. GA4 says which countries actually arrived, by any
   * route. A country high in one and absent from the other is the interesting
   * case: impressions without visits means the listing is being passed over.
   *
   * Search Console reports ISO-3166 alpha-3 codes; GA4 reports names. They are
   * printed as each returns them rather than being mapped, because a mapping
   * that silently mislabels a country is worse than two columns that need
   * reading side by side.
   */
  async countries() {
    const search = await gsc(`/webmasters/v3/sites/${encodeURIComponent(PROPERTY)}/searchAnalytics/query`, {
      method: "POST",
      body: JSON.stringify({ ...GSC_RANGE, dimensions: ["country"], rowLimit: 15 }),
    });
    console.log(`\nSearch impressions by country · ${GSC_RANGE.startDate} to ${GSC_RANGE.endDate}\n`);
    if (!search.ok) {
      explain(search, "Search analytics");
    } else {
      const data = (search.json.rows ?? []).map((r) => ({
        country: r.keys[0].toUpperCase(),
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: `${(r.ctr * 100).toFixed(1)}%`,
        position: r.position.toFixed(1),
      }));
      data.length ? table(data) : console.log("  No impressions yet.\n");
    }

    if (!GA4) {
      console.log(`\nVisitors by country: GA4_PROPERTY_ID is not set.\n`);
      return;
    }
    const visitors = await ga("runReport", {
      dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 15,
    });
    console.log(`\nVisitors by country · last ${DAYS} days\n`);
    if (!visitors.ok) return explain(visitors, "GA4 countries"), process.exit(1);
    const rowsOut = rows(visitors.json).map((r) => ({
      country: r.country,
      users: r.activeUsers,
      sessions: r.sessions,
      views: r.screenPageViews,
    }));
    rowsOut.length
      ? table(rowsOut)
      : console.log("  No visitors recorded yet in this window.\n");
  },

  /** Who is on the site right now. */
  async realtime() {
    const response = await ga("runRealtimeReport", {
      dimensions: [{ name: "unifiedScreenName" }],
      metrics: [{ name: "activeUsers" }],
    });
    if (!response.ok) return explain(response, "GA4 realtime"), process.exit(1);
    const data = rows(response.json);
    console.log(`\nRealtime · property ${GA4}\n`);
    data.length
      ? table(data)
      : console.log("  Nobody on the site right now. Open it in a browser and run this again.\n");
    const total = data.reduce((n, r) => n + r.activeUsers, 0);
    if (data.length) console.log(`\n  ${total} active user(s).\n`);
  },

  /** Downloads, broken down the way the tracking sends them. */
  async downloads() {
    const response = await ga("runReport", {
      dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "today" }],
      dimensions: [
        { name: "eventName" },
        { name: "customEvent:download_platform" },
        { name: "customEvent:download_source" },
      ],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: ["download", "download_intent"] },
        },
      },
      limit: 50,
    });
    if (!response.ok) {
      // The usual cause is the custom dimensions not being registered, which
      // makes the parameters unqueryable rather than merely empty.
      if (/customEvent/.test(response.json?.error?.message ?? "")) {
        console.error("\nGA4 rejected the custom dimensions.");
        console.error("  `download_platform` and `download_source` must be registered first:");
        console.error("  GA4 → Admin → Custom definitions → Create custom dimension, scope Event.");
        console.error("  Registration is not retroactive, so do it before the data you want arrives.\n");
        return process.exit(1);
      }
      return explain(response, "GA4 downloads"), process.exit(1);
    }
    console.log(`\nDownload events · last ${DAYS} days · property ${GA4}\n`);
    const data = rows(response.json).map((r) => ({
      event: r.eventName,
      platform: r["customEvent:download_platform"] === "(not set)" ? "-" : r["customEvent:download_platform"],
      source: r["customEvent:download_source"] === "(not set)" ? "-" : r["customEvent:download_source"],
      count: r.eventCount,
    }));
    data.length
      ? table(data)
      : console.log("  No download events yet. They take 24-48h to reach standard reports; realtime shows them sooner.\n");
  },

  /** Everything at once, for a morning look. */
  async all() {
    for (const name of ["sitemaps", "indexed", "pages", "queries", "countries", "downloads", "realtime"]) {
      try {
        await commands[name]();
      } catch (error) {
        console.error(`  ${name} failed: ${error.message}`);
      }
    }
  },
};

const name = process.argv[2];
if (!name || !commands[name]) {
  console.log(`\nUsage: npm run google -- <command>\n`);
  console.log(`  indexed    which sitemap URLs Google has actually indexed`);
  console.log(`  sitemaps   submission and last-fetch status`);
  console.log(`  errors     crawl problems, per sitemap and per URL`);
  console.log(`  pages      clicks and impressions by page`);
  console.log(`  queries    what people searched for`);
  console.log(`  countries  impressions and visitors by country, from both sources`);
  console.log(`  realtime   who is on the site now`);
  console.log(`  downloads  download and download_intent events`);
  console.log(`  all        every one of the above\n`);
  console.log(`  DAYS=90 npm run google -- queries    to widen the window\n`);
  process.exit(name ? 1 : 0);
}
const { serviceAccount } = await token();
console.log(`authenticated as ${serviceAccount}`);
await commands[name]();
