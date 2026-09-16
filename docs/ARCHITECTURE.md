# Repository Architecture

## Overview
The `SharanCreatedThis` repository is a unified monorepo housing both web applications and macOS desktop products.

## Component Layout

### `website/`
- Serves as the primary public web application deployed to Vercel at `sharancreatedthis.in`.
- Uses Route Groups (`(hub)`) to encapsulate the overarching brand layout and navigation while allowing product landing pages (`/products/hangly` and `/products/vision`) to run with dedicated, isolated styling and layouts.
- Hosts macOS app update manifests and release notes for Sparkle under `public/products/`.

### `apps/Vision/`
- Full native macOS application project for Vision.
- Houses the Core ML pipeline, liveness detection, and notch animations.
- Release scripts package builds and generate update feeds published to the website.

### `apps/Hangly/`
- Full native macOS application project for Hangly.
- Houses the physics simulator, charm asset pipelines, and screen placement observers.
- Supported by XcodeGen via `project.yml`.

### `assets/`
- Shared brand marks, master typography, vector icons, and marketing assets.
