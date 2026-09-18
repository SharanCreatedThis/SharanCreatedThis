import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/hangly/shared';

export const metadata: Metadata = {
  title: 'Hangly · Privacy',
  description:
    'What Hangly sends, what it never sends, and how to switch it off. Three things leave your Mac, and two of them are optional.',
};

/**
 * The same document as PRIVACY.md in the app repository, which is private — so this
 * page, rather than a link to GitHub, is what the site and the app point at. Keep the
 * two in step when either changes.
 */
export default function Privacy() {
  return (
    <main className="wrap legal">
      <header className="legal-header">
        <Logo />
        <a className="button button-quiet" href="/products/hangly/">
          <ArrowLeft size={16} />
          Back to Hangly
        </a>
      </header>

      <p className="eyebrow">ALMOST NOTHING LEAVES YOUR MAC</p>
      <h1>Privacy<span className="orange">.</span></h1>
      <p className="legal-lead">
        Hangly is an ornament that hangs on your desktop. It needs almost nothing about you to do
        that, and it collects almost nothing. Three things leave your Mac, all described here, and
        two of them are optional.
      </p>

      <section>
        <h2>Weather</h2>
        <p>
          Off unless you turn it on. When it is on, Hangly asks{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">
            Open-Meteo
          </a>{' '}
          what the weather is in one city, every thirty minutes, so the charm can take on the sky.
        </p>
        <ul>
          <li>
            The city is a <strong>name you can see and change</strong> in Customize → Appearance. It
            is guessed from your Mac&rsquo;s time zone, not from your location.
          </li>
          <li>Hangly does not use Core Location and asks for no location permission.</li>
          <li>
            Open-Meteo requires no account and no API key, so there is nothing to identify the
            request with beyond an IP address, as with any web request.
          </li>
        </ul>
      </section>

      <section>
        <h2>Anonymous analytics</h2>
        <p>
          On by default, and switchable off in <strong>Customize → Appearance → Privacy</strong>.
          Turning it off stops collection immediately and discards the installation identifier.
        </p>
        <p>
          Events are sent to{' '}
          <a href="https://posthog.com" target="_blank" rel="noopener noreferrer">
            PostHog
          </a>{' '}
          (US region). They are batched and sent in the background; if the network is unavailable
          they are queued, and if the queue fills, the oldest are dropped. Nothing about analytics
          can delay, block or change what the app does.
        </p>

        <h3>What is sent</h3>
        <ul>
          <li>
            <strong>Installation identifier.</strong> A random UUID made on this Mac the first time
            anything is sent. It is not derived from your hardware, account, network or anything
            else, and it is used for nothing but counting installs.
          </li>
          <li>
            <strong>Build and system.</strong> App version, build number, macOS version.
          </li>
          <li>
            <strong>Lifecycle.</strong> First launch, launch, quit.
          </li>
          <li>
            <strong>Charms.</strong> Added, removed, reordered, imported, saved, selected. Built-in
            charms are named; a charm you made is reported as <code>custom</code>.
          </li>
          <li>
            <strong>Rope.</strong> Count changed, style changed.
          </li>
          <li>
            <strong>Settings.</strong> The <strong>name</strong> of the setting that moved, never its
            value.
          </li>
          <li>
            <strong>With every event.</strong> How many charms are hanging, which ones, the rope
            style, and whether analytics is on.
          </li>
        </ul>

        <h3>What is never sent</h3>
        <ul>
          <li>Your name, email address, or any account. Hangly has no accounts.</li>
          <li>Images you import, or anything about them — not the file, its name, or its size.</li>
          <li>
            Charms you make. They are reported as the word <code>custom</code>.
          </li>
          <li>Your location. The weather city is never sent here.</li>
          <li>Where your charm sits, how large it is, or anything else describing your desktop.</li>
          <li>Keystrokes, screen contents, other applications, or what you are doing.</li>
        </ul>

        <h3>Turning it off</h3>
        <p>
          <strong>Customize → Appearance → Privacy → Anonymous Analytics.</strong> Switching it off
          stops capture at the source rather than filtering it later, and throws away the
          installation identifier. If you switch it back on, a new identifier is made, so the two
          cannot be joined.
        </p>
      </section>

      <section>
        <h2>Updates</h2>
        <p>
          Hangly checks once a week whether a newer version exists, and installs it quietly when
          there is one. The check is a request for one file on this site,{' '}
          <code>/products/hangly/appcast.xml</code>, and the download that may follow comes from the
          same place.
        </p>
        <ul>
          <li>
            Nothing about you or your copy goes with the check. It carries no identifier, no system
            profile, and nothing about your charms or settings; the server sees a request for a file,
            with an IP address, as with any web request.
          </li>
          <li>
            Every update is signed, and Hangly installs nothing whose signature does not match the
            key built into the copy you already have.
          </li>
          <li>
            <strong>Customize → About</strong> has a <em>Check for Updates</em> button for anyone who
            would rather ask than be asked.
          </li>
        </ul>
      </section>

      <section>
        <h2>Permissions</h2>
        <p>Hangly asks for none, and this is a design constraint rather than a happy accident.</p>
        <p>
          The optional full-screen auto-hide reads two things the system publishes to any process:
          the bounds of on-screen windows, and which applications are holding a display-sleep power
          assertion — the same information <code>pmset -g assertions</code> prints. Neither needs
          Accessibility, Screen Recording, or any entitlement. Window <em>names</em> and contents
          would need Screen Recording, and Hangly reads neither.
        </p>
        <p>
          Beyond the weather, analytics and the update check, Hangly makes no network requests. It
          loads no remote content and contacts no other service.
        </p>
      </section>

      <section>
        <h2>Checking what your copy is doing</h2>
        <p>
          <strong>Customize → About → Analytics</strong> shows, for this machine: whether sharing is
          on, whether a destination is configured and which, the installation identifier masked, and
          the last event sent with when it went.
        </p>
        <p>
          It is in the app rather than behind a developer flag, because the argument for collecting
          anything at all is that it can be inspected.
        </p>
      </section>

      <p className="legal-foot">
        Hangly is an independent macOS app. Not affiliated with Apple.
      </p>
    </main>
  );
}
