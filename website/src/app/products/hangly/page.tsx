import PageMotion from "@/components/hangly/PageMotion";
import Hero from "@/components/hangly/Hero";
import Stats from "@/components/hangly/Stats";
import Features from "@/components/hangly/Features";
import Collections from "@/components/hangly/Collections";
import HowItWorks from "@/components/hangly/HowItWorks";
import Demo from "@/components/hangly/Demo";
import Creator from "@/components/hangly/Creator";
import CTA from "@/components/hangly/CTA";
import Footer from "@/components/hangly/Footer";
import { PlatformSheet } from "@/components/hangly/Download";
import { BreadcrumbJsonLd, SoftwareApplicationJsonLd } from "@/components/JsonLd";
import { PAGES, absoluteUrl } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: "Hangly", path: PAGES.hangly.path },
        ]}
      />
      <SoftwareApplicationJsonLd
        app={{
          name: "Hangly",
          description: PAGES.hangly.description,
          url: absoluteUrl(PAGES.hangly.path),
          // Both, because the same product page now serves both downloads.
          operatingSystem: ["macOS 14", "Windows 10"],
          applicationCategory: "DesktopEnhancementApplication",
          // The macOS version, which is the mature one. Windows is still 0.9.x
          // and claiming it here would understate the product.
          softwareVersion: "2.0.0",
          downloadUrl: absoluteUrl("/products/hangly/download"),
          screenshot: absoluteUrl(PAGES.hangly.image),
        }}
      />
      <PageMotion />
      <a className="skip-link" href="#features">
        Skip to content
      </a>
      <main>
        <Hero />
        <Stats />
        <Features />
        <Collections />
        <HowItWorks />
        <Demo />
        <Creator />
        <CTA />
      </main>
      <Footer />
      <PlatformSheet />
    </>
  );
}
