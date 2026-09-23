/**
 * The live site, checked the way an outside service sees it.
 *
 * Everything above answers "can this machine reach the dashboard". This answers
 * the question those dashboards are about: is the thing they measure actually
 * serving what it should. It needs no credentials, which makes it the one check
 * that always runs.
 */

import { SITE, STATUS, request, result } from "./lib.mjs";

const ENDPOINTS = [
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "application/xml"],
  ["/manifest.webmanifest", "application/manifest+json"],
  ["/favicon.ico", null],
];

export async function check() {
  const out = [];

  for (const [path, type] of ENDPOINTS) {
    const response = await request(SITE + path);
    const typeOk = !type || (response.ok && true);
    out.push(result(`Site · ${path}`, response.ok && typeOk ? STATUS.ok : STATUS.error,
      response.ok ? `${response.status}` : `${response.status || "unreachable"}`));
  }

  const sitemap = await request(`${SITE}/sitemap.xml`);
  const urls = [...(sitemap.text ?? "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const lastmod = sitemap.text?.match(/<lastmod>([^<]+)</)?.[1];
  out.push(result("Site · sitemap contents", urls.length ? STATUS.ok : STATUS.error,
    `${urls.length} URLs, lastmod ${lastmod?.slice(0, 10) ?? "absent"}`));

  // The analytics ids actually deployed, rather than the ones in the env file.
  const home = await request(SITE);
  const ga = home.text?.match(/G-[A-Z0-9]{8,}/)?.[0];
  out.push(result("Site · deployed GA4 id", ga ? STATUS.ok : STATUS.error, ga ?? "no measurement id in the page"));

  // Clarity is injected by next/script after hydration, so its id lives in a
  // JavaScript chunk rather than the HTML. Looking for it in the page source
  // reports a working integration as broken, and a health check that does that
  // is worse than none: it teaches you to ignore it.
  //
  // The assertion is deliberately exact — does the deployed bundle contain the
  // id that is configured — rather than a pattern match for "something that
  // looks like an id". A loose pattern here matched the tail of the GA
  // measurement id and cheerfully reported the wrong value as a success.
  const expected = process.env.NEXT_PUBLIC_CLARITY_ID;
  if (!expected) {
    out.push(result("Site · deployed Clarity", STATUS.unconfigured, "NEXT_PUBLIC_CLARITY_ID is not set locally, so there is nothing to compare against"));
  } else {
    const chunks = [...new Set([...(home.text ?? "").matchAll(/\/_next\/static\/chunks\/[\w/.-]+\.js/g)].map((m) => m[0]))];
    let found = false;
    for (const chunk of chunks) {
      const body = await request(SITE + chunk);
      if (body.text?.includes(expected)) { found = true; break; }
    }
    out.push(result("Site · deployed Clarity", found ? STATUS.ok : STATUS.error,
      found ? `${expected} present in the deployed bundle` : `${expected} not found in ${chunks.length} chunks`));
  }

  // The three download routes, which are the ones that break quietly.
  for (const path of ["/products/hangly/download", "/products/hangly/download/windows-x64", "/products/vision/download"]) {
    const response = await request(SITE + path, { method: "HEAD", redirect: "manual" });
    const location = response.status >= 300 && response.status < 400;
    out.push(result(`Site · ${path}`, location || response.ok ? STATUS.ok : STATUS.error,
      location ? `${response.status} redirect` : `${response.status}`));
  }

  const key = process.env.INDEXNOW_KEY;
  if (key) {
    const file = await request(`${SITE}/${key}.txt`);
    out.push(result("Site · IndexNow key file", file.ok && file.text?.trim() === key ? STATUS.ok : STATUS.error,
      file.ok ? (file.text?.trim() === key ? "served and matches" : "served but does not match the key") : `${file.status}`));
  }

  return out;
}
