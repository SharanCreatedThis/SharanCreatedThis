/**
 * Bing Webmaster Tools.
 *
 * The one API here that can write: SubmitUrl and SubmitUrlBatch push URLs into
 * Bing's crawl queue. Nothing in this repository calls them — IndexNow already
 * covers submission and does it without a per-site key — but the capability
 * comes with the key, which is worth knowing when deciding where to store it.
 *
 * Bing allows a fixed number of manual submissions per day, separate from
 * IndexNow's quota.
 */

import { SITE, STATUS, request, result } from "./lib.mjs";

const API = "https://ssl.bing.com/webmaster/api.svc/json";

export async function check() {
  const key = process.env.BING_WEBMASTER_API_KEY;
  if (!key) {
    return [result("Bing Webmaster · API", STATUS.unconfigured,
      "needs BING_WEBMASTER_API_KEY — Bing Webmaster Tools → Settings → API access → API key")];
  }
  const out = [];

  const sites = await request(`${API}/GetUserSites?apikey=${encodeURIComponent(key)}`);
  if (!sites.ok || sites.json?.ErrorCode) {
    return [result("Bing Webmaster · API", STATUS.denied,
      `${sites.status}: ${sites.json?.Message ?? sites.text.slice(0, 140)}`)];
  }
  const list = sites.json?.d ?? [];
  out.push(result("Bing Webmaster · sites", STATUS.ok,
    list.length ? list.map((s) => s.Url).join(", ") : "authenticated, but no sites on this account"));

  const target = list.find((s) => s.Url?.includes("sharancreatedthis.in"))?.Url ?? SITE;

  const quota = await request(`${API}/GetUrlSubmissionQuota?apikey=${encodeURIComponent(key)}&siteUrl=${encodeURIComponent(target)}`);
  if (quota.ok && quota.json?.d) {
    out.push(result("Bing Webmaster · submission quota", STATUS.ok,
      `${quota.json.d.DailyQuota ?? "?"} per day, ${quota.json.d.MonthlyQuota ?? "?"} per month remaining`));
  }

  const stats = await request(`${API}/GetRankAndTrafficStats?apikey=${encodeURIComponent(key)}&siteUrl=${encodeURIComponent(target)}`);
  const rows = stats.json?.d ?? [];
  out.push(result("Bing Webmaster · traffic", stats.ok ? STATUS.ok : STATUS.error,
    stats.ok
      ? rows.length
        ? `${rows.length} days of data; ${rows.reduce((n, r) => n + (r.Impressions ?? 0), 0)} impressions`
        : "no impressions yet — normal for a newly verified site"
      : `${stats.status}`));

  return out;
}
