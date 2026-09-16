import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharan Created This | Personal Brand & Products",
  description: "Filmmaker • Photographer • Designer • Developer",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#09090b] text-neutral-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
