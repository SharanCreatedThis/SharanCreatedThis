'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { RecognitionPhase } from './recognition-field';

/** Uses the same scan artwork and success movie as ScanAnimationView.swift. */
export default function HeroNotch({ onStatus }: { onStatus?: (status: RecognitionPhase) => void }) {
  const anchor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visible = useInView(anchor);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'scanning' | 'verified' | 'hiding' | 'idle' | 'opening'>('scanning');
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (reduce || !visible) { video.current?.pause(); if (reduce) onStatus?.('verified'); return; }
    if (phase === 'scanning') {
      onStatus?.('scanning');
      const timer = setTimeout(() => {
        if (!video.current) return;
        onStatus?.('analyzing');
        video.current.currentTime = 0;
        void video.current.play().catch(() => { setVideoReady(false); setPhase('verified'); });
      }, 600);
      return () => clearTimeout(timer);
    }
    if (phase === 'verified') {
      onStatus?.('recognized');
      const statusTimer = setTimeout(() => onStatus?.('verified'), 650);
      const hideTimer = setTimeout(() => setPhase('hiding'), 2200);
      return () => { clearTimeout(statusTimer); clearTimeout(hideTimer); };
    }
    // Fade the media completely before resizing the shell. Keep the success
    // frame until hidden so the face poster never flashes during collapse.
    const next = { verified: 'hiding', hiding: 'idle', idle: 'opening', opening: 'scanning' } as const;
    const delay = { verified: 1500, hiding: 240, idle: 2400, opening: 650 };
    const timer = setTimeout(() => {
      if (phase === 'idle') setVideoReady(false);
      setPhase(next[phase]);
    }, delay[phase]);
    return () => clearTimeout(timer);
  }, [phase, visible, reduce, onStatus]);

  const expanded = reduce || phase !== 'idle';
  const showMedia = reduce || phase === 'scanning' || phase === 'verified';
  return <div ref={anchor} className="hero-notch-anchor" data-phase={phase} aria-hidden="true">
    <motion.div className="hero-native-notch" initial={false}
      animate={{ width: expanded ? '100%' : '59%', height: expanded ? '100%' : '11%' }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 175, damping: 23, mass: .85 }}>
      <motion.div className="hero-notch-media" initial={false} animate={{ opacity: showMedia ? 1 : 0 }} transition={{ duration: reduce ? 0 : .2 }}>
        <img src="/vision/notch/face.png" alt="" width={432} height={432} className="hero-notch-poster" />
        {!reduce && <video ref={video} className={`hero-notch-video ${videoReady ? 'is-playing' : ''}`} muted playsInline preload="none" poster="/vision/notch/face.png" onPlaying={() => setVideoReady(true)} onEnded={() => setPhase('verified')} onError={() => { setVideoReady(false); setPhase('verified'); }}>
          <source src="/vision/notch/unlock.mp4" type="video/mp4" />
        </video>}
      </motion.div>
    </motion.div>
  </div>;
}
