/**
 * Search Console and GA4, both through one Google service account.
 *
 * One credential covers both because the scopes are additive and the grant is
 * made separately in each product's own UI — the account has to be added as a
 * user in Search Console and again in GA4. That is a feature: the key on this
 * machine can read nothing until someone deliberately shares a property with
 * it, and revoking is done per product without touching the key.
 *
 * Both scopes are the readonly ones. Search Console's API can submit sitemaps
 * and GA4's cannot write at all, but nothing here needs to write, and a
 * credential that cannot is a credential that cannot be misused.
 */

import { GSC_PROPERTY, SITE, STATUS, googleAccessToken, request, result } from "./lib.mjs";

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

export async function check() {
  const out = [];
  const { token, reason, serviceAccount } = await googleAccessToken(SCOPES);

  if (!token) {
    out.push(result("Google · service account", reason?.includes("not set") ? STATUS.unconfigured : STATUS.denied, reason));
    return out;
  }
  out.push(result("Google · service account", STATUS.ok, serviceAccount));
  const auth = { authorization: `Bearer ${token}` };

  // ── Search Console ────────────────────────────────────────────────────
  const sites = await request("https://searchconsole.googleapis.com/webmasters/v3/sites", { headers: auth });
  const entries = sites.json?.siteEntry ?? [];
  if (!sites.ok) {
    out.push(result("Search Console · access", STATUS.denied,
      `${sites.status}: ${sites.json?.error?.message ?? "is the Search Console API enabled?"}`));
  } else if (!entries.length) {
    out.push(result("Search Console · access", STATUS.denied,
      `no properties shared with ${serviceAccount} — add it as a user in Search Console → Settings → Users and permissions`));
  } else {
    out.push(result("Search Console · access", STATUS.ok,
      entries.map((e) => `${e.siteUrl} (${e.permissionLevel})`).join(", ")));

    const property = encodeURIComponent(GSC_PROPERTY);

    const sitemaps = await request(`https://searchconsole.googleapis.com/webmasters/v3/sites/${property}/sitemaps`, { headers: auth });
    const list = sitemaps.json?.sitemap ?? [];
    const ours = list.find((s) => s.path?.endsWith("/sitemap.xml"));
    out.push(
      !sitemaps.ok
        ? result("Search Console · sitemaps", STATUS.denied, `${sitemaps.status} for ${GSC_PROPERTY}`)
        : !ours
          ? result("Search Console · sitemaps", STATUS.error, "sitemap.xml is not submitted to this property")
          : result("Search Console · sitemaps",
              ours.errors > 0 || ours.isPending ? STATUS.error : STATUS.ok,
              `submitted ${ours.lastSubmitted?.slice(0, 10) ?? "?"}, last downloaded ${ours.lastDownloaded?.slice(0, 10) ?? "never"}, ` +
                `${ours.contents?.[0]?.submitted ?? 0} URLs, ${ours.errors ?? 0} errors, ${ours.warnings ?? 0} warnings` +
                (ours.lastDownloaded ? "" : "  ← never fetched, which is what 'Couldn't fetch' means")),
    );

    const performance = await request(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${property}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { ...auth, "content-type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
          dimensions: ["page"],
          rowLimit: 10,
        }),
      },
    );
    const rows = performance.json?.rows ?? [];
    out.push(result("Search Console · performance", performance.ok ? STATUS.ok : STATUS.denied,
      performance.ok
        ? rows.length
          ? `${rows.length} pages with impressions in 28 days; ${rows.reduce((n, r) => n + r.clicks, 0)} clicks`
          : "no impressions yet — expected on a site this newly indexed"
        : `${performance.status}: ${performance.json?.error?.message ?? ""}`));
  }

  // ── GA4 ───────────────────────────────────────────────────────────────
  const property = process.env.GA4_PROPERTY_ID;
  if (!property) {
    out.push(result("GA4 · Data API", STATUS.unconfigured,
      "needs GA4_PROPERTY_ID — the numeric id in GA4 → Admin → Property details, not the G- measurement id"));
    return out;
  }

  const report = await request(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      limit: 20,
    }),
  });
  if (!report.ok) {
    out.push(result("GA4 · Data API", STATUS.denied,
      `${report.status}: ${report.json?.error?.message ?? "is the Analytics Data API enabled, and the service account added as a Viewer in GA4 → Admin → Property access management?"}`));
  } else {
    const events = (report.json.rows ?? []).map((r) => `${r.dimensionValues[0].value}=${r.metricValues[0].value}`);
    out.push(result("GA4 · Data API", STATUS.ok,
      events.length ? events.join(" ") : "connected, no events in the last 7 days yet"));
  }

  const realtime = await request(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runRealtimeReport`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
  });
  out.push(result("GA4 · realtime", realtime.ok ? STATUS.ok : STATUS.denied,
    realtime.ok
      ? `${realtime.json.rows?.[0]?.metricValues?.[0]?.value ?? 0} active users right now`
      : `${realtime.status}`));

  return out;
}
