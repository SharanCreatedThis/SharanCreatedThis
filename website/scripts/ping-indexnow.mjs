/**
 * Tells Bing and Yandex the site changed, instead of waiting to be crawled.
 *
 * IndexNow turns discovery from days into minutes for the engines that support
 * it — Bing, Yandex, Seznam, Naver, and through Bing a share of what DuckDuckGo
 * and several AI assistants answer with. Google does not participate.
 *
 * Ownership is proved by hosting a key file at the site root whose contents are
 * the key itself. `public/<key>.txt` is generated alongside this, so the proof
 * ships with the deploy that uses it.
 *
 * Run by hand after a deploy, not as part of the build: a build that also
 * happens on every preview and every local `npm run build` should not be
 * announcing anything to the outside world. `npm run ping` does it.
 *
 * Never fails anything. Being unable to tell Bing about a change is not a
 * reason to fail a deploy that already succeeded.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const key = process.env.INDEXNOW_KEY;
if (!key) {
  console.log("  indexnow: INDEXNOW_KEY not set — skipped.");
  process.exit(0);
}

const host = "www.sharancreatedthis.in";
const sitemap = readFileSync(join(root, "out/sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (urls.length === 0) {
  console.log("  indexnow: no URLs in the sitemap — skipped.");
  process.exit(0);
}

try {
  const response = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  // 200 and 202 both mean accepted; 422 means the key file could not be read.
  console.log(`  indexnow: submitted ${urls.length} URLs — ${response.status} ${response.statusText}`);
  if (response.status === 422) {
    console.log(`  indexnow: check that https://${host}/${key}.txt is live and contains exactly the key.`);
  }
} catch (error) {
  console.log(`  indexnow: could not reach the API (${error.message}) — ignored.`);
}
