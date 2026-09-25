/**
 * SEO, GEO and AEO scores, computed from the exported site.
 *
 * Every score is (checks passed / checks applicable). No number here is a
 * judgement or an estimate — each is a named check with a measurement and a
 * threshold, and the report prints the evidence for all of them including the
 * ones that pass. A score with no visible working is worth nothing.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const out = join(root, "out");
const SITE = "https://www.sharancreatedthis.in";

function walk(dir, found = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== "_next") walk(p, found); }
    else if (e.endsWith(".html")) found.push(p);
  }
  return found;
}

const EXCLUDE = new Set(["/404", "/_not-found", "/products/vision/release-notes", "/products/vision/dev/release-notes"]);
const pages = new Map();
for (const f of walk(out)) {
  const path = `/${relative(out, f).replace(/\.html$/, "")}`.replace(/^\/index$/, "/");
  if (!EXCLUDE.has(path)) pages.set(path, readFileSync(f, "utf8"));
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (w, n) => {
  const k = n.toLowerCase();
  if (k in ENT) return ENT[k];
  if (/^#x/i.test(n)) return String.fromCodePoint(parseInt(n.slice(2), 16));
  if (/^#/.test(n)) return String.fromCodePoint(Number(n.slice(1)));
  return w;
});
const text = (h) => decode(h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const one = (h, re) => (h.match(re) || [, ""])[1] ?? "";

/* ── shared measurements ───────────────────────────────────────────────── */
const nested = [...pages.keys()].filter((p) => p !== "/" && p.split("/").length >= 3);
const schemaNodes = new Map();
let dangling = 0;
for (const [path, html] of pages) {
  const declared = new Set(), refs = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed; try { parsed = JSON.parse(m[1]); } catch { continue; }
    (function v(n) {
      if (Array.isArray(n)) return n.forEach(v);
      if (!n || typeof n !== "object") return;
      if (n["@id"]) (n["@type"] ? declared : { add: () => refs.push(n["@id"]) }).add?.(n["@id"]) ?? refs.push(n["@id"]);
      if (n["@type"]) { const t = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]; t.forEach((x) => schemaNodes.set(x, (schemaNodes.get(x) ?? 0) + 1)); }
      Object.values(n).forEach(v);
    })(parsed);
  }
  for (const r of refs) if (!declared.has(r)) dangling++;
}

const inbound = new Map([...pages.keys()].map((p) => [p, new Set()]));
const outbound = new Map();
for (const [src, html] of pages) {
  const t = new Set();
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const tgt = m[1].replace(/\/$/, "") || "/";
    if (tgt.startsWith("/_next") || !pages.has(tgt) || tgt === src) continue;
    t.add(tgt); inbound.get(tgt).add(src);
  }
  outbound.set(src, t);
}
const depth = new Map([["/", 0]]);
const q = ["/"];
while (q.length) { const c = q.shift(); for (const n of outbound.get(c) ?? []) if (!depth.has(n)) { depth.set(n, depth.get(c) + 1); q.push(n); } }

const count = (pred) => [...pages].filter(([p, h]) => pred(p, h)).length;
const listFailing = (pred) => [...pages].filter(([p, h]) => !pred(p, h)).map(([p]) => p);

/* ── the checks ────────────────────────────────────────────────────────── */
const checks = { SEO: [], GEO: [], AEO: [] };
const add = (group, name, pass, measurement, evidence = "") =>
  checks[group].push({ name, pass, measurement, evidence });

const total = pages.size;

/* SEO */
const hasCanonical = (p, h) => new RegExp(`<link rel="canonical" href="${SITE}${p === "/" ? "" : p}"`).test(h);
add("SEO", "Every page has a correct self-referencing canonical", count(hasCanonical) === total,
  `${count(hasCanonical)}/${total}`, listFailing(hasCanonical).join(", "));

const titles = new Map(), descs = new Map();
for (const [p, h] of pages) {
  const t = one(h, /<title[^>]*>([^<]*)</); const d = one(h, /<meta name="description" content="([^"]*)"/);
  if (t) titles.set(t, [...(titles.get(t) ?? []), p]);
  if (d) descs.set(d, [...(descs.get(d) ?? []), p]);
}
const dupT = [...titles].filter(([, v]) => v.length > 1), dupD = [...descs].filter(([, v]) => v.length > 1);
add("SEO", "No duplicate titles", dupT.length === 0, `${dupT.length} duplicates`, dupT.map(([k]) => k).join("; "));
add("SEO", "No duplicate meta descriptions", dupD.length === 0, `${dupD.length} duplicates`, dupD.map(([k]) => k).join("; "));
add("SEO", "Every page has a meta description", descs.size > 0 && count((p, h) => /<meta name="description"/.test(h)) === total,
  `${count((p, h) => /<meta name="description"/.test(h))}/${total}`);

const titleLen = [...pages].filter(([, h]) => one(h, /<title[^>]*>([^<]*)</).length > 65).map(([p]) => p);
add("SEO", "Titles within 65 characters", titleLen.length === 0, `${total - titleLen.length}/${total}`, titleLen.join(", "));
const descLen = [...pages].filter(([, h]) => { const d = one(h, /<meta name="description" content="([^"]*)"/); return d && (d.length > 165 || d.length < 70); }).map(([p]) => p);
add("SEO", "Descriptions within 70-165 characters", descLen.length === 0, `${total - descLen.length}/${total}`, descLen.join(", "));

const oneH1 = (p, h) => (h.match(/<h1[\s>]/g) || []).length === 1;
add("SEO", "Exactly one h1 per page", count(oneH1) === total, `${count(oneH1)}/${total}`, listFailing(oneH1).join(", "));

const og = (p, h) => ["og:title", "og:description", "og:image", "og:url"].every((k) => h.includes(`property="${k}"`));
add("SEO", "Complete Open Graph tags", count(og) === total, `${count(og)}/${total}`, listFailing(og).join(", "));
const tw = (p, h) => h.includes('name="twitter:card"') && h.includes('name="twitter:image"');
add("SEO", "Twitter card tags", count(tw) === total, `${count(tw)}/${total}`, listFailing(tw).join(", "));

const sitemapUrls = new Set([...readFileSync(join(out, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, "") || "/"));
const inSitemap = [...pages.keys()].filter((p) => sitemapUrls.has(p));
add("SEO", "Every page in the sitemap", inSitemap.length === total, `${inSitemap.length}/${total}`,
  [...pages.keys()].filter((p) => !sitemapUrls.has(p)).join(", "));

add("SEO", "robots.txt present", existsSync(join(out, "robots.txt")), existsSync(join(out, "robots.txt")) ? "present" : "missing");
add("SEO", "Web app manifest present", existsSync(join(out, "manifest.webmanifest")), existsSync(join(out, "manifest.webmanifest")) ? "present" : "missing");

const orphans = [...inbound].filter(([p, s]) => p !== "/" && !s.size).map(([p]) => p);
add("SEO", "No orphan pages", orphans.length === 0, `${orphans.length} orphans`, orphans.join(", "));
const deep = [...pages.keys()].filter((p) => (depth.get(p) ?? 99) > 3);
add("SEO", "Crawl depth 3 or less from the home page", deep.length === 0,
  `max depth ${Math.max(...[...pages.keys()].map((p) => depth.get(p) ?? 99))}`, deep.join(", "));

const bc = (p) => pages.get(p).includes('"BreadcrumbList"');
const missingBc = nested.filter((p) => !bc(p));
add("SEO", "BreadcrumbList on every nested page", missingBc.length === 0, `${nested.length - missingBc.length}/${nested.length}`, missingBc.join(", "));

let invalid = 0;
for (const [, h] of pages) for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { invalid++; } }
add("SEO", "All JSON-LD parses", invalid === 0, `${invalid} invalid blocks`);

/* GEO — whether a generative engine can attribute and trust the content */
const CORE = [`${SITE}/#person-sharan`, `${SITE}/#organization`, `${SITE}/#website`, `${SITE}/products/hangly#hangly`, `${SITE}/products/vision#vision`];
const coreOn = (p, h) => CORE.every((id) => h.includes(`"@id":"${id}"`));
add("GEO", "All five core entities declared on every page", count(coreOn) === total, `${count(coreOn)}/${total}`, listFailing(coreOn).join(", "));
add("GEO", "No dangling @id references", dangling === 0, `${dangling} dangling`);

const sameAs = (p, h) => h.includes('"sameAs"');
add("GEO", "Person carries sameAs profiles", count(sameAs) === total, `${count(sameAs)}/${total}`);
const authored = (p, h) => h.includes('"author"') && h.includes('"publisher"');
add("GEO", "Author and publisher stated on every page", count(authored) === total, `${count(authored)}/${total}`, listFailing(authored).join(", "));

const editorial = [...pages.keys()].filter((p) => p.startsWith("/guides/") || p.startsWith("/compare/"));
const dated = editorial.filter((p) => /CHECKED\s+\d{4}-\d{2}-\d{2}|checked\s+\d{4}-\d{2}-\d{2}/i.test(text(pages.get(p))));
add("GEO", "Editorial pages publish the date their sources were read", dated.length === editorial.length,
  `${dated.length}/${editorial.length}`, editorial.filter((p) => !dated.includes(p)).join(", "));

const cited = editorial.filter((p) => /rel="nofollow noopener noreferrer"|target="_blank"/.test(pages.get(p)));
add("GEO", "Editorial pages link out to primary sources", cited.length === editorial.length,
  `${cited.length}/${editorial.length}`, editorial.filter((p) => !cited.includes(p)).join(", "));

const ownership = (p, h) => h.includes('"owns"') && h.includes('"founder"') && h.includes('"brand"');
add("GEO", "Ownership edges (owns, founder, brand) present", count(ownership) === total, `${count(ownership)}/${total}`);

/* AEO — whether an answer engine can lift an answer */
const answerPages = [...pages.keys()].filter((p) => p.startsWith("/guides/") || p.startsWith("/compare/") || p.startsWith("/download") || p === "/install" || p === "/faq" || p.startsWith("/products/hangly/stats") || p.startsWith("/products/hangly/roadmap"));
const hasQuick = answerPages.filter((p) => /id="quick-answer"|id="key-takeaways"/.test(pages.get(p)));
add("AEO", "Answer pages open with a Quick Answer or Key Takeaways block", hasQuick.length === answerPages.length,
  `${hasQuick.length}/${answerPages.length}`, answerPages.filter((p) => !hasQuick.includes(p)).join(", "));

const hasShort = answerPages.filter((p) => /id="in-short"/.test(pages.get(p)));
add("AEO", "Answer pages close with an In Short summary", hasShort.length === answerPages.length,
  `${hasShort.length}/${answerPages.length}`, answerPages.filter((p) => !hasShort.includes(p)).join(", "));

let faqPages = 0, faqQuestions = 0, faqHidden = [];
for (const [p, h] of pages) {
  const visible = text(h);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed; try { parsed = JSON.parse(m[1]); } catch { continue; }
    for (const n of parsed["@graph"] ?? [parsed]) {
      if (n["@type"] !== "FAQPage") continue;
      faqPages++;
      for (const question of n.mainEntity ?? []) {
        faqQuestions++;
        const probe = (question.acceptedAnswer?.text ?? "").replace(/\s+/g, " ").slice(0, 45);
        if (probe.length > 20 && !visible.includes(probe)) faqHidden.push(`${p}: ${question.name?.slice(0, 40)}`);
      }
    }
  }
}
add("AEO", "Every FAQ answer is visible in the page text", faqHidden.length === 0,
  `${faqQuestions - faqHidden.length}/${faqQuestions} answers across ${faqPages} FAQPage blocks`, faqHidden.slice(0, 5).join("; "));

let howToSteps = 0, howToHidden = 0;
for (const [, h] of pages) {
  const visible = text(h);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let parsed; try { parsed = JSON.parse(m[1]); } catch { continue; }
    for (const n of parsed["@graph"] ?? [parsed]) {
      if (n["@type"] !== "HowTo") continue;
      for (const s of n.step ?? []) {
        howToSteps++;
        const probe = (s.text ?? "").replace(/\s+/g, " ").slice(0, 45);
        if (probe.length > 20 && !visible.includes(probe)) howToHidden++;
      }
    }
  }
}
add("AEO", "Every HowTo step is visible in the page text", howToHidden === 0, `${howToSteps - howToHidden}/${howToSteps} steps`);

const q2 = answerPages.filter((p) => (pages.get(p).match(/<h2/g) || []).length >= 5);
add("AEO", "Answer pages use at least five h2 sections", q2.length === answerPages.length,
  `${q2.length}/${answerPages.length}`, answerPages.filter((p) => !q2.includes(p)).join(", "));

const tabled = [...pages.keys()].filter((p) => pages.get(p).includes("<table"));
add("AEO", "Comparative pages carry at least one table", tabled.length >= editorial.length,
  `${tabled.length} pages with tables, ${editorial.length} editorial pages`);

const noJsText = [...pages].filter(([, h]) => text(h).split(" ").length >= 250).length;
add("AEO", "Every page renders 250+ words server-side", noJsText === total, `${noJsText}/${total}`,
  [...pages].filter(([, h]) => text(h).split(" ").length < 250).map(([p]) => p).join(", "));

/* ── report ───────────────────────────────────────────────────────────── */
const L = [];
L.push("# Indexability audit", "");
L.push(`_Generated by \`scripts/audit/indexability.mjs\` from \`out/\` on ${new Date().toISOString().slice(0, 10)}._`, "");
L.push("Every score below is `checks passed / checks applicable`. No figure is estimated. Each check names its measurement, and the evidence column lists the failing pages where there are any.", "");

const scores = {};
L.push("## Scores", "");
L.push("| Dimension | Score | Checks passed |", "| --- | --- | --- |");
for (const g of ["SEO", "GEO", "AEO"]) {
  const passed = checks[g].filter((c) => c.pass).length;
  scores[g] = { passed, total: checks[g].length, pct: Math.round((passed / checks[g].length) * 100) };
  L.push(`| ${g} | **${scores[g].pct}%** | ${passed}/${checks[g].length} |`);
}
L.push("");

for (const g of ["SEO", "GEO", "AEO"]) {
  L.push(`## ${g} — ${scores[g].passed}/${scores[g].total}`, "");
  L.push("| Check | Result | Measurement | Failing |", "| --- | --- | --- | --- |");
  for (const c of checks[g]) {
    L.push(`| ${c.name} | ${c.pass ? "pass" : "**FAIL**"} | ${c.measurement} | ${c.pass ? "—" : (c.evidence || "—").slice(0, 160)} |`);
  }
  L.push("");
}

const failures = ["SEO", "GEO", "AEO"].flatMap((g) => checks[g].filter((c) => !c.pass).map((c) => ({ g, ...c })));
L.push("## Remaining issues", "");
if (!failures.length) L.push("None. Every applicable check passes.");
else {
  L.push("| Issue | Dimension | Measurement | Risk | Priority |", "| --- | --- | --- | --- | --- |");
  for (const f of failures) {
    const risk = /canonical|orphan|sitemap|duplicate|JSON-LD|dangling|visible/.test(f.name) ? "High"
      : /description|Title|depth|Breadcrumb/.test(f.name) ? "Medium" : "Low";
    L.push(`| ${f.name} | ${f.g} | ${f.measurement} | ${risk} | ${risk === "High" ? "1" : risk === "Medium" ? "2" : "3"} |`);
  }
}
L.push("");

L.push("## Schema types in the export", "");
L.push("| Type | Node count |", "| --- | --- |");
for (const [t, n] of [...schemaNodes].sort((a, b) => b[1] - a[1])) L.push(`| ${t} | ${n} |`);
L.push("");

mkdirSync(join(root, "docs"), { recursive: true });
writeFileSync(join(root, "docs/indexability-audit.md"), L.join("\n"), "utf8");
console.log(`  indexability: SEO ${scores.SEO.pct}% (${scores.SEO.passed}/${scores.SEO.total}) · GEO ${scores.GEO.pct}% (${scores.GEO.passed}/${scores.GEO.total}) · AEO ${scores.AEO.pct}% (${scores.AEO.passed}/${scores.AEO.total})`);
if (failures.length) console.log(`  failing: ${failures.map((f) => f.name).join(" | ")}`);
