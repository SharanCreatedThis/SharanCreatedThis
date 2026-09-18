# Portfolio hub

Run `npm run dev` or `npm run build` from `website/`.

- `src/data/portfolio.ts`: profile/contact URLs, project records, metrics, career chapters.
- `src/data/products.ts`: existing product catalog.
- `src/components/hub/Experience.tsx`: reusable homepage sections and interactive portfolio/product components.
- `src/app/(hub)/hub.css`: hub typography, colors, spacing, responsive layouts, reduced-motion rules.
- `src/app/(hub)/*/page.tsx`: page composition and page metadata.

The hub layout scopes the design separately from the existing Hangly and Vision routes. Neither product landing page is redesigned.

## Updating projects

Each record has an id, title, category, type, tone, image and url. Store approved images in `public/portfolio/` and reference `/portfolio/filename.webp`. Empty image fields render labeled typographic covers; empty URLs show a preview and inquiry link. Replace those fields as full project material becomes available. Verify categories and project descriptions before publishing.

## Sources

Portrait: existing `/creator/sharan.webp`.
Photography: https://www.behance.net/gallery/162912025/Photography-Portfolio (Sharan supplied).
Films: https://youtu.be/JV8xMukUslQ and https://youtu.be/J__-TE8Ok6o (Sharan supplied). Titles confirmed using YouTube oEmbed. Thumbnail images are stored locally.

## Motion

Framer Motion powers reveals, counters, manual chapter tabs, layout filtering, and draggable product charms. Native smooth scrolling and scroll snapping avoid adding a second scrolling engine. Creative-world tabs change only on click or keyboard navigation; the section remains in normal page flow. Reduced-motion preferences disable decorative continuous motion. The Hangly gateway uses `HanglyPreview.tsx`: three independent damped pendulums, fixed cord anchors, pointer capture for dragging, keyboard nudges, and visibility-aware animation. Original realistic SVG assets are copied from the supplied Hangly/Assets/Charms folder into `public/portfolio/hangly/`.

## Editorial opening frame

`src/components/hub/EditorialHero.tsx` owns the reference-inspired orange/white homepage hero. Its portrait (`/portfolio/sharan-white-suit.webp`) is a WebP export of the user-supplied `landing page photo.png`, with its transparency preserved; the original PNG is retained alongside it. The navigation uses an editorial treatment at the top of Home, then compresses into a cream floating navigation on scroll.

## Homepage theme

`src/app/(hub)/home-editorial.css` scopes the orange-and-ivory design to the hub layout’s `.editorial-theme`, including the worlds, metrics, journey, work gallery, product previews, and contact section. Shared components and content remain modular. Home, Portfolio, Products, About, and Contact share this theme; Hangly and Vision landing pages remain isolated.
