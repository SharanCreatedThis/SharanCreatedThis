/**
 * Writes the IndexNow key file that proves control of the domain.
 *
 * The file's name is the key and its contents are the key, which is the whole
 * protocol. Nothing is generated when no key is configured, so the site never
 * ships a stray file, and the key is not secret — it only ever proves that
 * whoever is submitting URLs can also publish at this domain.
 */

import { writeFileSync, rmSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Populates process.env from .env.production, which npm does not do.
import "./load-env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const key = process.env.INDEXNOW_KEY;

// Clear out any key file from a previous key before writing the current one.
for (const entry of readdirSync(publicDir)) {
  if (/^[0-9a-f]{8,128}\.txt$/i.test(entry) && entry !== `${key}.txt`) {
    rmSync(join(publicDir, entry));
  }
}

if (key) {
  writeFileSync(join(publicDir, `${key}.txt`), key);
  console.log(`  indexnow: key file public/${key}.txt written`);
}
