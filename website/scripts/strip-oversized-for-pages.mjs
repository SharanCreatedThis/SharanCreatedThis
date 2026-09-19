/**
 * Drops files the Cloudflare Pages uploader would reject, on Pages builds only.
 *
 * Pages refuses any single file over 25 MiB and fails the whole deployment, not
 * just that file. `Hangly-2.0.0.dmg` is 32.65 MiB.
 *
 * It cannot simply leave the repository: Vercel still serves production, and the
 * Hangly appcast — which every installed copy reads — points at
 *
 *     https://www.sharancreatedthis.in/products/hangly/releases/Hangly-2.0.0.dmg
 *
 * Deleting it would turn that into a 404 and break updates for real users. So the
 * file stays committed, Vercel keeps serving it, and it is removed from `out/`
 * only when Pages is the one building.
 *
 * This is interim. Once the archives are in R2 and DOWNLOADS_BASE points at it,
 * they leave `public/` for good and this script stops finding anything.
 *
 * Runs as `postbuild`, so both hosts invoke it and only Pages acts: CF_PAGES is
 * set in the Pages build environment and nowhere else.
 */

import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

if (!process.env.CF_PAGES) {
  process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");

/** Cloudflare Pages' per-file ceiling. */
const LIMIT = 25 * 1024 * 1024;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

let removed = 0;
for (const path of walk(out)) {
  const { size } = statSync(path);
  if (size <= LIMIT) continue;

  unlinkSync(path);
  removed += 1;
  console.log(
    `  stripped for Pages: ${relative(out, path)} ` +
      `(${(size / 1048576).toFixed(2)} MiB, over the 25 MiB per-file limit)`,
  );
}

if (removed > 0) {
  console.log(
    `  ${removed} file(s) removed from the Pages upload. They remain in the ` +
      `repository and Vercel keeps serving them until R2 takes over.`,
  );
}
