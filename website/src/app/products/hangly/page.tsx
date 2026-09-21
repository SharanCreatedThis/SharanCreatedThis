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

export default function Home() {
  return (
    <>
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
