import Link from "next/link";
export function Footer() {
  return (
    <footer className="hub-footer">
      <Link href="/" className="wordmark">
        SHARAN CREATED THIS<span className="red">.</span>
      </Link>
      <span>Independent mind. Infinite possibilities.</span>
      <span>© {new Date().getFullYear()} Sharan</span>
      <a href="#top">Back to top ↑</a>
    </footer>
  );
}
