import PageMotion from "@/components/hangly/PageMotion";
import Hero from "@/components/hangly/Hero";
import Stats from "@/components/hangly/Stats";
import Features from "@/components/hangly/Features";
import Collections from "@/components/hangly/Collections";
import HowItWorks from "@/components/hangly/HowItWorks";
import Demo from "@/components/hangly/Demo";
import Creator from "@/components/hangly/Creator";
import Compare from "@/components/hangly/Compare";
import Faq from "@/components/hangly/Faq";
import CTA from "@/components/hangly/CTA";
import Footer from "@/components/hangly/Footer";
import { PlatformSheet } from "@/components/hangly/Download";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
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
        <Compare />
        <Faq />
        <CTA />
      </main>
      <Footer />
      <PlatformSheet />
    </>
  );
}
