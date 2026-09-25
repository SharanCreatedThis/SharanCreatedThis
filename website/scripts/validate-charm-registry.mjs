/**
 * Keeps the charm registry and the things it describes from drifting apart.
 *
 * The registry is the source of truth only if nothing can contradict it
 * silently. Four things can, and each one has caused a real problem here
 * before: artwork that no entry describes is how twenty charms became
 * invisible; an entry with no artwork renders a broken image; a collection
 * recorded in two places disagrees the moment one is edited; and a duplicate id
 * makes the join key meaningless.
 *
 * Exits non-zero on any of them, so the build stops rather than shipping.
 *
 * Missing display names, descriptions, meanings and sources are *reported*,
 * not failed. They are authoring gaps rather than integrity failures, and
 * failing the build on them would block every deploy until someone writes
 * seventy-five paragraphs. The readiness report tracks them instead.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

/* The registry is TypeScript; parse the literal rather than importing it, so
   this runs without a TypeScript toolchain in the loop. */
const src = read("src/lib/charms/charm-registry.ts");
const MARKER = "export const CHARMS: Charm[] = ";
// Slice past the marker first — indexOf("[") would otherwise match the "[]" in
// the type annotation — then find the matching close bracket by depth rather
// than by searching for "\n];", which depends on formatting that a reformat
// can silently change.
const body = src.slice(src.indexOf(MARKER) + MARKER.length);
let depth = 0, end = -1;
for (let i = 0; i < body.length; i++) {
  if (body[i] === "[") depth++;
  else if (body[i] === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end === -1) throw new Error("charm-registry.ts: could not find the end of the CHARMS array");
const literal = body.slice(0, end);
const CHARMS = new Function(`return ${literal}`)();

const errors = [];
const warnings = [];

/* ── 1. duplicate ids ─────────────────────────────────────────────────── */
const seen = new Map();
for (const c of CHARMS) {
  if (seen.has(c.id)) errors.push(`duplicate id "${c.id}" at entries ${seen.get(c.id)} and ${CHARMS.indexOf(c)}`);
  else seen.set(c.id, CHARMS.indexOf(c));
}

/* ── 2. artwork without a registry entry ──────────────────────────────── */
const svgs = (dir) => readdirSync(join(root, dir)).filter((f) => f.endsWith(".svg")).map((f) => f.replace(/\.svg$/, ""));
const plain = svgs("public/charms");
const connected = svgs("public/charms/connected");

for (const id of plain) {
  if (!seen.has(id)) {
    errors.push(`public/charms/${id}.svg has no registry entry — it would be invisible, which is how twenty charms already were`);
  }
}

/* ── 3. registry entry without artwork ────────────────────────────────── */
for (const c of CHARMS) {
  if (!existsSync(join(root, "public", c.artworkPath))) {
    errors.push(`${c.id}: artworkPath ${c.artworkPath} does not exist`);
  }
  if (c.connectedArtworkPath && !existsSync(join(root, "public", c.connectedArtworkPath))) {
    errors.push(`${c.id}: connectedArtworkPath ${c.connectedArtworkPath} does not exist`);
  }
  if (!c.connectedArtworkPath && connected.includes(c.id)) {
    errors.push(`${c.id}: connected artwork exists on disk but the registry records null`);
  }
}

/* ── 4. collection assignments must agree with Collections.tsx ────────── */
const collSrc = read("src/components/hangly/Collections.tsx");
const start = collSrc.indexOf("export const collections");
const list = collSrc.slice(start, collSrc.indexOf("\n];", start));
const fromComponent = new Map();
for (const block of list.split(/\n  \{\n/).slice(1)) {
  const collection = (block.match(/name:\s*"([^"]+)"/) || [])[1];
  for (const m of block.matchAll(/\[\s*"([A-Za-z0-9]+)"\s*,\s*"([^"]+)"\s*\]/g)) {
    fromComponent.set(m[1], { collection, displayName: m[2] });
  }
}
for (const c of CHARMS) {
  const actual = fromComponent.get(c.id);
  if (actual && actual.collection !== c.collection) {
    errors.push(`${c.id}: collection disagrees — registry "${c.collection}", Collections.tsx "${actual.collection}"`);
  }
  if (!actual && c.collection !== null) {
    errors.push(`${c.id}: registry records collection "${c.collection}" but Collections.tsx does not list it`);
  }
  if (actual && c.displayName && actual.displayName !== c.displayName) {
    errors.push(`${c.id}: displayName disagrees — registry "${c.displayName}", Collections.tsx "${actual.displayName}"`);
  }
}

/* ── 5. a licensed charm may never be marked page-ready ───────────────── */
for (const c of CHARMS) {
  if (c.licensed && (c.description || c.meaning)) {
    warnings.push(`${c.id}: licensed charm carries authored copy — it must not become an indexable page`);
  }
}

/* ── authoring gaps: reported, never fatal ────────────────────────────── */
const missing = {
  displayName: CHARMS.filter((c) => !c.displayName),
  description: CHARMS.filter((c) => !c.description),
  meaning: CHARMS.filter((c) => !c.meaning),
  sources: CHARMS.filter((c) => !c.sourceUrls.length),
  category: CHARMS.filter((c) => c.category === "unknown"),
};

const ESC = String.fromCharCode(27);
const c = (n, t) => `${ESC}[${n}m${t}${ESC}[0m`;

console.log(`\n  ${c(1, "charm registry")}  ${CHARMS.length} entries, ${plain.length} artwork files\n`);
console.log(`  integrity`);
console.log(`    duplicate ids          ${CHARMS.length - seen.size}`);
console.log(`    artwork without entry  ${plain.filter((id) => !seen.has(id)).length}`);
console.log(`    entry without artwork  ${CHARMS.filter((x) => !existsSync(join(root, "public", x.artworkPath))).length}`);
console.log(`    collection conflicts   ${errors.filter((e) => e.includes("disagrees")).length}`);
console.log(`\n  authoring coverage`);
for (const [field, list] of Object.entries(missing)) {
  const have = CHARMS.length - list.length;
  const pct = Math.round((have / CHARMS.length) * 100);
  console.log(`    ${field.padEnd(14)} ${String(have).padStart(3)}/${CHARMS.length}  ${String(pct).padStart(3)}%`);
}

if (warnings.length) {
  console.log(`\n  ${c(33, `${warnings.length} warning(s)`)}`);
  for (const w of warnings) console.log(`    · ${w}`);
}
if (errors.length) {
  console.log(`\n  ${c(31, `${errors.length} error(s)`)}`);
  for (const e of errors) console.log(`    ✗ ${e}`);
  console.log();
  process.exit(1);
}
console.log(`\n  ${c(32, "registry integrity ok")}\n`);
