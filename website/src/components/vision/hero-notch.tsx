'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/** Uses the same scan artwork and success movie as ScanAnimationView.swift. */
export default function HeroNotch() {
  const anchor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visible = useInView(anchor);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'scanning' | 'verified' | 'idle'>('scanning');
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (reduce || !visible) { video.current?.pause(); return; }
    if (phase === 'scanning') {
      const timer = setTimeout(() => {
        if (!video.current) return;
        video.current.currentTime = 0;
        void video.current.play().catch(() => setVideoReady(false));
      }, 900);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setVideoReady(false);
      setPhase(phase === 'verified' ? 'idle' : 'scanning');
    }, phase === 'verified' ? 1500 : 2400);
    return () => clearTimeout(timer);
  }, [phase, visible, reduce]);

  const expanded = reduce || phase !== 'idle';
  return <div ref={anchor} className="hero-notch-anchor" aria-hidden="true">
    <motion.div className="hero-native-notch" initial={false}
      animate={{ width: expanded ? '100%' : '50%', height: expanded ? '100%' : '11%' }}
      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 175, damping: 23, mass: .85 }}>
      <motion.div className="hero-notch-media" initial={false} animate={{ opacity: expanded ? 1 : 0 }} transition={{ duration: reduce ? 0 : .2 }}>
        <img src="/notch/face.png" alt="" width={432} height={432} className="hero-notch-poster" />
        {!reduce && <video ref={video} className={`hero-notch-video ${videoReady ? 'is-playing' : ''}`} muted playsInline preload="none" poster="/notch/face.png" onPlaying={() => setVideoReady(true)} onEnded={() => setPhase('verified')} onError={() => setVideoReady(false)}>
          <source src="/notch/unlock.mp4" type="video/mp4" />
        </video>}
      </motion.div>
    </motion.div>
  </div>;
}
