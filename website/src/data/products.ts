export interface Product {
  id: string;
  title: string;
  tagline: string;
  description: string;
  buttonText: string;
  link: string;
  iconName?: string;
  badge?: string;
  status: "available" | "coming_soon";
  gradient: string;
  /**
   * A second, deeper link for products that have one.
   *
   * This exists for crawl reach, not decoration. /products/vision/docs had a
   * single inbound link in the whole site and sat at "Discovered - currently
   * not indexed" — Google knew the URL from the sitemap and had never fetched
   * it, which is what crawl priority looks like when nothing points at a page.
   * A sitemap entry announces a URL; internal links are what argue it matters.
   */
  secondary?: { label: string; link: string };
}

export const products: Product[] = [
  {
    id: "hangly",
    title: "Hangly",
    tagline: "Desktop Charm Companion",
    description: "Physics-powered desktop charms for macOS and Windows. Interactive, charming, and responsive workspace accessories.",
    buttonText: "Open Hangly",
    link: "/products/hangly",
    secondary: { label: "Privacy", link: "/products/hangly/privacy" },
    badge: "Available Now",
    status: "available",
    gradient: "from-amber-500/20 via-orange-500/10 to-amber-900/30",
  },
  {
    id: "vision",
    title: "Vision",
    tagline: "Mac Face Unlock Experience",
    description: "Face ID-inspired security and unlocking experience for Mac. Instant authentication with beautiful notch & screen UI.",
    buttonText: "Open Vision",
    link: "/products/vision",
    secondary: { label: "Documentation", link: "/products/vision/docs" },
    badge: "Available Now",
    status: "available",
    gradient: "from-blue-500/20 via-cyan-500/10 to-indigo-900/30",
  },
];
