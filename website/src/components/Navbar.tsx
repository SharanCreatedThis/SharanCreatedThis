"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
export const navLinks = [
  { name: "Home", href: "/" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];
export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header
      className={`hub-nav ${scrolled ? "compressed" : ""} ${path === "/" ? (scrolled ? "home-scrolled-nav" : "editorial-nav") : "home-scrolled-nav"}`}
    >
      <Link className="wordmark" href="/" aria-label="Sharan Created This home">
        <span className="brand-symbol">✳</span>
        <span>
          SHARAN
          <br />
          CREATED THIS<span className="red">.</span>
        </span>
      </Link>
      <nav aria-label="Main navigation" className={open ? "is-open" : ""}>
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={path === l.href ? "page" : undefined}
          >
            {l.name}
          </Link>
        ))}
      </nav>
      <Link className="nav-contact" href="/contact">
        Let’s talk <ArrowUpRight size={14} />
      </Link>
      <button
        className="menu-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
