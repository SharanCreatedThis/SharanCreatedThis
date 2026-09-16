# Sharan Created This

## Overview
Sharan Created This is a unified monorepo housing personal brand web platforms and native macOS software applications designed and developed by Sharan.

## Products

### Vision
- Face ID-inspired security, notch companion, and authentication experience for macOS.
- Native Swift application utilizing Apple Vision framework, Core ML face embeddings, and AppKit notch overlays.

### Hangly
- Physics-powered menu bar companions and desktop charms for macOS.
- Native Swift application built with custom Verlet physics simulation, interactive charm interactions, and screen placement integration.

## Website

### sharancreatedthis.in
- The primary brand hub and product landing portal, deployed at [https://sharancreatedthis.in](https://sharancreatedthis.in).
- Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, and Vercel Analytics.
- Serves the central brand hub along with dedicated, isolated product landing pages and Sparkle update feeds.

## Repository Structure

- **`website/`**: Main Next.js public website and Sparkle update hosting.
- **`apps/Vision/`**: Native macOS Xcode project and Swift source code for Vision.
- **`apps/Hangly/`**: Native macOS Xcode project, Swift source code, and specs for Hangly.
- **`releases/`**: Centralized distribution builds and release packages for Vision and Hangly.
- **`assets/`**: Shared branding, vector logos, and design assets.
- **`docs/`**: Monorepo architecture, development guides, and release procedures.
