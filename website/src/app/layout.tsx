import type { Metadata, Viewport } from "next";
import { GoogleAnalytics, Clarity } from "@/components/Analytics";
import { SiteJsonLd } from "@/components/JsonLd";
import { baseMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = {
  ...baseMetadata,
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

/**
 * Separate from `metadata` because Next requires it there, and the colour has
 * to match the body background exactly: any difference shows as a seam between
 * the address bar and the page while scrolling on mobile.
 */
export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#09090b] text-neutral-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <SiteJsonLd />
        {children}
        <GoogleAnalytics />
        <Clarity />
      </body>
    </html>
  );
}
