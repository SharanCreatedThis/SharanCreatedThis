import PageMotion from "@/components/hangly/PageMotion";
import Hero from "@/components/hangly/Hero";
import Stats from "@/components/hangly/Stats";
import WhyHangly from "@/components/hangly/WhyHangly";
import Demo from "@/components/hangly/Demo";
import CreatorStudio from "@/components/hangly/CreatorStudio";
import Collections from "@/components/hangly/Collections";
import RopeStudio from "@/components/hangly/RopeStudio";
import Setup from "@/components/hangly/Setup";
import Creator from "@/components/hangly/Creator";
import CommunityUpdates from "@/components/hangly/CommunityUpdates";
import Faq from "@/components/hangly/Faq";
import CTA from "@/components/hangly/CTA";
import Footer from "@/components/hangly/Footer";
import MobileDownloadCta from "@/components/hangly/MobileDownloadCta";
import { PlatformSheet } from "@/components/hangly/Download";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PAGES, absoluteUrl } from "@/lib/seo";
import { HANGLY_MAC, HANGLY_PRODUCT, HANGLY_WINDOWS } from "@/lib/hangly-product";
import { pageMetadata } from "@/lib/metadata";
import { hanglyLanguageAlternates } from "@/data/hangly/locales";

// The English page names its sixteen translations (/<code>/hangly), as each of them names it: hreflang is reciprocal.
const base = pageMetadata("hangly");
export const metadata = { ...base, alternates: { ...base.alternates, languages: hanglyLanguageAlternates() } };

export default function Home() {
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "Create a custom Hangly charm", totalTime: "PT1M", step: ["Upload an image", "Remove its background", "Choose a rope", "Hang it on your desktop"].map((name, position) => ({ "@type": "HowToStep", position: position + 1, name })) };
  return <>
    <BreadcrumbJsonLd trail={[{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: "Hangly", path: PAGES.hangly.path }]} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo).replace(/</g, "\\u003c") }} />
    <PageMotion /><a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content"><Hero /><Stats /><CreatorStudio /><Collections /><RopeStudio /><Demo /><Creator /><WhyHangly /><Setup /><CommunityUpdates /><Faq /><CTA /></main>
    <Footer /><PlatformSheet /><MobileDownloadCta />
  </>;
}
