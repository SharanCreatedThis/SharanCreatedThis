/**
 * Authenticated calls to Search Console and the GA4 Data API.
 *
 * Everything here is read-only. The service account is granted the two
 * `.readonly` scopes and nothing else, so no command in this directory can
 * change a property, a sitemap or a report even by mistake.
 */

import { googleAccessToken, request } from "../integrations/lib.mjs";

/**
 * Two scopes covering three APIs, both read-only.
 *
 *   webmasters.readonly  -> Search Console API (sites, sitemaps, search
 *                           analytics, URL Inspection)
 *   analytics.readonly   -> BOTH the GA4 Data API (reports, realtime) and the
 *                           GA4 Admin API's read methods. The Admin API needs
 *                           no scope of its own for reads, which is why there
 *                           is no third entry here.
 *
 * The writable siblings — `webmasters` without the suffix, and
 * `analytics.edit` — are deliberately absent. Search Console's writable scope
 * would allow submitting and deleting sitemaps; `analytics.edit` would allow
 * reshaping your reporting. Nothing here needs either, and a credential that
 * cannot write is a credential that cannot be turned against you.
 */
export const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

export const SITE = "https://www.sharancreatedthis.in";
export const PROPERTY = process.env.GSC_SITE_URL ?? "sc-domain:sharancreatedthis.in";
export const GA4 = process.env.GA4_PROPERTY_ID;

let cached = null;

/**
 * One token per run, reused across commands.
 *
 * Exits with an explanation rather than a stack trace: the usual reason for
 * failing here is a setup step that has not been done yet, and a stack trace
 * says nothing about which one.
 */
export async function token() {
  if (cached) return cached;
  const { token: value, reason, serviceAccount } = await googleAccessToken(SCOPES);
  if (!value) {
    console.error(`\nCannot authenticate: ${reason}`);
    console.error(`Walkthrough: docs/google-service-account.md`);
    console.error(`Diagnose:    npm run google:doctor\n`);
    process.exit(2);
  }
  cached = { value, serviceAccount };
  return cached;
}

export async function gsc(path, options = {}) {
  const { value } = await token();
  return request(`https://searchconsole.googleapis.com${path}`, {
    ...options,
    headers: { authorization: `Bearer ${value}`, "content-type": "application/json", ...options.headers },
  });
}

/**
 * One URL Inspection call, with the timeout and retries that endpoint needs.
 *
 * Measured against this property: a mean of 8.6 seconds per call and a p99 past
 * twenty. The shared default of twenty seconds was therefore not a safety net
 * but a coin toss — `/about` aborted at 20006ms and took the whole command with
 * it. Inspection is slow because it is not a cache read: Google resolves the
 * URL's current index state per request.
 *
 * Sixty seconds and two retries. Slower than everything else here and
 * deliberately so.
 */
export function inspect(url) {
  return gsc("/v1/urlInspection/index:inspect", {
    method: "POST",
    body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY }),
    timeoutMs: 60_000,
    retries: 2,
    onRetry: ({ attempt, of, status, waitMs }) =>
      console.log(`    retry ${attempt}/${of} after ${status === 0 ? "timeout" : status} \u2014 waiting ${waitMs}ms`),
  });
}

/**
 * Runs a job over each item with a bounded number in flight.
 *
 * Nine inspections in series took 78 seconds, which is long enough that a
 * person stops watching and a CI step looks hung. Google's quota is 600 a
 * minute against 2000 a day, so the daily allowance binds long before the rate
 * does and there is room to run several at once. Four is deliberately modest:
 * the aim is to stop the command feeling broken, not to race the quota.
 */
export async function mapLimit(items, limit, job) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await job(items[i], i);
      }
    }),
  );
  return results;
}

export async function ga(method, body) {
  if (!GA4) {
    console.error("\nGA4_PROPERTY_ID is not set — the numeric id from GA4 → Admin → Property details.");
    console.error("It is not the G-XXXXXXXX measurement id.\n");
    process.exit(2);
  }
  const { value } = await token();
  return request(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4}:${method}`, {
    method: "POST",
    headers: { authorization: `Bearer ${value}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Turns a GA4 report into plain rows, because its shape is nested and dull. */
export function rows(report) {
  const dimensions = (report?.dimensionHeaders ?? []).map((h) => h.name);
  const metrics = (report?.metricHeaders ?? []).map((h) => h.name);
  return (report?.rows ?? []).map((row) => {
    const out = {};
    dimensions.forEach((name, i) => (out[name] = row.dimensionValues[i].value));
    metrics.forEach((name, i) => (out[name] = Number(row.metricValues[i].value)));
    return out;
  });
}

/** A small table, so output is readable without piping through anything. */
export function table(data, columns) {
  if (!data.length) return console.log("  (no rows)");
  const keys = columns ?? Object.keys(data[0]);
  const width = Object.fromEntries(
    keys.map((k) => [k, Math.max(k.length, ...data.map((r) => String(r[k] ?? "").length))]),
  );
  console.log("  " + keys.map((k) => k.padEnd(width[k])).join("  "));
  console.log("  " + keys.map((k) => "-".repeat(width[k])).join("  "));
  for (const row of data) {
    console.log("  " + keys.map((k) => String(row[k] ?? "").padEnd(width[k])).join("  "));
  }
}

/** Explains a Google error in terms of the setup step that is missing. */
export function explain(response, what) {
  const message = response.json?.error?.message ?? response.text?.slice(0, 200) ?? "";
  const status = response.status;
  console.error(`\n${what} failed (${status}): ${message}\n`);
  if (status === 403 && /has not been used|disabled/i.test(message)) {
    console.error("  The API is not enabled on this Google Cloud project.");
    console.error("  Fix: APIs & Services → Library → enable it, then wait a minute.");
  } else if (status === 403) {
    console.error("  Authenticated, but not authorised for this property.");
    console.error("  Fix: share the property with the service account's email address.");
    console.error("       Search Console → Settings → Users and permissions");
    console.error("       GA4 → Admin → Property access management (role: Viewer)");
  } else if (status === 404) {
    console.error("  The property id or site URL does not exist, or is not visible to this account.");
    console.error("  Check GSC_SITE_URL and GA4_PROPERTY_ID in .env.local.");
  }
  console.error("");
}
