'use client';
import { useState } from 'react';
import { ScanFace, Cpu, Layers3, Fingerprint, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
const frameworks = [
  { name: 'Vision', icon: ScanFace, line: 'Find the face.', detail: 'Apple Vision detects faces and landmarks before recognition begins.', badge: 'APPLE VISION' },
  { name: 'Core ML', icon: Cpu, line: 'Recognize the familiar.', detail: 'A face-recognition model creates embeddings for local comparison.', badge: 'ON-DEVICE INFERENCE' },
  { name: 'SwiftUI', icon: Layers3, line: 'Feel right at home.', detail: 'Native settings, controls and an interface designed around macOS.', badge: 'NATIVE INTERFACE' },
  { name: 'Local Authentication', icon: Fingerprint, line: 'Authorize with confidence.', detail: 'System authentication helps authorize access to protected credentials.', badge: 'SYSTEM AUTHORIZATION' },
  { name: 'Secure Enclave', icon: ShieldCheck, line: 'Apple’s hardware trust.', detail: 'Touch ID uses Secure Enclave on compatible Macs. Vision’s webcam recognition does not.', badge: 'VIA TOUCH ID · SUPPORTED MACS' },
];
export default function Technology() {
 const [active, setActive] = useState(0);
 const reduce = useReducedMotion();
 return <section id="technology" className="technology-chapter section-pad"><div className="section-head"><div><div className="eyebrow"><span />CHAPTER 07 / NATIVE AT THE CORE</div><h2>BUILT WITH<br />APPLE TECHNOLOGY.</h2></div><div className="section-intro"><p>Powered by Apple’s frameworks.</p><span>Thoughtful software starts with a foundation you know.</span></div></div><div className="framework-deck">{frameworks.map((item,i)=><motion.button key={item.name} type="button" className={`framework-card ${active === i ? 'is-active' : ''}`} aria-pressed={active===i} onClick={()=>setActive(i)} onFocus={()=>setActive(i)} onPointerEnter={e=>{if(e.pointerType==='mouse')setActive(i);}} initial={reduce?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6,delay:i*.06}}><span className="framework-index">0{i+1}<ArrowUpRight size={15}/></span><div className="framework-orbit"><i/><item.icon strokeWidth={1.2}/></div><h3>{item.name}</h3><p>{item.line}</p><span className="framework-badge">{item.badge}</span></motion.button>)}</div><div className="framework-explanation"><span className="status-dot"/><p><strong>{frameworks[active].name}.</strong> {frameworks[active].detail}</p></div><p className="apple-note">Vision is an independent app. Face matching runs locally using Apple Vision and Core ML; it is not Apple Face ID.</p></section>;
}
