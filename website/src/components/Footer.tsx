import Link from "next/link";
export function Footer() {
  return (
    <footer className="hub-footer">
      <Link href="/" className="wordmark">
        SHARAN CREATED THIS<span className="red">.</span>
      </Link>
      <nav className="hub-footer-links" aria-label="More">
        {/* Every hub page reaches the FAQ, the comparisons and the guides in
            one click. That is what holds crawl depth at three from the home
            page, and it is how those sections earn inbound links from pages
            Google already crawls rather than from the sitemap alone. */}
        <Link href="/faq">FAQ</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/guides">Guides</Link>
      </nav>
      <span>Independent mind. Infinite possibilities.</span>
      <span>© {new Date().getFullYear()} Sharan</span>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
