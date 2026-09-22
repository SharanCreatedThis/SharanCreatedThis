import type { Metadata } from "next";
import Link from "next/link";
import { PAGES } from "@/lib/seo";

/**
 * The 404 page.
 *
 * `robots: noindex` matters more here than the copy does. A static export serves
 * this page with a 200 on some hosts, so a crawler cannot always tell a missing
 * page from a real one by status alone — and a site with a hundred indexable
 * "Not found" pages looks, to an engine, like a site of thin duplicates.
 * `follow` stays on so the links below still pass anyone onward.
 */
export const metadata: Metadata = {
  title: "Not Found · Sharan Created This",
  description: "That page has moved or never existed.",
  robots: { index: false, follow: true },
};

const ELSEWHERE = [PAGES.home, PAGES.portfolio, PAGES.products, PAGES.about, PAGES.contact];

export default function NotFound() {
  return (
    <main className="hub editorial-theme">
      <section className="page-intro section" style={{ minHeight: "70vh" }}>
        <p className="eyebrow">404 · NOTHING HERE</p>
        <h1>
          A little
          <br />
          <span className="muted">lost.</span>
        </h1>
        <p style={{ maxWidth: "46ch" }}>
          That page has moved, or it never existed. No harm done — here is
          everything that definitely does.
        </p>
        <nav aria-label="Site sections" style={{ display: "flex", flexWrap: "wrap", gap: "18px", marginTop: "34px" }}>
          {ELSEWHERE.map((page) => (
            <Link key={page.path} href={page.path} style={{ textDecoration: "underline", textUnderlineOffset: 4 }}>
              {page.path === "/" ? "Home" : page.title.split(/ [·|] /)[0]}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
