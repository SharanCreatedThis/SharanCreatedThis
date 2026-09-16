'use client';
import { useState } from 'react';
import { ScanFace, LockKeyhole, Laptop, ArrowRight } from 'lucide-react';
import RecognitionField, { useRecognition } from './recognition-field';
const stages = [
  { name: 'Face', promise: 'Never uploaded.', text: 'Camera frames are processed on your Mac to create a face embedding.', icon: ScanFace },
  { name: 'Encrypted', promise: 'Never shared.', text: 'Your enrolled face profile is encrypted locally. Your Mac password is protected by Keychain.', icon: LockKeyhole },
  { name: 'Stored locally', promise: 'Always yours.', text: 'Your biometric profile stays on this device. No cloud face-processing service is involved.', icon: Laptop },
];
export default function PrivacyFlow() {
  const { ref, phase } = useRecognition();
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected ?? (phase === 'verified' || phase === 'recognized' ? 2 : phase === 'analyzing' ? 1 : 0);
  return <div ref={ref} className="privacy-flow"><RecognitionField phase={phase} fingerprint />
    <div className="privacy-flow-tabs" aria-label="How your biometric data stays local">{stages.map((stage, i) => <button type="button" key={stage.name} aria-pressed={active === i} onClick={() => setSelected(i)}><stage.icon size={21} /><span>{stage.name}</span>{i < 2 && <ArrowRight className="flow-arrow" size={14} />}</button>)}</div>
    <div className="privacy-flow-copy"><h3>{stages[active].promise}</h3><p>{stages[active].text}</p></div>
    <div className="privacy-promises"><span>Never uploaded.</span><span>Never shared.</span><span>Always yours.</span></div>
  </div>;
}
