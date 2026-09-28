import { pageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PAGES } from "@/lib/seo";
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/hangly/shared';
export const metadata = pageMetadata("hanglyPrivacy");

export default function Privacy() { return <>
  <BreadcrumbJsonLd trail={[{ name: "Home", path: "/" },{ name: "Products", path: "/products" },{ name: "Hangly", path: "/products/hangly" },{ name: "Privacy", path: PAGES.hanglyPrivacy.path }]} />
  <main className="wrap legal"><header className="legal-header"><Logo/><a className="button button-quiet" href="/products/hangly/"><ArrowLeft size={16}/>Back to Hangly</a></header>
  <p className="eyebrow">PRIVACY, IN PLAIN SIGHT.</p><h1>Privacy<span className="orange">.</span></h1><p className="legal-lead">Hangly works on macOS and Windows without requiring an account. Your charms, layouts, custom artwork, and settings stay on your device.</p>
  <section><h2>Your desktop is yours</h2><p>Hangly is made to personalise a desktop, not profile a person. It does not need an account, and it does not upload your charms, layouts, custom artwork, or settings to a server.</p><ul><li>No account is required to use Hangly.</li><li>Custom images and the charms made from them remain on your device.</li><li>Hangly does not read screen contents, keystrokes, files, or other applications.</li></ul></section>
  <section><h2>Network activity</h2><p>Hangly only uses the network for product-related tasks. It does not load advertising, sell personal data, or use tracking pixels in the app.</p><h3>Updates</h3><p>Hangly can check for and download signed app updates so releases arrive quietly. A normal network request necessarily includes an IP address; it does not include your charm library, layouts, custom artwork, or settings.</p><h3>Optional diagnostics</h3><p>If diagnostics are enabled in the app, they help us understand app version, operating system, and stability. They are optional and are not used to inspect what is on your desktop.</p><h3>Optional features</h3><p>Any feature that connects to a network service will explain what it needs before you use it. Core charm physics, layouts, and Creator Studio do not depend on an account.</p></section>
  <section><h2>Permissions and controls</h2><p>Hangly uses native macOS and Windows capabilities and only requests access when a system feature requires it. It is designed to stay click-through and out of the way. You can review relevant controls inside the app and in your operating system settings.</p></section>
  <section><h2>Questions</h2><p>If this page does not answer a privacy question, contact Sharan.created.this through the contact details on the website. We will keep this page updated as Hangly evolves across both platforms.</p></section>
  <p className="legal-foot">Hangly is an independent desktop app for macOS and Windows. Not affiliated with Apple or Microsoft.</p></main></> }
