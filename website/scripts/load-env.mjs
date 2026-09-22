/**
 * Makes the committed .env files visible to scripts that run under plain node.
 *
 * Next loads .env.production itself during a build, but the scripts in this
 * directory run as `node scripts/…` from npm lifecycle hooks, where nothing
 * loads anything. A value set in the file was therefore invisible to them —
 * which for IndexNow meant the key silently never being found and the key file
 * never being written, with no error to notice.
 *
 * A real environment variable always wins. That is what lets Cloudflare, or a
 * shell, override a committed value without editing it.
 *
 * Deliberately tiny: this reads `KEY=value` lines and nothing else. No quoting
 * rules, no interpolation, no multi-line values. Everything these files hold is
 * an identifier or a hex string, and a parser that handles more than that is a
 * parser with more ways to be wrong.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Later files do not overwrite earlier ones, matching Next's own precedence.
for (const file of [".env.local", ".env.production", ".env"]) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const at = trimmed.indexOf("=");
    if (at < 1) continue;
    const key = trimmed.slice(0, at).trim();
    const value = trimmed.slice(at + 1).trim();
    if (process.env[key] === undefined && value) process.env[key] = value;
  }
}
