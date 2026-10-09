/**
 * Gives every shipped charm that has no website SVG an image: the app's own
 * Library preview, converted to WebP.
 *
 *   node scripts/import-charm-previews.mjs <path to the Hangly Mac repository>
 *
 * Run by hand after charm-library.shipped.json is updated from a new release —
 * not at build time, because it needs the app's repository and `cwebp`
 * (Homebrew: webp). The previews are the 512 px images the app's Library
 * shows, `Hangly/Assets/Assets.xcassets/CharmPreviews/charm-preview-<id>.imageset`,
 * so the site shows exactly what a user sees when they pick the charm.
 *
 * The SVGs in the Windows repository were the other candidate. They embed the
 * artwork as bitmaps and run 180 KB to 2.8 MB each — about 48 MB for the charms
 * that needed one — against about 30 KB for a WebP preview.
 *
 * Writes public/charms/<id>.webp for each such charm, and the list of them to
 * src/data/hangly/charm-artwork-webp.json, which artwork.ts, the manifest and
 * the artwork check all read. A charm that later gets an SVG drops off the list
 * on the next run.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = process.argv[2];
if (!repo) throw new Error("usage: node scripts/import-charm-previews.mjs <path to the Hangly Mac repository>");
const previews = join(repo, "Hangly/Assets/Assets.xcassets/CharmPreviews");
if (!existsSync(previews)) throw new Error(`no CharmPreviews at ${previews}`);

const shipped = JSON.parse(readFileSync(join(root, "src/data/hangly/charm-library.shipped.json"), "utf8"));
// The same alias map artwork.ts uses (walterWhite is breakingBad1 on disk), read the way the artwork check reads it.
const src = readFileSync(join(root, "src/lib/charms/artwork.ts"), "utf8");
const aliasBody = src.slice(src.indexOf("ARTWORK_ALIAS: Record<string, string> = {"));
const alias = Object.fromEntries(
  [...aliasBody.slice(0, aliasBody.indexOf("\n};")).matchAll(/(\w+):\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]),
);

const webp = [];
let bytes = 0;
for (const { id } of shipped.charms) {
  if (existsSync(join(root, "public/charms", `${alias[id] ?? id}.svg`))) continue;
  const png = join(previews, `charm-preview-${id}.imageset`, `charm-preview-${id}@2x.png`);
  if (!existsSync(png)) throw new Error(`${id} has no website SVG and no app preview at ${png}`);
  const out = join(root, "public/charms", `${id}.webp`);
  execFileSync("cwebp", ["-quiet", "-q", "80", "-alpha_q", "90", "-m", "6", png, "-o", out]);
  bytes += readFileSync(out).length;
  webp.push(id);
}

webp.sort();
writeFileSync(join(root, "src/data/hangly/charm-artwork-webp.json"), JSON.stringify(webp, null, 2) + "\n");
console.log(`${webp.length} charms given a WebP preview, ${Math.round(bytes / 1024)} KiB in all`);
