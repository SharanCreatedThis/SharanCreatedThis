/**
 * Microsoft Clarity, from the terminal.
 *
 *   npm run clarity -- <command>
 *
 * Know the shape of this API before relying on it. Clarity's Data Export
 * returns *aggregates only* — sessions, pages, browsers, devices, and the
 * counts behind its frustration signals. It does not return recordings or
 * heatmap images, and no API does: those live in the dashboard and that is a
 * product decision rather than a gap to work around.
 *
 * It is also rate limited to a small number of requests per project per day,
 * which makes this a reporting tool rather than something to poll. Every
 * command below is one request; `all` re-slices that single response instead
 * of making five.
 */

import { request } from "../integrations/lib.mjs";
import "../load-env.mjs";

const token = process.env.CLARITY_API_TOKEN;
const project = process.env.NEXT_PUBLIC_CLARITY_ID;

if (!token) {
  console.error("\nCLARITY_API_TOKEN is not set in website/.env.local");
  console.error("  Clarity → Settings → Data export → Generate new API token");
  console.error("  The token is scoped to one project; generate it against the right one.\n");
  process.exit(2);
}

const DAYS = Math.min(Number(process.env.DAYS ?? 3), 3);

/**
 * Clarity allows at most three days per request and only a handful of requests
 * per day, so the window is clamped rather than silently truncated by the API.
 */
async function fetchInsights(dimension) {
  const query = new URLSearchParams({ numOfDays: String(DAYS) });
  if (dimension) query.set("dimension1", dimension);
  const response = await request(
    `https://www.clarity.ms/export-data/api/v1/project-live-insights?${query}`,
    { headers: { authorization: `Bearer ${token}` }, timeoutMs: 30_000, retries: 2 },
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(`token rejected (${response.status}) — tokens are per project; check it was generated for ${project ?? "this project"}`);
  }
  if (response.status === 429) {
    throw new Error("rate limited — Clarity allows only a few exports per project per day. Try tomorrow.");
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.text.slice(0, 160)}`);
  return Array.isArray(response.json) ? response.json : [];
}

function table(rows, columns) {
  if (!rows?.length) return console.log("  (no rows)");
  const keys = columns ?? Object.keys(rows[0]);
  const width = Object.fromEntries(keys.map((k) => [k, Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length))]));
  console.log("  " + keys.map((k) => k.padEnd(width[k])).join("  "));
  console.log("  " + keys.map((k) => "-".repeat(width[k])).join("  "));
  for (const row of rows) console.log("  " + keys.map((k) => String(row[k] ?? "").padEnd(width[k])).join("  "));
}

const metric = (sets, name) => sets.find((s) => s.metricName === name)?.information ?? [];
const num = (v) => Number(v ?? 0);

const commands = {
  /** Does the token work, and which project does it belong to. */
  async verify() {
    const sets = await fetchInsights();
    console.log(`\nClarity · project ${project ?? "(NEXT_PUBLIC_CLARITY_ID not set locally)"}\n`);
    console.log(`  ✓ token accepted`);
    console.log(`  metric sets returned: ${sets.length ? sets.map((s) => s.metricName).join(", ") : "none"}`);
    const traffic = metric(sets, "Traffic")[0];
    if (traffic) {
      console.log(`  sessions (${DAYS}d): ${traffic.totalSessionCount ?? "?"}`);
      console.log(`  users    (${DAYS}d): ${traffic.distantUserCount ?? traffic.totalUserCount ?? "?"}`);
    }
    console.log(`\n  Recordings and heatmaps are dashboard-only — no API returns them.\n`);
  },

  /** Sessions, users and bot share. */
  async traffic() {
    const sets = await fetchInsights();
    const t = metric(sets, "Traffic")[0] ?? {};
    console.log(`\nClarity · traffic · last ${DAYS} days\n`);
    console.log(`  sessions        ${t.totalSessionCount ?? "-"}`);
    console.log(`  users           ${t.distantUserCount ?? t.totalUserCount ?? "-"}`);
    console.log(`  bot sessions    ${t.totalBotSessionCount ?? "-"}`);
    console.log(`  pages per session ${t.pagesPerSessionPercentage ?? "-"}`);
    const bots = num(t.totalBotSessionCount);
    const all = num(t.totalSessionCount);
    if (all && bots / all > 0.3) {
      console.log(`\n  ${((bots / all) * 100).toFixed(0)}% of sessions are bots. Worth knowing before reading any other number.`);
    }
    console.log();
  },

  /** Which pages people actually land on. */
  async pages() {
    const sets = await fetchInsights("URL");
    console.log(`\nClarity · popular pages · last ${DAYS} days\n`);
    const rows = metric(sets, "Traffic")
      .filter((r) => r.Url)
      .slice(0, 20)
      .map((r) => ({
        page: String(r.Url).replace(/^https?:\/\/[^/]+/, "") || "/",
        sessions: r.totalSessionCount ?? 0,
        users: r.distantUserCount ?? r.totalUserCount ?? 0,
      }));
    rows.length ? table(rows) : console.log("  No page data in this window.");
    console.log();
  },

  /** Browsers, devices and operating systems. */
  async devices() {
    for (const [dimension, label] of [["Browser", "browsers"], ["Device", "devices"], ["OS", "operating systems"]]) {
      const sets = await fetchInsights(dimension);
      console.log(`\nClarity · ${label} · last ${DAYS} days\n`);
      const rows = metric(sets, "Traffic")
        .filter((r) => r[dimension])
        .slice(0, 12)
        .map((r) => ({ [label.replace(/s$/, "")]: r[dimension], sessions: r.totalSessionCount ?? 0 }));
      rows.length ? table(rows) : console.log("  (no data)");
    }
    console.log();
  },

  /**
   * The signals worth acting on: where people rage-click, dead-click, or leave.
   *
   * These are what Clarity is for. A high dead-click count on a page means
   * something looks interactive and is not, which is a bug the analytics will
   * never show you.
   */
  async frustration() {
    const sets = await fetchInsights();
    console.log(`\nClarity · frustration signals · last ${DAYS} days\n`);
    const rows = [];
    for (const name of ["DeadClickCount", "RageClickCount", "ExcessiveScroll", "QuickbackClick", "ScriptErrorCount", "ErrorClickCount"]) {
      const info = metric(sets, name)[0];
      if (info) {
        rows.push({
          signal: name.replace(/Count$/, ""),
          sessions: info.sessionsCount ?? info.subTotal ?? "-",
          "% of sessions": info.sessionsWithMetricPercentage ?? "-",
        });
      }
    }
    rows.length ? table(rows) : console.log("  No frustration metrics returned for this window.");
    console.log(`\n  Dead clicks are the actionable one: something looks clickable and is not.\n`);
  },

  /** Everything, from one request per dimension. */
  async all() {
    for (const name of ["verify", "traffic", "pages", "frustration"]) {
      try {
        await commands[name]();
      } catch (error) {
        console.log(`  ${name}: ${error.message}\n`);
        if (/rate limited/.test(error.message)) break;
      }
    }
  },
};

const name = process.argv[2];
if (!name || !commands[name]) {
  console.log(`\nUsage: npm run clarity -- <command>\n`);
  console.log(`  verify       token works, and which project it belongs to`);
  console.log(`  traffic      sessions, users, bot share`);
  console.log(`  pages        which pages people land on`);
  console.log(`  devices      browsers, devices, operating systems`);
  console.log(`  frustration  dead clicks, rage clicks, script errors`);
  console.log(`  all          every one of the above\n`);
  console.log(`  Clarity caps the window at 3 days and allows few requests per day.\n`);
  process.exit(name ? 1 : 0);
}

try {
  await commands[name]();
} catch (error) {
  console.error(`\nClarity request failed: ${error.message}\n`);
  process.exit(1);
}
