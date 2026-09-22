'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { CHARM_ART } from '@/data/charms.generated';
// The macOS archive. Resolved to the newest release at build time by the
// redirects in scripts/generate-download-redirects.mjs, which read the Sparkle
// feed. Never a versioned file name, and never the app's own repository: that
// one is private, and its release assets 404 for everybody else. The Windows
// builds and the button that picks between all three live in ./Download.
export const DOWNLOAD = '/products/hangly/download';
export { DownloadButton, DownloadNote, PlatformSheet, openPlatformSheet } from './Download';
// Where a charm's artwork lives, resolved at build time by
// scripts/generate-charm-manifest.mjs. Never assemble this path by hand: six
// collections have no connected rendering drawn yet, and guessing the path is
// what had thirty charms rendering as broken images.
export function charmArt(name: string) { return CHARM_ART[name] ?? `/charms/${name}.svg`; }
export function Charm({ name, alt, className = '' }: { name: string; alt?: string; className?: string }) { return <img className={`charm-art ${className}`} src={charmArt(name)} alt={alt ?? ''} draggable={false} loading="lazy" decoding="async"/>; }
export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const interactive = /feature-card|stat/.test(className);
  return <motion.div className={className}
    initial={reduced ? false : { opacity: 0, y: 32, filter: 'blur(3px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    whileHover={interactive && !reduced ? { y: -6 } : undefined}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: .85, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}

export function Parallax({ children, className = '', distance = 30 }: { children: React.ReactNode; className?: string; distance?: number }) {
  const target = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return <div ref={target} className={className}><motion.div style={{ y: reduced ? 0 : y }}>{children}</motion.div></div>;
}
export function Label({ children }: {children: React.ReactNode}) { return <p className="eyebrow"><span/>{children}</p>; }
export function Logo() { return <a className="logo" href="#" aria-label="Hangly home"><span className="logo-icon"><i/><i/><i/></span>hangly<span className="logo-dot">®</span></a>; }
