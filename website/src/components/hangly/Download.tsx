'use client';

/**
 * The download button, and the platform chooser behind it.
 *
 * Hangly ships for macOS and for Windows, and Windows ships twice — once for x64
 * and once for ARM64. Three builds is two more than anyone wants to think about,
 * so the page works out which one this machine wants and offers that; the other
 * two stay one click away in a sheet.
 *
 * The site is a static export, so there is no server to read a User-Agent header
 * with. Detection runs in the browser after mount, which means the prerendered
 * HTML has to say something true for everybody: the button starts as a neutral
 * "Download Hangly" pointing at the chooser and sharpens into a direct link once
 * the platform is known. That ordering is deliberate — a button that renders as
 * "Download for macOS" and then changes its mind reads as a bug.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Check, ChevronRight, X } from 'lucide-react';

export type PlatformId = 'mac' | 'windows-x64' | 'windows-arm64';

function AppleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.246-3.83-1.208.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function WindowsMark({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

type Platform = {
  id: PlatformId;
  /** Where the button points. A stable site path, resolved to the real archive
   *  by the redirects in scripts/generate-download-redirects.mjs. */
  href: string;
  /** On the button, once this platform is the recommended one. */
  button: string;
  /** In the chooser. */
  name: string;
  requirement: string;
  detail: string;
  mark: (props: { size?: number }) => React.ReactElement;
  /** Windows is still at 0.9.x and published as a pre-release. Say so. */
  beta?: boolean;
};

export const PLATFORMS: Record<PlatformId, Platform> = {
  mac: {
    id: 'mac',
    href: '/products/hangly/download',
    button: 'Download for macOS',
    name: 'macOS',
    requirement: 'macOS 14+',
    detail: 'Apple Silicon & Intel',
    mark: AppleMark,
  },
  'windows-x64': {
    id: 'windows-x64',
    href: '/products/hangly/download/windows-x64',
    button: 'Download for Windows',
    name: 'Windows',
    requirement: 'Windows 10+',
    detail: 'Intel & AMD 64-bit',
    mark: WindowsMark,
    beta: true,
  },
  'windows-arm64': {
    id: 'windows-arm64',
    href: '/products/hangly/download/windows-arm64',
    button: 'Download for Windows',
    name: 'Windows on ARM',
    requirement: 'Windows 11+',
    detail: 'Snapdragon & ARM64',
    mark: WindowsMark,
    beta: true,
  },
};

const ORDER: PlatformId[] = ['mac', 'windows-x64', 'windows-arm64'];

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

type UserAgentData = {
  platform: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
};

/**
 * Best guess at this machine's build, or null when the answer is genuinely
 * unknown — a phone, a tablet, Linux, a locked-down browser. Null is a fine
 * answer: it opens the chooser instead of guessing wrong.
 */
export async function detectPlatform(): Promise<PlatformId | null> {
  if (typeof navigator === 'undefined') return null;
  const agent = navigator.userAgent ?? '';
  const data = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;

  // Client hints are the only reliable way to separate the two Windows builds.
  // A Windows-on-ARM machine reports "Win64; x64" in its user agent string,
  // because the browser itself is usually running under the x64 emulator, so
  // reading the string alone sends every ARM laptop to the wrong download.
  if (data?.platform === 'Windows' && data.getHighEntropyValues) {
    try {
      const { architecture } = await data.getHighEntropyValues(['architecture']);
      if (architecture === 'arm') return 'windows-arm64';
      if (architecture === 'x86') return 'windows-x64';
    } catch {
      // Hints can be refused. Fall through to the user agent string.
    }
  }
  if (data?.platform === 'macOS') return 'mac';

  // An iPad reports itself as "MacIntel" and is not a Mac download. A real Mac
  // has no touch screen; a trackpad does not count towards maxTouchPoints.
  const isTablet = (navigator.maxTouchPoints ?? 0) > 1;
  if (/iPhone|iPad|iPod|Android/i.test(agent)) return null;
  if (/Mac/i.test(navigator.platform || agent) && !isTablet) return 'mac';
  if (/Windows|Win32|Win64/i.test(agent)) {
    // Without hints, x64 is the safe default: ARM64 Windows runs x64 builds
    // under emulation, and no amount of emulation runs it the other way.
    return /ARM64|aarch64/i.test(agent) ? 'windows-arm64' : 'windows-x64';
  }
  return null;
}

/** null while still working it out or genuinely unknown; `ready` separates the two. */
export function usePlatform(): { platform: PlatformId | null; ready: boolean } {
  const [state, setState] = useState<{ platform: PlatformId | null; ready: boolean }>({
    platform: null,
    ready: false,
  });

  useEffect(() => {
    let live = true;
    detectPlatform().then(platform => {
      if (live) setState({ platform, ready: true });
    });
    return () => {
      live = false;
    };
  }, []);

  return state;
}

// ---------------------------------------------------------------------------
// Opening the chooser from anywhere on the page
// ---------------------------------------------------------------------------

/**
 * One sheet serves every download affordance on the page — both buttons and
 * both notes under them. Rather than thread a context through components that
 * otherwise share nothing, the sheet listens for an event and anyone can raise
 * it. There is exactly one <PlatformSheet/>, mounted by the page.
 */
const OPEN_EVENT = 'hangly:choose-platform';

export function openPlatformSheet() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(OPEN_EVENT));
}

// ---------------------------------------------------------------------------
// The button
// ---------------------------------------------------------------------------

export function DownloadButton({ label, className = '' }: { label?: string; className?: string }) {
  const { platform, ready } = usePlatform();
  const recommended = platform ? PLATFORMS[platform] : null;
  const shared = `button button-primary ${className}`;

  // Nothing to recommend: the button is the chooser. This is also what the
  // prerendered HTML contains, so there is never a wrong link in the markup.
  if (!recommended) {
    return (
      <button type="button" className={shared} onClick={openPlatformSheet} aria-haspopup="dialog">
        <ArrowDownToLine size={17} />
        {label ?? 'Download Hangly'}
        <ChevronRight size={17} />
      </button>
    );
  }

  const mark = recommended.mark;
  return (
    <a className={shared} href={recommended.href} data-platform={ready ? recommended.id : undefined}>
      {mark({ size: 17 })}
      {label ?? recommended.button}
      <ArrowUpRight size={17} />
    </a>
  );
}

// ---------------------------------------------------------------------------
// The note underneath it
// ---------------------------------------------------------------------------

/**
 * The line of small print below each download button. It names what the
 * recommended build needs, and carries the way into the chooser for everyone
 * whose machine is not the one that was guessed.
 */
export function DownloadNote({ className = 'download-note' }: { className?: string }) {
  const { platform } = usePlatform();
  const recommended = platform ? PLATFORMS[platform] : null;

  return (
    <p className={className}>
      Free download <span>•</span>{' '}
      {recommended ? (
        <>
          {recommended.requirement} <span>•</span> {recommended.detail}
        </>
      ) : (
        <>macOS 14+ and Windows 10+</>
      )}{' '}
      <span>•</span>{' '}
      <button type="button" className="platform-switch" onClick={openPlatformSheet} aria-haspopup="dialog">
        All platforms
      </button>
    </p>
  );
}

// ---------------------------------------------------------------------------
// The chooser
// ---------------------------------------------------------------------------

export function PlatformSheet() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const { platform } = usePlatform();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const listen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, listen);
    return () => window.removeEventListener(OPEN_EVENT, listen);
  }, []);

  useEffect(() => {
    const sheet = dialog.current;
    if (!open || !sheet) return;
    sheet.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      sheet.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="platform-sheet"
      aria-labelledby="platform-title"
      aria-describedby="platform-description"
      onClose={close}
      onClick={event => {
        // Only a click on the backdrop closes it. A <dialog> reports backdrop
        // clicks as clicks on itself, so the pointer has to be outside the box.
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          close();
      }}
    >
      <button className="platform-close" aria-label="Close" onClick={close}>
        <X size={20} />
      </button>
      <p className="platform-eyebrow">ONE LITTLE DOWNLOAD.</p>
      <h2 id="platform-title">Choose your desktop</h2>
      <p id="platform-description">
        {platform
          ? 'We think we spotted yours. Take another if we guessed wrong.'
          : 'Pick the one that matches your machine.'}
      </p>

      <ul className="platform-options">
        {ORDER.map(id => {
          const option = PLATFORMS[id];
          const recommended = id === platform;
          return (
            <li key={id}>
              <a
                href={option.href}
                className={recommended ? 'platform-option recommended' : 'platform-option'}
                onClick={close}
                autoFocus={recommended || undefined}
              >
                <span className="platform-option-mark" aria-hidden="true">
                  {option.mark({ size: 20 })}
                </span>
                <span className="platform-option-copy">
                  <strong>
                    {option.name}
                    {option.beta ? <em className="platform-tag">Beta</em> : null}
                  </strong>
                  <small>
                    {option.requirement} · {option.detail}
                  </small>
                </span>
                {recommended ? (
                  <span className="platform-recommended">
                    <Check size={13} /> Recommended
                  </span>
                ) : null}
                <span className="platform-option-arrow" aria-hidden="true">
                  <ArrowDownToLine size={17} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="platform-foot">
        Hangly is free on every platform. Windows is young — it is finding its feet.
      </p>
    </dialog>
  );
}
