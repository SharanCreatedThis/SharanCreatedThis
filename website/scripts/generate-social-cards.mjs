import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = join(import.meta.dirname, "..");
const output = join(root, "public", "og");
const width = 1200;
const height = 630;

const esc = value => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
const wrap = (value, limit = 28) => {
  const words = value.split(/\s+/);
  const lines = [""];
  for (const word of words) {
    const line = lines.at(-1);
    if (`${line} ${word}`.trim().length > limit && line) lines.push(word);
    else lines[lines.length - 1] = `${line} ${word}`.trim();
  }
  return lines.slice(0, 3);
};

async function charm(name, x, y, size) {
  // These lossless PNG layers are committed in `public/og/charm-layers`.
  // The source SVGs embed WebP artwork, which Linux's SVG renderer cannot
  // consistently decode during Cloudflare builds.
  const source = join(output, "charm-layers", `${name}.png`);
  const image = await sharp(await readFile(source)).resize(size, size, { fit: "contain" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // The macOS export preserves a few opaque, pure-black padding bands from
  // embedded source artwork. Removing only #000 keeps intentional dark detail.
  for (let i = 0; i < image.data.length; i += 4) {
    if (image.data[i] < 3 && image.data[i + 1] < 3 && image.data[i + 2] < 3) image.data[i + 3] = 0;
  }
  return { input: image.data, raw: image.info, left: x, top: y };
}

async function card({ file, kicker, title, description, accent = "#ff7a1a", charms = [], kind = "story" }) {
  const titleLines = wrap(title, 21);
  const detailLines = wrap(description, 54).slice(0, 2);
  const charmLayers = await Promise.all(charms.map((name, index) => charm(name, 760 + index * 126, 40 + (index % 2) * 45, 240)));
  const motif = kind === "vision"
    ? `<circle cx="925" cy="315" r="178" fill="none" stroke="#85c8ff" stroke-opacity=".22" stroke-width="2"/><circle cx="925" cy="315" r="116" fill="none" stroke="#85c8ff" stroke-opacity=".16" stroke-width="2"/><path d="M810 315h230M925 200v230" stroke="#85c8ff" stroke-opacity=".2" stroke-width="2"/>`
    : kind === "portfolio"
      ? `<rect x="790" y="90" width="300" height="410" rx="8" fill="none" stroke="#f7e7c4" stroke-opacity=".25" stroke-width="2" transform="rotate(8 940 295)"/><circle cx="970" cy="285" r="126" fill="none" stroke="#f7e7c4" stroke-opacity=".18" stroke-width="2"/>`
      : kind === "compare"
        ? `<path d="M770 425h330" stroke="#ffffff" stroke-opacity=".18" stroke-width="3"/><circle cx="845" cy="344" r="56" fill="${accent}" fill-opacity=".25"/><circle cx="1020" cy="344" r="56" fill="#ffffff" fill-opacity=".12"/><path d="M932 210v205" stroke="#ffffff" stroke-opacity=".25" stroke-width="3"/>`
        : `<circle cx="956" cy="295" r="255" fill="none" stroke="#ffffff" stroke-opacity=".1" stroke-width="2"/><circle cx="956" cy="295" r="190" fill="none" stroke="${accent}" stroke-opacity=".22" stroke-width="2"/>`;
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="glow" x1="0" x2="1"><stop stop-color="${accent}" stop-opacity=".34"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs>
    <rect width="1200" height="630" fill="#0b0b0d"/><rect width="1200" height="630" fill="url(#glow)" opacity=".7"/>
    <path d="M0 508C250 438 534 609 778 478S1042 313 1200 368V630H0Z" fill="${accent}" fill-opacity=".08"/>
    ${motif}
    <g font-family="Arial, sans-serif"><text x="76" y="88" fill="${accent}" font-size="21" font-weight="700">✦</text><text x="110" y="86" fill="#f5f0e8" font-size="18" font-weight="700" letter-spacing="1.5">SHARAN CREATED THIS</text><text x="76" y="164" fill="${accent}" font-size="13" font-weight="700" letter-spacing="3">${esc(kicker.toUpperCase())}</text>
    ${titleLines.map((line, index) => `<text x="76" y="${235 + index * 72}" fill="#ffffff" font-size="64" font-weight="700" letter-spacing="-2">${esc(line)}</text>`).join("")}
    ${detailLines.map((line, index) => `<text x="79" y="${470 + index * 31}" fill="#c4beb4" font-size="22">${esc(line)}</text>`).join("")}
    <path d="M76 565H1124" stroke="#ffffff" stroke-opacity=".14"/><text x="76" y="599" fill="#a49b90" font-size="16">sharancreatedthis.in</text><text x="1124" y="599" fill="#a49b90" font-size="16" text-anchor="end">MADE IN INDIA</text></g>
  </svg>`;
  const path = join(output, file);
  await mkdir(dirname(path), { recursive: true });
  await sharp(Buffer.from(svg)).composite(charmLayers).png().toFile(path);
}

const cards = [
  ["home.png", "CREATIVE STUDIO", "Sharan Created This", "Films, photography and independent software.", "#ff7a1a", [], "story"],
  ["about.png", "THE STORY", "A maker's practice", "Film, photography and software made with care.", "#e9a75e", [], "story"],
  ["portfolio.png", "SELECTED WORK", "Stories in motion", "Films, photography and creative direction.", "#e7c17d", [], "portfolio"],
  ["products.png", "INDEPENDENT SOFTWARE", "Small ideas. Real software.", "Thoughtful desktop experiences for every day.", "#ff7a1a", ["nazar", "spiderMan"], "story"],
  ["contact.png", "LET'S TALK", "Make something memorable", "Film, photography and product collaborations.", "#ff7a1a", [], "story"],
  ["vision.png", "FACE RECOGNITION", "Vision", "A more natural way into your Mac.", "#73bfff", [], "vision"],
  ["vision-docs.png", "GETTING STARTED", "Vision documentation", "Privacy, setup and recognition guidance.", "#73bfff", [], "vision"],
  ["hangly.png", "80+ CHARMS · macOS + WINDOWS", "Hangly", "Digital charms with real swinging physics.", "#ff7a1a", ["spiderMan", "nazar", "hamsa"], "story"],
  ["hangly-privacy.png", "PRIVACY", "Hangly, quietly personal", "What leaves your desktop, and what never does.", "#d7a75e", ["nazar"], "story"],
  ["faq.png", "HANGY FAQ", "Answers for your desktop", "Everything you need to know about Hangly.", "#ff7a1a", ["nazar", "hamsa"], "story"],
  ["changelog.png", "RELEASE NOTES", "What changed", "Every Hangly and Vision release in one place.", "#bc89ff", ["spiderMan"], "story"],
  ["guides.png", "GUIDES", "Choose your kind of magic", "Independent advice for desktop charm apps.", "#ff7a1a", ["nazar", "spiderMan"], "story"],
  ["compare.png", "HONEST COMPARISONS", "Hangly, compared", "Clear answers for desktop charm apps.", "#ff7a1a", ["nazar"], "compare"],
  ["download.png", "DOWNLOAD HANGLY", "A little magic, ready", "Download Hangly for macOS and Windows.", "#ff7a1a", ["spiderMan", "nazar"], "story"],
  ["download-mac.png", "DOWNLOAD FOR macOS", "Hangly for your Mac", "Digital charms with real swinging physics.", "#d8b06a", ["nazar", "hamsa"], "story"],
  ["download-windows.png", "DOWNLOAD FOR WINDOWS", "Hangly for your PC", "Digital charms with real swinging physics.", "#53a7ff", ["spiderMan", "nazar"], "story"],
  ["install.png", "INSTALL HANGLY", "A little magic, ready", "Download Hangly for macOS and Windows.", "#ff7a1a", ["spiderMan", "nazar"], "story"],
  ["hangly-roadmap.png", "HANGLY ROADMAP", "What ships next", "The next chapters for Hangly.", "#ff7a1a", ["dreamCatcher"], "story"],
  ["hangly-stats.png", "HANGLY BY THE NUMBERS", "Built in the details", "Published figures for charms, collections and builds.", "#ff7a1a", ["nazar", "spiderMan"], "story"],
];

for (const [file, kicker, title, description, accent, charms, kind] of cards) await card({ file, kicker, title, description, accent, charms, kind });
for (const slug of ["best-desktop-charm-apps-for-mac", "best-desktop-pets-for-mac", "best-mac-customization-apps", "best-menu-bar-customisation-apps-for-mac", "lucky-dangle-alternatives", "screen-dangle-alternatives", "charmly-alternatives", "desktop-goose-alternatives"]) await card({ file: `guides/${slug}.png`, kicker: "HANGLY GUIDE", title: slug.replaceAll("-", " "), description: "Clear, independent guidance for your desktop.", charms: ["nazar", "spiderMan"] });
for (const slug of ["lucky-dangle", "screen-dangle", "danglejoy", "charmly", "shimeji", "desktop-goose", "runcat", "dockling"]) await card({ file: `compare/${slug}.png`, kicker: "HANGLY COMPARISON", title: `Hangly vs ${slug.replaceAll("-", " ")}`, description: "A clear, independent comparison.", charms: ["nazar"], kind: "compare" });

console.log("  social cards: generated premium cards for all route families");
