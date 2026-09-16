'use client';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
export default function StoryBridge({ from, to }: { from: string; to: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  return <div className="story-bridge" ref={ref} aria-hidden="true"><motion.div className="bridge-halo" style={reduce ? {} : { x }} /><div className="bridge-arc"><i /></div><span>{from}</span><span className="bridge-center">✳</span><span>{to}</span></div>;
}
