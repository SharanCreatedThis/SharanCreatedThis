/**
 * What each build is, in one place, with no JSX and no client code.
 *
 * The download button needs this and so do the download, install and changelog
 * pages — and the button lives in a `"use client"` module, which a server
 * component should not be importing facts out of. So the facts live here and
 * the button composes its icons onto them.
 *
 * None of the hrefs are real file URLs. Each is a stable site path resolved to
 * the current archive by public/_redirects, which is generated from the Sparkle
 * feeds. A version number is never written into a link.
 */

export type BuildId = "mac" | "windows-x64" | "windows-arm64";

export type Build = {
  id: BuildId;
  /** Stable path. The redirect decides which file this is today. */
  href: string;
  /** On a button, once this is the recommended build. */
  button: string;
  /** In a list or a chooser. */
  name: string;
  requirement: string;
  /** The processors it runs on. */
  detail: string;
  /** Long form, for a page rather than a button. */
  architecture: string;
  /** How it updates itself once installed. */
  updater: string;
  /** What the operating system will say the first time it opens. */
  firstRun: string;
  /** Windows is still at 0.9.x and published as a pre-release. Say so. */
  beta?: boolean;
};

export const BUILDS: Record<BuildId, Build> = {
  mac: {
    id: "mac",
    href: "/products/hangly/download",
    button: "Download for macOS",
    name: "macOS",
    requirement: "macOS 14+",
    detail: "Apple Silicon & Intel",
    architecture: "A universal build: one download runs natively on Apple Silicon and on Intel Macs.",
    updater: "Checks weekly through Sparkle and installs in the background. There is a Check for Updates button on the About page for anyone who would rather ask.",
    firstRun: "It opens. The app is signed and notarised, so Gatekeeper has nothing to warn about.",
  },
  "windows-x64": {
    id: "windows-x64",
    href: "/products/hangly/download/windows-x64",
    button: "Download for Windows",
    name: "Windows",
    requirement: "Windows 10+",
    detail: "Intel & AMD 64-bit",
    architecture: "For any Intel or AMD 64-bit machine, which is nearly every Windows PC.",
    updater: "Updates through Velopack, which checks on launch and applies the update the next time you start the app.",
    firstRun: "SmartScreen may show a blue \"Windows protected your PC\" panel, because the build is not yet code-signed. Choose More info, then Run anyway.",
    beta: true,
  },
  "windows-arm64": {
    id: "windows-arm64",
    href: "/products/hangly/download/windows-arm64",
    button: "Download for Windows",
    name: "Windows on ARM",
    requirement: "Windows 11+",
    detail: "Snapdragon & ARM64",
    architecture: "A native ARM64 build for Snapdragon and other ARM machines. The x64 build also runs there under emulation; this one does not need it.",
    updater: "Updates through Velopack, which checks on launch and applies the update the next time you start the app.",
    firstRun: "SmartScreen may show a blue \"Windows protected your PC\" panel, because the build is not yet code-signed. Choose More info, then Run anyway.",
    beta: true,
  },
};

export const BUILD_ORDER: BuildId[] = ["mac", "windows-x64", "windows-arm64"];

/** Vision ships one build and has no chooser, so it is not part of BUILDS. */
export const VISION_BUILD = {
  href: "/products/vision/download",
  name: "macOS",
  requirement: "macOS 15+",
  detail: "Apple Silicon & Intel",
  updater: "Checks through Sparkle against the feed on this site.",
} as const;
