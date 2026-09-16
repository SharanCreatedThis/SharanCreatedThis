'use client';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import RecognitionField, { recognitionLabels, useRecognition } from './recognition-field';
export default function Biometric() {
  const [run, setRun] = useState(0);
  const { ref, phase, visible, reduce } = useRecognition(run);
  return <div ref={ref} className={`biometric ${visible ? 'motion-visible' : ''}`}>
    <div className="biometric-top"><span>VISION / RECOGNITION</span><span>ON DEVICE</span></div>
    <RecognitionField phase={phase} />
    <div className="biometric-status"><div><span className="status-dot" /><span>{recognitionLabels[phase]}</span></div><button type="button" onClick={() => setRun(r => r + 1)} disabled={phase === 'scanning' || phase === 'analyzing' || !!reduce} aria-label="Replay face recognition animation"><RotateCcw size={17} /></button></div>
    <span className="biometric-caption">YOUR IDENTITY. IN YOUR ORBIT.</span>
  </div>;
}
