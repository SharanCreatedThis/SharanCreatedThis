import type { NextConfig } from "next";

/**
 * Static export, which is what this site actually is: no API routes, no
 * middleware, no revalidation, no dynamic segments — every page prerenders.
 *
 * The download redirects used to live here, read out of the Sparkle feed at build
 * time. `output: "export"` ignores redirects() entirely, so they moved to
 * scripts/generate-download-redirects.mjs, which runs before every build and
 * writes both public/_redirects (Cloudflare Pages) and vercel.json (Vercel) from
 * the same feed. See that file.
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
