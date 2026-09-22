/**
 * Fails the build when a page exists but nothing tells a crawler about it.
 *
 * The silent failure this exists to prevent: someone adds a route, ships it,
 * and it is never crawled, because the sitemap is generated from `PAGES` in
 * src/lib/seo.ts and the new page was never added there. Nothing breaks, no
 * error appears, the page simply does not exist as far as search is concerned —
 * and nobody finds out for months.
 *
 * So every exported HTML file is compared against the sitemap, and a page in
 * one and not the other stops the build. Runs after the export, as `postbuild`.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

// So INDEXNOW_KEY from .env.production is visible to the check below.
import "./load-env.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");

if (!existsSync(out)) {
  console.error("check-seo: no out/ directory — run the build first.");
  process.exit(1);
}

/** Every page the export produced, as a site path. */
function exportedPages(dir = out, found = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // _next holds build output, not pages.
      if (entry !== "_next") exportedPages(full, found);
    } else if (entry.endsWith(".html")) {
      const path = `/${relative(out, full).replace(/\.html$/, "")}`;
      found.push(path === "/index" ? "/" : path);
    }
  }
  return found;
}

// Pages that are deliberately not advertised.
//
// The release notes are Sparkle's, not the site's: the updater loads them inside
// its own dialog and no visitor ever navigates to one. They are kept out of the
// sitemap here and marked noindex in public/_headers, which is the only way to
// do it — the files themselves are part of the update infrastructure and are
// never edited. 404 is not a page anyone should be sent to either, and it
// carries its own noindex meta tag.
const NOT_IN_SITEMAP = new Set([
  "/404",
  "/_not-found",
  "/products/vision/release-notes",
  "/products/vision/dev/release-notes",
]);

const pages = exportedPages().filter((path) => !NOT_IN_SITEMAP.has(path));

const sitemapPath = join(out, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  console.error("check-seo: out/sitemap.xml was not generated.");
  process.exit(1);
}
const sitemap = readFileSync(sitemapPath, "utf8");
const listed = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    new URL(match[1]).pathname.replace(/^(.+)\/$/, "$1"),
  ),
);

const missing = pages.filter((path) => !listed.has(path));
const phantom = [...listed].filter((path) => !pages.includes(path));

const problems = [];
if (missing.length) {
  problems.push(
    `not in the sitemap, so they will never be crawled — add them to PAGES in src/lib/seo.ts:\n` +
      missing.map((path) => `      ${path}`).join("\n"),
  );
}
if (phantom.length) {
  problems.push(
    `in the sitemap but not exported, so crawlers will be sent to a 404:\n` +
      phantom.map((path) => `      ${path}`).join("\n"),
  );
}

// A PNG that has a WebP beside it and is referenced by nothing is dead weight
// in the deployment: the page loads the WebP and the PNG is uploaded to the
// edge for nobody. Three of these were shipping 12 MB between them.
const publicDir = join(root, "public");
function strayPngs(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) strayPngs(full, found);
    else if (entry.endsWith(".png") && existsSync(full.replace(/\.png$/, ".webp"))) {
      const name = relative(publicDir, full);
      const referenced = sources.some((source) => source.includes(entry));
      if (!referenced) found.push(name);
    }
  }
  return found;
}
const sources = [];
(function readSources(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) readSources(full);
    else if (/\.(tsx|ts|css|html)$/.test(entry)) sources.push(readFileSync(full, "utf8"));
  }
})(join(root, "src"));

const stray = strayPngs(publicDir);
if (stray.length) {
  problems.push(
    `PNG(s) with an unused WebP twin, shipping to the edge for nobody:\n` +
      stray.map((name) => `      ${name}`).join("\n"),
  );
}

// A key set with no file beside it means every IndexNow submission is refused
// with a 422, which is only visible to whoever runs the ping. Catch it here.
if (process.env.INDEXNOW_KEY) {
  const keyFile = `${process.env.INDEXNOW_KEY}.txt`;
  if (!existsSync(join(out, keyFile))) {
    problems.push(
      `INDEXNOW_KEY is set but out/${keyFile} was not generated — ` +
        `IndexNow would answer 422. Check scripts/generate-indexnow-key.mjs ran.`,
    );
  } else if (readFileSync(join(out, keyFile), "utf8").trim() !== process.env.INDEXNOW_KEY) {
    problems.push(`out/${keyFile} does not contain the key it is named after.`);
  }
}

// Things that are only ever wrong, and cheap to catch here rather than in
// Search Console three weeks later.
for (const file of ["robots.txt", "manifest.webmanifest", "favicon.ico"]) {
  if (!existsSync(join(out, file))) problems.push(`${file} is missing from out/.`);
}
if (!readFileSync(join(out, "robots.txt"), "utf8").includes("Sitemap:")) {
  problems.push("robots.txt does not reference the sitemap.");
}

if (problems.length) {
  console.error("\ncheck-seo failed:\n");
  for (const problem of problems) console.error(`  - ${problem}\n`);
  process.exit(1);
}

console.log(`  check-seo: ${pages.length} pages, all in the sitemap.`);
