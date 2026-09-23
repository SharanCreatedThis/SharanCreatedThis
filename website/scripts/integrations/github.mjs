/**
 * GitHub, through the CLI that already holds a token in the keychain.
 *
 * `gh` was authenticated interactively and its token lives in the macOS
 * keychain, not in a file. That is strictly better than a PAT in .env.local:
 * the keychain is encrypted at rest, unlocked with the login session, and the
 * token never appears in a file that could be copied, backed up or committed.
 *
 * So no GITHUB_TOKEN is asked for. If one is set — for CI, where there is no
 * keychain — gh picks it up on its own.
 */

import { STATUS, cli, result } from "./lib.mjs";

const REPOS = [
  "SharanCreatedThis/SharanCreatedThis",
  "SharanCreatedThis/Hangly-Windows",
];

export async function check() {
  const out = [];

  const status = cli("gh", ["auth", "status"]);
  const account = status.out.match(/account (\S+)/)?.[1];
  const scopes = status.out.match(/Token scopes: (.+)/)?.[1]?.trim();
  if (!status.ok || !account) {
    return [result("GitHub · auth", STATUS.unconfigured, "not logged in — run: gh auth login")];
  }
  out.push(result("GitHub · auth", STATUS.ok, `${account} (${status.out.includes("keyring") ? "keychain" : "file"}); scopes ${scopes}`));

  for (const repo of REPOS) {
    const view = cli("gh", ["repo", "view", repo, "--json", "name,visibility,pushedAt,defaultBranchRef"]);
    if (!view.ok) {
      out.push(result(`GitHub · ${repo}`, STATUS.denied, "not readable with this token"));
      continue;
    }
    const data = JSON.parse(view.out);
    out.push(result(`GitHub · ${repo}`, STATUS.ok,
      `${data.visibility.toLowerCase()}, default ${data.defaultBranchRef?.name}, last push ${data.pushedAt?.slice(0, 10)}`));
  }

  // Releases matter here: the Windows download URLs are generated from them.
  const releases = cli("gh", ["release", "list", "--repo", "SharanCreatedThis/Hangly-Windows", "--limit", "5"]);
  if (releases.ok) {
    const lines = releases.out.trim().split("\n").filter(Boolean);
    const newest = lines[0]?.split("\t")[0];
    out.push(result("GitHub · Hangly-Windows releases", STATUS.ok,
      `${lines.length} recent; newest ${newest}${lines[0]?.includes("Pre-release") ? " (pre-release)" : ""}`));
  }

  const workflows = cli("gh", ["run", "list", "--repo", REPOS[0], "--limit", "1"]);
  out.push(result("GitHub · Actions", STATUS.ok,
    workflows.ok && workflows.out.trim() ? "workflow runs visible" : "no workflows configured — Cloudflare Pages builds on push instead"));

  return out;
}
