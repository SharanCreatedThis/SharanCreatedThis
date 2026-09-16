# SharanCreatedThis

Monorepo consolidating all personal brand web platforms and native macOS software applications created by Sharan.

## Structure

```text
SharanCreatedThis/
├── website/            # Production Next.js web portal (sharancreatedthis.in)
│   ├── src/            # App router, pages, components, and product showcases
│   └── public/         # Static assets and Sparkle software update feeds
│
├── apps/
│   ├── Vision/         # Face ID-inspired security & unlock companion for Mac
│   └── Hangly/         # Physics-powered menu bar companions for macOS
│
├── assets/             # Shared brand identity, design assets, and logos
└── docs/               # Monorepo architecture and release documentation
```

## Projects Overview

### 1. Website (`website/`)
- **Domain**: [sharancreatedthis.in](https://sharancreatedthis.in)
- **Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vercel Analytics.
- **Routes**:
  - `/` — Brand Hub ("Sharan Created This")
  - `/products` — Product Showcase (Hangly & Vision)
  - `/products/hangly` — Hangly Landing Page
  - `/products/vision` — Vision Landing Page
  - `/portfolio`, `/about`, `/contact` — Brand sections

### 2. Vision (`apps/Vision/`)
- Native macOS Face ID-inspired unlock experience and notch interaction companion.
- Built with Swift, Apple Vision framework, Core ML face embeddings, and AppKit.

### 3. Hangly (`apps/Hangly/`)
- Physics-powered interactive menu bar charms and companions for macOS.
- Built with Swift, custom Verlet physics engine, and native AppKit overlays.

## Getting Started

### Developing the Website
```bash
cd website
npm install
npm run dev
```

### Building the macOS Apps
Open `apps/Vision/Vision.xcodeproj` or `apps/Hangly/Hangly.xcodeproj` in Xcode 16+.
