'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, Fingerprint, ScanFace } from 'lucide-react';
export type RecognitionPhase = 'idle' | 'scanning' | 'analyzing' | 'recognized' | 'verified';
export const recognitionLabels: Record<RecognitionPhase, string> = { idle: 'Ready when you are.', scanning: 'Scanning…', analyzing: 'Analyzing…', recognized: 'Recognized.', verified: 'Identity verified.' };
export function useRecognition(replay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: .45 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<RecognitionPhase>('idle');
  useEffect(() => {
    if (reduce) { setPhase('verified'); return; }
    if (!visible) { setPhase('idle'); return; }
    setPhase('scanning');
    const timers = [setTimeout(() => setPhase('analyzing'), 1000), setTimeout(() => setPhase('recognized'), 2200), setTimeout(() => setPhase('verified'), 3000)];
    return () => timers.forEach(clearTimeout);
  }, [visible, reduce, replay]);
  return { ref, visible, phase, reduce };
}
/** Shared geometric biometric diagram; decorative, without camera access. */
export default function RecognitionField({ phase = 'idle', fingerprint = false, compact = false }: { phase?: RecognitionPhase; fingerprint?: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const inView = useInView(fieldRef, { amount: .1 });
  const verified = phase === 'verified' || phase === 'recognized';
  const Icon = fingerprint ? Fingerprint : verified ? Check : ScanFace;
  return <div ref={fieldRef} className={`recognition-field ${compact ? 'recognition-compact' : ''} recognition-${phase}`} aria-hidden="true">
    {[0, 1, 2].map(i => <div className={`recognition-ring ring-${i}`} key={i}><i /></div>)}
    {!compact && <svg className="recognition-mesh" viewBox="0 0 240 240" fill="none"><ellipse cx="120" cy="120" rx="78" ry="92" /><ellipse cx="120" cy="120" rx="42" ry="92" /><ellipse cx="120" cy="120" rx="78" ry="36" /><path d="M42 120h156M120 28v184M57 66l126 108M57 174 183 66" />{[[120,28],[120,212],[42,120],[198,120],[57,66],[183,174],[57,174],[183,66]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={2} />)}</svg>}
    <motion.div className="recognition-symbol" animate={reduce || !inView ? {} : verified ? { scale: [1, 1.08, 1] } : { scale: [1, .97, 1] }} transition={{ duration: verified ? .7 : 4, repeat: verified ? 0 : Infinity }}><Icon strokeWidth={.9} /></motion.div>
    {(phase === 'scanning' || phase === 'analyzing') && <div className="recognition-sweep" />}
    {verified && <div className="recognition-pulse" />}
  </div>;
}
