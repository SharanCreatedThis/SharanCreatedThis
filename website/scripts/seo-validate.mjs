/**
 * Full SEO validation over the exported site, plus the internal link graph.
 *
 *   npm run seo:validate
 *
 * Every check here corresponds to a failure that is silent in production: a
 * duplicate title looks fine in a browser, an orphan page is reachable by
 * typing the URL, and invalid JSON-LD renders as nothing at all. None of them
 * announce themselves, which is why they are worth a build step.
 *
 * Exits non-zero on any error so it can gate a deploy. Warnings do not fail.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const SITE = "https://www.sharancreatedthis.in";

if (!existsSync(out)) {
  console.error("seo-validate: no out/ — run the build first.");
  process.exit(1);
}

const errors = [];
const warnings = [];
const ESC = String.fromCharCode(27);
const c = (n, t) => `${ESC}[${n}m${t}${ESC}[0m`;

/* ── collect every exported page ──────────────────────────────────────── */
function walk(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== "_next") walk(full, found);
    } else if (entry.endsWith(".html")) found.push(full);
  }
  return found;
}

const EXCLUDED = new Set(["/404", "/_not-found", "/products/vision/release-notes", "/products/vision/dev/release-notes"]);
const pages = new Map();
for (const file of walk(out)) {
  const path = `/${relative(out, file).replace(/\.html$/, "")}`;
  const key = path === "/index" ? "/" : path;
  if (EXCLUDED.has(key)) continue;
  pages.set(key, readFileSync(file, "utf8"));
}

/**
 * Paths that are not exported pages and are not meant to be.
 *
 * The download routes are 302s declared in public/_redirects and resolved at
 * the edge — they have no HTML and never will. An asset is anything with a
 * file extension, which must allow long ones: ".webmanifest" is eleven
 * characters and a pattern capped at five reported the manifest link on every
 * page as a broken link.
 */
const redirects = new Set(
  [...readFileSync(join(root, "public/_redirects"), "utf8").matchAll(/^(\/\S+)\s+\S+\s+\d+$/gm)]
    .map((m) => m[1].replace(/\/\*$/, "")),
);
const isAsset = (p) => /\.[a-z0-9]{2,12}$/i.test(p);
const isRedirect = (p) => redirects.has(p) || [...redirects].some((r) => r.endsWith("/") && p.startsWith(r));

const one = (html, re) => (html.match(re) || [, ""])[1]?.trim() ?? "";
/**
 * Visible text, with entities decoded.
 *
 * Decoding is not cosmetic. React escapes a quotation mark in a text node to
 * `&quot;`, so a FAQ answer or a HowTo step containing quoted UI text — "Windows
 * protected your PC" — never matched the schema string it came from, and the
 * checks below reported perfectly visible content as missing.
 */
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#x27": "'", "#39": "'" };
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, name) => {
    const key = name.toLowerCase();
    if (key in ENTITIES) return ENTITIES[key];
    if (/^#x/i.test(name)) return String.fromCodePoint(parseInt(name.slice(2), 16));
    if (/^#/.test(name)) return String.fromCodePoint(Number(name.slice(1)));
    return whole;
  });
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/* ── per-page metadata ────────────────────────────────────────────────── */
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

for (const [path, html] of pages) {
  const title = one(html, /<title[^>]*>([^<]*)</);
  const desc = one(html, /<meta name="description" content="([^"]*)"/);
  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;

  if (!title) errors.push(`${path}: no <title>`);
  if (!desc) errors.push(`${path}: no meta description`);
  if (!canonical) errors.push(`${path}: no canonical`);
  if (h1s !== 1) errors.push(`${path}: ${h1s} <h1> elements, expected exactly 1`);

  const expected = SITE + (path === "/" ? "" : path);
  if (canonical && canonical !== expected) {
    errors.push(`${path}: canonical is ${canonical}, expected ${expected}`);
  }
  if (title.length > 65) warnings.push(`${path}: title ${title.length} chars (>65, truncated in results)`);
  if (desc && (desc.length > 165 || desc.length < 70)) {
    warnings.push(`${path}: description ${desc.length} chars (aim 70-165)`);
  }

  for (const [map, value] of [[titles, title], [descriptions, desc], [canonicals, canonical]]) {
    if (value) map.set(value, [...(map.get(value) ?? []), path]);
  }

  for (const [name, count] of [["og:title", /property="og:title"/g], ["og:description", /property="og:description"/g],
                               ["og:image", /property="og:image"/g], ["og:url", /property="og:url"/g],
                               ["twitter:card", /name="twitter:card"/g], ["twitter:image", /name="twitter:image"/g]]) {
    if (!(html.match(count) || []).length) errors.push(`${path}: missing ${name}`);
  }

  // Thin content is a real ranking problem and an easy one to miss.
  const words = text(html).split(" ").length;
  if (words < 250) warnings.push(`${path}: ${words} words of visible text (thin)`);
}

for (const [map, label] of [[titles, "title"], [descriptions, "description"]]) {
  for (const [value, paths] of map) {
    if (paths.length > 1) errors.push(`duplicate ${label} on ${paths.join(", ")}: "${value.slice(0, 50)}…"`);
  }
}
for (const [value, paths] of canonicals) {
  if (paths.length > 1) errors.push(`duplicate canonical ${value} on ${paths.join(", ")}`);
}

/* ── JSON-LD validity ─────────────────────────────────────────────────── */
let schemaBlocks = 0;
for (const [path, html] of pages) {
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    schemaBlocks++;
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch (error) {
      errors.push(`${path}: invalid JSON-LD — ${error.message.slice(0, 70)}`);
      continue;
    }
    for (const node of parsed["@graph"] ?? [parsed]) {
      if (!node["@type"]) errors.push(`${path}: JSON-LD node without @type`);
      if (node["@type"] === "FAQPage") {
        const qs = node.mainEntity ?? [];
        if (!qs.length) errors.push(`${path}: FAQPage with no questions`);
        for (const q of qs) {
          if (!q.name || !q.acceptedAnswer?.text) {
            errors.push(`${path}: FAQPage question missing name or answer`);
            break;
          }
          // Google requires the answer to be visible on the page.
          const visible = text(html);
          const probe = q.acceptedAnswer.text.replace(/\s+/g, " ").slice(0, 45);
          if (probe.length > 20 && !visible.includes(probe)) {
            errors.push(`${path}: FAQ answer not visible on the page — "${q.name.slice(0, 40)}"`);
            break;
          }
        }
      }
    }
  }
}

/* ── breadcrumbs and HowTo ────────────────────────────────────────────────
   A BreadcrumbList that names a page Google cannot reach, or a HowTo whose
   steps exist only in schema, are both invisible in a browser and both a
   guidelines problem. Neither announces itself, so both are checked here. */
for (const [path, html] of pages) {
  const visible = text(html);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed;
    try { parsed = JSON.parse(m[1]); } catch { continue; }
    for (const node of parsed["@graph"] ?? [parsed]) {
      if (node["@type"] === "BreadcrumbList") {
        const trail = node.itemListElement ?? [];
        if (!trail.length) { errors.push(`${path}: BreadcrumbList with no items`); continue; }
        trail.forEach((step, i) => {
          if (step.position !== i + 1) errors.push(`${path}: breadcrumb position ${step.position} at index ${i + 1}`);
          if (!step.name) errors.push(`${path}: breadcrumb step ${i + 1} has no name`);
        });
        const last = trail[trail.length - 1];
        const here = SITE + (path === "/" ? "" : path);
        if (last?.item && last.item.replace(/\/$/, "") !== here) {
          errors.push(`${path}: breadcrumb ends at ${last.item}, not this page`);
        }
      }
      if (node["@type"] === "HowTo") {
        const steps = node.step ?? [];
        if (steps.length < 2) errors.push(`${path}: HowTo with ${steps.length} step(s)`);
        for (const step of steps) {
          const probe = (step.text ?? "").replace(/\s+/g, " ").slice(0, 45);
          if (probe.length > 20 && !visible.includes(probe)) {
            errors.push(`${path}: HowTo step not visible on the page — "${(step.name ?? "").slice(0, 40)}"`);
            break;
          }
        }
      }
    }
  }
}

/* ── pages that must carry a breadcrumb ──────────────────────────────────
   Anything below the root. A crawler works out a hierarchy from links alone,
   but a breadcrumb is what puts the path into the result itself. */
for (const [path, html] of pages) {
  if (path === "/" || path.split("/").length < 3) continue;
  if (!html.includes('"BreadcrumbList"')) errors.push(`${path}: nested page with no BreadcrumbList`);
}

/* ── the entity graph resolves ────────────────────────────────────────────
   A reference like {"@id": ".../products/hangly#app"} with no node of that id
   on the page is a pointer into nothing. Schema validators do not complain —
   the JSON is valid — and the page renders identically, so the only symptom is
   that the entity quietly does not connect. Renaming an id and missing one
   reference is exactly how it happens. */
for (const [path, html] of pages) {
  const declared = new Set();
  const referenced = new Set();
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed;
    try { parsed = JSON.parse(m[1]); } catch { continue; }
    (function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      // A node declares an id; a bare {"@id": …} only points at one.
      if (node["@id"]) (node["@type"] ? declared : referenced).add(node["@id"]);
      Object.values(node).forEach(visit);
    })(parsed);
  }
  for (const id of referenced) {
    if (!declared.has(id)) errors.push(`${path}: JSON-LD references @id ${id}, which nothing on the page defines`);
  }
}

/* ── link graph: orphans, depth, broken internal links ────────────────── */
const inbound = new Map([...pages.keys()].map((p) => [p, new Set()]));
const outbound = new Map();
for (const [src, html] of pages) {
  const targets = new Set();
  for (const href of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const target = href[1].replace(/\/$/, "") || "/";
    if (target.startsWith("/_next")) continue;
    if (!pages.has(target)) {
      // Only flag things that look like pages, not assets.
      if (!isAsset(target) && !isRedirect(target)) {
        errors.push(`${src}: links to ${target}, which is neither an exported page, an asset nor a redirect`);
      }
      continue;
    }
    if (target !== src) {
      targets.add(target);
      inbound.get(target).add(src);
    }
  }
  outbound.set(src, targets);
}

for (const [path, sources] of inbound) {
  if (path !== "/" && sources.size === 0) errors.push(`${path}: orphan — no internal page links to it`);
}

// Breadth-first depth from the home page.
const depth = new Map([["/", 0]]);
const queue = ["/"];
while (queue.length) {
  const current = queue.shift();
  for (const next of outbound.get(current) ?? []) {
    if (!depth.has(next)) {
      depth.set(next, depth.get(current) + 1);
      queue.push(next);
    }
  }
}
for (const path of pages.keys()) {
  const d = depth.get(path);
  if (d === undefined) errors.push(`${path}: unreachable from the home page by following links`);
  else if (d > 3) warnings.push(`${path}: ${d} clicks from home (target is 3 or fewer)`);
}

/* ── required files ───────────────────────────────────────────────────── */
for (const file of ["robots.txt", "sitemap.xml", "manifest.webmanifest", "favicon.ico"]) {
  if (!existsSync(join(out, file))) errors.push(`${file} missing from out/`);
}
const sitemapUrls = new Set(
  [...readFileSync(join(out, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/"),
);
for (const path of pages.keys()) {
  if (!sitemapUrls.has(path)) errors.push(`${path}: exported but not in the sitemap`);
}

/* ── report ───────────────────────────────────────────────────────────── */
console.log(`\n  ${c(1, "SEO validation")}  ${pages.size} pages, ${schemaBlocks} JSON-LD blocks\n`);

const depths = [...pages.keys()].map((p) => depth.get(p) ?? 99);
console.log(`  link graph`);
console.log(`    max depth from home   ${Math.max(...depths)} clicks`);
console.log(`    orphans               ${[...inbound].filter(([p, s]) => p !== "/" && !s.size).length}`);
console.log(`    median inbound links  ${[...inbound.values()].map((s) => s.size).sort((a, b) => a - b)[Math.floor(inbound.size / 2)]}`);
console.log(`    total internal links  ${[...outbound.values()].reduce((n, s) => n + s.size, 0)}`);

if (warnings.length) {
  console.log(`\n  ${c(33, `${warnings.length} warning(s)`)}`);
  for (const w of warnings.slice(0, 20)) console.log(`    · ${w}`);
  if (warnings.length > 20) console.log(`    · …and ${warnings.length - 20} more`);
}
if (errors.length) {
  console.log(`\n  ${c(31, `${errors.length} error(s)`)}`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log();
  process.exit(1);
}
console.log(`\n  ${c(32, "no errors")}\n`);
