/**
 * Tells you which setup step is incomplete, rather than which HTTP code failed.
 *
 * Google returns 403 for at least four unrelated situations: the API is not
 * enabled, the service account was never added to the property, it was added
 * with too little permission, or the project has no billing where billing is
 * required. The code is identical; the fix is not. So each step is checked in
 * the order it has to be done, and the first failure stops the run with the
 * one instruction that matters — a list of six possible causes is not help.
 */

import { readFileSync } from "node:fs";
import { googleAccessToken, request } from "../integrations/lib.mjs";
import { GA4, PROPERTY, SCOPES } from "./api.mjs";

const steps = [];
let failed = false;

function step(n, title, ok, detail, fix) {
  steps.push({ n, title, ok, detail, fix });
  const mark = ok ? "✓" : "✗";
  console.log(`  ${mark} ${n}. ${title}`);
  if (detail) console.log(`       ${detail}`);
  if (!ok && fix) {
    console.log("");
    for (const line of fix.split("\n")) console.log(`       ${line}`);
    console.log("");
  }
  if (!ok) failed = true;
  return ok;
}

console.log("\nGoogle service account · setup check\n");

// ── 1. The key exists and is readable ────────────────────────────────────
const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
let key = null;
if (!raw) {
  step(1, "Key configured", false, "GOOGLE_SERVICE_ACCOUNT_JSON is not set",
    "Create the service account and download its JSON key, then in website/.env.local:\n" +
    "  GOOGLE_SERVICE_ACCOUNT_JSON=/Users/sharan/.config/gcloud/sharancreatedthis-seo.json\n" +
    "Full walkthrough: docs/google-service-account.md");
} else {
  try {
    key = raw.trim().startsWith("{") ? JSON.parse(raw) : JSON.parse(readFileSync(raw.trim(), "utf8"));
    step(1, "Key configured", Boolean(key.client_email && key.private_key),
      key.client_email ?? "no client_email in the key",
      key.client_email ? null : "This does not look like a service-account key. Download the JSON key, not an OAuth client secret.");
  } catch (error) {
    step(1, "Key configured", false, error.message,
      "The path is set but the file could not be read or parsed.\n" +
      "Check the path, and that the file is the JSON key you downloaded.");
  }
}

// ── 2. Google accepts it ─────────────────────────────────────────────────
let token = null;
if (key?.client_email) {
  const result = await googleAccessToken(SCOPES);
  token = result.token;
  step(2, "Google accepts the key", Boolean(token), result.reason ?? "signed and exchanged for an access token",
    token ? null :
    // Google's wording is terse and the causes are distinct enough to name.
    (result.reason ?? "").includes("account not found")
      ? "That service account does not exist any more, or the key belongs to a\n" +
        "deleted project. Create a new service account and a new key."
      : (result.reason ?? "").includes("Invalid JWT")
        ? "The signature was rejected. Usually a truncated private_key, or a\n" +
          "machine clock more than a few minutes out of step."
        : "The key was refused. If it was deleted in the console, create a new\n" +
          "one and update the path in .env.local.");
}

const auth = token ? { authorization: `Bearer ${token}` } : null;

// ── 3. Search Console API enabled, and the property shared ───────────────
if (auth) {
  const sites = await request("https://searchconsole.googleapis.com/webmasters/v3/sites", { headers: auth });
  const message = sites.json?.error?.message ?? "";
  if (!sites.ok && /has not been used|disabled/i.test(message)) {
    step(3, "Search Console API enabled", false, message.slice(0, 120),
      "Google Cloud Console -> APIs & Services -> Library\n" +
      "  Search for \"Google Search Console API\" -> Enable\n" +
      "Then wait a minute for it to propagate.");
  } else if (!sites.ok) {
    step(3, "Search Console API enabled", false, `${sites.status}: ${message.slice(0, 120)}`);
  } else {
    step(3, "Search Console API enabled", true, "responding");
    const entries = sites.json.siteEntry ?? [];
    const match = entries.find((e) => e.siteUrl === PROPERTY);
    step(4, `Property shared (${PROPERTY})`, Boolean(match),
      entries.length ? entries.map((e) => `${e.siteUrl} [${e.permissionLevel}]`).join(", ") : "no properties visible",
      match ? null :
      `Search Console -> Settings -> Users and permissions -> Add user\n` +
      `  Email: ${key.client_email}\n` +
      `  Permission: Restricted is enough\n` +
      (entries.length
        ? `It can see other properties, so GSC_SITE_URL may be wrong. Use one of the above.`
        : `It can see no properties at all, so it has not been added anywhere yet.`));
  }
}

// ── 5. GA4 property id, API, and access ──────────────────────────────────
if (auth) {
  if (!GA4) {
    step(5, "GA4 property id set", false, "GA4_PROPERTY_ID is not set",
      "GA4 -> Admin -> Property details -> copy the numeric Property ID.\n" +
      "It is a number like 123456789, not the G-XXXXXXXX measurement id.\n" +
      "Put it in website/.env.local as GA4_PROPERTY_ID=");
  } else {
    step(5, "GA4 property id set", true, GA4);
    const report = await request(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4}:runReport`, {
      method: "POST",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "activeUsers" }] }),
    });
    const message = report.json?.error?.message ?? "";
    if (!report.ok && /has not been used|disabled/i.test(message)) {
      step(6, "GA4 Data API enabled", false, message.slice(0, 120),
        "Google Cloud Console -> APIs & Services -> Library\n" +
        "  Search for \"Google Analytics Data API\" -> Enable");
    } else if (!report.ok && report.status === 403) {
      step(6, "GA4 access granted", false, message.slice(0, 140),
        `GA4 -> Admin -> Property access management -> Add users\n` +
        `  Email: ${key.client_email}\n` +
        `  Role: Viewer`);
    } else if (!report.ok) {
      step(6, "GA4 reachable", false, `${report.status}: ${message.slice(0, 140)}`,
        report.status === 404 ? "That property id does not exist. Check GA4_PROPERTY_ID." : null);
    } else {
      step(6, "GA4 access granted", true, "runReport answered");

      // The Admin API is a separate API on the same scope. Reporting works
      // without it; it is what confirms the numeric property id belongs to the
      // property you think it does, rather than to someone else's.
      const admin = await request(`https://analyticsadmin.googleapis.com/v1beta/properties/${GA4}`, { headers: auth });
      const adminMessage = admin.json?.error?.message ?? "";
      console.log(`  ${admin.ok ? "\u2713" : "!"} 6b. GA4 Admin API`);
      console.log(`       ${admin.ok
        ? `${admin.json.displayName} \u00b7 ${admin.json.currencyCode} \u00b7 ${admin.json.timeZone}`
        : /has not been used|disabled/i.test(adminMessage)
          ? "not enabled — optional, but it is what confirms the property id is the right one"
          : adminMessage.slice(0, 110)}`);
      if (!admin.ok && /has not been used|disabled/i.test(adminMessage)) {
        console.log("");
        console.log("       Google Cloud Console -> APIs & Services -> Library");
        console.log("         \"Google Analytics Admin API\" -> Enable");
        console.log("       Uses the same analytics.readonly scope; nothing else to grant.");
        console.log("");
      }

      // Not fatal: the events work without this, they are just not reportable.
      const dims = await request(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4}:runReport`, {
        method: "POST",
        headers: { ...auth, "content-type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
          dimensions: [{ name: "customEvent:platform" }],
          metrics: [{ name: "eventCount" }],
          limit: 1,
        }),
      });
      const registered = dims.ok;
      console.log(`  ${registered ? "✓" : "!"} 7. Custom dimensions registered`);
      console.log(`       ${registered ? "platform is queryable" : "platform is not registered — download events cannot be broken down"}`);
      if (!registered) {
        console.log("");
        console.log("       GA4 -> Admin -> Custom definitions -> Create custom dimension");
        console.log("         Scope: Event.  Parameters: platform, source, reason");
        console.log("       Not retroactive: data arriving before this is not backfilled.");
        console.log("");
      }
    }
  }
}

console.log(failed
  ? "\nSetup incomplete. Fix the first ✗ above, then run this again.\n"
  : "\nEverything is connected. Try: npm run google -- all\n");
process.exit(failed ? 1 : 0);
