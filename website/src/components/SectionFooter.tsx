/**
 * The footer for every page outside the hub and outside Hangly's own page.
 *
 * It exists for two reasons that happen to be the same reason. A reader who
 * reaches the bottom of a comparison wants somewhere to go, and a page with no
 * inbound links is a page an engine finds only through the sitemap and treats
 * accordingly. Before this, /compare, /guides and /faq rendered a bare <main>
 * with no footer at all, so every link between those sections had to come from
 * body copy.
 *
 * Listing the whole set on every page of the set is what holds crawl depth at
 * two from the home page, and is why the download and install pages have
 * double-figure inbound links on the day they ship rather than in six months.
 */

import Link from "next/link";

const GROUPS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Get Hangly",
    links: [
      { label: "Download", href: "/download" },
      { label: "For Mac", href: "/download/mac" },
      { label: "For Windows", href: "/download/windows" },
      { label: "How to install", href: "/install" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Decide",
    links: [
      { label: "Compare", href: "/compare" },
      { label: "Guides", href: "/guides" },
      { label: "FAQ", href: "/faq" },
      { label: "Charm apps for Mac", href: "/guides/best-desktop-charm-apps-for-mac" },
      { label: "Desktop pets for Mac", href: "/guides/best-desktop-pets-for-mac" },
    ],
  },
  {
    heading: "The apps",
    links: [
      { label: "Hangly", href: "/products/hangly" },
      { label: "Vision", href: "/products/vision" },
      { label: "All products", href: "/products" },
      { label: "Hangly privacy", href: "/products/hangly/privacy" },
    ],
  },
  {
    heading: "Sharan Created This",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SectionFooter() {
  return (
    <footer className="section-footer">
      <div className="wrap section-footer-inner">
        {GROUPS.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2>{group.heading}</h2>
            <ul>
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="wrap section-footer-bottom">
        <span>© {new Date().getFullYear()} Sharan Created This</span>
        <span>Made in India <span className="orange">✦</span></span>
      </div>
    </footer>
  );
}
