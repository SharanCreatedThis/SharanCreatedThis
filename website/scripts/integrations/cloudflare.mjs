/**
 * Cloudflare, through the CLI that is already logged in.
 *
 * wrangler holds an OAuth token in the system keychain, granted interactively
 * and scoped by Cloudflare itself. Minting a second API token to sit in a file
 * beside it would add a secret to protect, a rotation to remember and a
 * permission set to get wrong, for access that already exists.
 *
 * An API token is still worth having for one case: unattended runs on a machine
 * nobody has logged into. Set CLOUDFLARE_API_TOKEN and the checks that can use
 * it will, falling back to wrangler otherwise.
 */

import { STATUS, cli, request, result } from "./lib.mjs";

const PROJECT = "sharancreatedthis";
const ZONE = "sharancreatedthis.in";

export async function check() {
  const out = [];

  const who = cli("npx", ["wrangler", "whoami"]);
  const email = who.out.match(/associated with the email ([^\s.]+@[^\s.]+\.\w+)/)?.[1];
  const account = who.out.match(/│\s+([0-9a-f]{32})\s+│/)?.[1];
  out.push(
    who.ok && email
      ? result("Cloudflare · auth", STATUS.ok, `wrangler OAuth as ${email}`, { account })
      : result("Cloudflare · auth", STATUS.unconfigured, "wrangler is not logged in — run: npx wrangler login"),
  );
  if (!who.ok) return out;

  const pages = cli("npx", ["wrangler", "pages", "project", "list"]);
  out.push(
    pages.ok && pages.out.includes(PROJECT)
      ? result("Cloudflare · Pages project", STATUS.ok, `${PROJECT} found, domains attached`)
      : result("Cloudflare · Pages project", STATUS.error, `${PROJECT} not listed`),
  );

  const deployments = cli("npx", ["wrangler", "pages", "deployment", "list", "--project-name", PROJECT]);
  // The table's Status column holds either a word ("Active", "Failure") or a
  // relative time for a finished deployment. Only the explicit failures are
  // failures; anything else is a deployment that completed.
  const latest = deployments.out.split("\n").find((line) => /Production/.test(line));
  const cells = latest?.split("\u2502").map((c) => c.trim()).filter(Boolean) ?? [];
  const [, , , sha, , state] = cells;
  out.push(
    !deployments.ok || !cells.length
      ? result("Cloudflare · latest deployment", STATUS.error, "could not read deployments")
      : /Failure|Canceled/i.test(state ?? "")
        ? result("Cloudflare · latest deployment", STATUS.error, `${state} at ${sha}`)
        : result("Cloudflare · latest deployment", STATUS.ok, `${sha} \u2014 ${state}`),
  );

  // DNS and zone settings need an API token: wrangler's OAuth scopes cover
  // Pages and Workers, and zone:read only through the API, not the CLI.
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    out.push(result("Cloudflare · DNS & zone", STATUS.unconfigured,
      "needs CLOUDFLARE_API_TOKEN — see docs/integrations.md for the exact permissions"));
    return out;
  }

  const verify = await request("https://api.cloudflare.com/client/v4/user/tokens/verify", {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!verify.ok) {
    out.push(result("Cloudflare · API token", STATUS.denied,
      `rejected (${verify.status}): ${verify.json?.errors?.[0]?.message ?? verify.text.slice(0, 120)}`));
    return out;
  }
  out.push(result("Cloudflare · API token", STATUS.ok, `active (${verify.json?.result?.status})`));

  const zones = await request(`https://api.cloudflare.com/client/v4/zones?name=${ZONE}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const zoneId = zones.json?.result?.[0]?.id;
  if (!zoneId) {
    out.push(result("Cloudflare · zone", STATUS.denied, `${ZONE} not visible to this token — it needs Zone:Read`));
    return out;
  }

  const dns = await request(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=100`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const records = dns.json?.result ?? [];
  out.push(
    dns.ok
      ? result("Cloudflare · DNS", STATUS.ok,
          `${records.length} records; ${records.filter((r) => ["A", "AAAA", "CNAME"].includes(r.type)).length} addressable`,
          { records: records.map((r) => `${r.type} ${r.name}`) })
      : result("Cloudflare · DNS", STATUS.denied, `Zone:Read missing (${dns.status})`),
  );

  const rules = await request(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const redirects = rules.json?.result?.rules ?? [];
  out.push(result("Cloudflare · redirect rules", rules.status === 404 || rules.ok ? STATUS.ok : STATUS.denied,
    redirects.length ? `${redirects.length} rule(s)` : "none configured — apex → www is still absent, as intended"));

  return out;
}
