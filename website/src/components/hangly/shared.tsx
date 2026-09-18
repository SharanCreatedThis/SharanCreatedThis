'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react';
// Resolved to the newest release at build time by the redirect in next.config.ts,
// which reads the Sparkle feed. Never a versioned file name, and never the app's
// own repository: that one is private, and its release assets 404 for everybody else.
export const DOWNLOAD = '/products/hangly/download';
export function DownloadButton({ label = 'Download for macOS', className = '' }: { label?: string; className?: string }) { return <a className={`button button-primary ${className}`} href={DOWNLOAD}><ArrowDownToLine size={17}/>{label}<ArrowUpRight size={17}/></a>; }
export function Charm({ name, alt, className = '' }: { name: string; alt?: string; className?: string }) { return <img className={`charm-art ${className}`} src={`/charms/connected/${name}.svg`} alt={alt ?? ''} draggable={false}/>; }
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
