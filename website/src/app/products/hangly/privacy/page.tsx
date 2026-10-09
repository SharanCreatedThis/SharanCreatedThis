import { pageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PAGES } from "@/lib/seo";
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/hangly/shared';
export const metadata = pageMetadata("hanglyPrivacy");

// What Hangly sends, from each app's PRIVACY.md and its code (2.3.1: RegistrySync, the analytics and crash
// reporters, the update and announcement checks). If the apps change what they send, this page changes first.
export default function Privacy() { return <>
  <BreadcrumbJsonLd trail={[{ name: "Home", path: "/" },{ name: "Products", path: "/products" },{ name: "Hangly", path: "/products/hangly" },{ name: "Privacy", path: PAGES.hanglyPrivacy.path }]} />
  <main className="wrap legal"><header className="legal-header"><Logo/><a className="button button-quiet" href="/products/hangly/"><ArrowLeft size={16}/>Back to Hangly</a></header>
  <p className="eyebrow">PRIVACY, IN PLAIN SIGHT.</p><h1>Privacy<span className="orange">.</span></h1>
  <p className="legal-lead">Hangly needs no account, and it never reads your screen, your files or other apps, or uploads the images you turn into charms. It does send its developer a few things, on macOS and on Windows alike. All of them are on this page.</p>

  <section><h2>Your installation&apos;s record</h2>
  <p>Every copy of Hangly registers itself with its developer, in Google Firebase, so the developer can see how many people use Hangly, where, on what, and for how long. It is part of using Hangly: there is no switch to turn it off. The record holds:</p>
  <ul>
    <li><strong>An installation ID</strong>: a random identifier made the first time Hangly runs. It never changes and is used for nothing else.</li>
    <li><strong>Your nickname</strong>: what you typed when Hangly asked what to call you, never your account or computer name. You can change it in Customize → Appearance.</li>
    <li><strong>Your city, region and country</strong>, worked out from your internet connection&apos;s address by Hangly&apos;s server. The address itself is never stored or logged, and nothing more exact than a city is kept.</li>
    <li><strong>Your platform, processor and versions</strong>: of macOS or Windows, and of Hangly, including the version it started on and when it updated.</li>
    <li><strong>When Hangly was first installed and last used</strong>, how many days it has been used, and how many times it has crashed.</li>
  </ul>
  <p>Nothing is sent before you give a nickname. After that, the record is updated when something changes and at most once a day to say Hangly is still in use. On Windows, uninstalling sends one last update marking the record uninstalled. Customize → About → Installation shows what your copy holds. To have your record deleted, ask Sharan through the <a href="/contact">contact page</a>.</p></section>

  <section><h2>Usage events</h2>
  <p>Hangly reports a few events to Google Analytics (Firebase Analytics on macOS), tagged with the installation ID and nothing else, never your nickname or city: that Hangly started or was updated, which charm and rope you choose (a charm you made yourself is reported only as &ldquo;custom&rdquo;), that you finished the welcome or opened the support page, that Hangly ran today, how an update went, and whether a card under the charm was shown, opened or dismissed (by its ID, never its text). Nothing else you do in Hangly is reported.</p></section>

  <section><h2>Crash reports</h2>
  <p>When Hangly crashes, it sends the error and where in the code it happened, with the app and system versions and the installation ID: through Firebase Crashlytics on macOS, and to Hangly&apos;s Firebase project on Windows, where your user folder and account name are removed from the text first.</p></section>

  <section><h2>Updates and announcements</h2>
  <p>About every hour Hangly checks for a new version: on macOS by fetching its update feed from this site, on Windows by asking GitHub, where its releases are published. The check carries nothing about you or your copy; like any web request, it comes with an IP address. Every Mac update is signed and checked against a key built into the app before it installs.</p>
  <p>Every fifteen minutes or so Hangly also asks its server whether there is news to show under the charm, such as a new collection. That request carries only your platform: no installation ID, nickname or version.</p></section>

  <section><h2>Never collected</h2>
  <ul>
    <li>Your email address, your account name or your computer&apos;s name.</li>
    <li>Your IP address, or any location more exact than your city.</li>
    <li>Images you turn into charms, or anything about them. They stay on your computer.</li>
    <li>Where your charm sits on screen, keystrokes, screen contents, or what you do in other apps.</li>
  </ul>
  <p>Hangly shows no advertising, sells no data, and makes no network requests beyond the ones above.</p></section>

  <section><h2>Permissions</h2><p>Hangly asks for no special permissions on either platform. It draws its own transparent window, and clicks pass through it everywhere but the charm.</p></section>

  <section><h2>Questions</h2><p>If this page does not answer a privacy question, ask Sharan through the <a href="/contact">contact page</a>. This page is updated before Hangly changes what it sends, not after.</p></section>
  <p className="legal-foot">Hangly is an independent desktop app for macOS and Windows. Not affiliated with Apple or Microsoft.</p></main></> }
