'use client';
import { ScanFace, ShieldCheck, FolderLock, Monitor, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
const roadmap = [
 { name: 'Vision Unlock', status: 'Available', icon: ScanFace, text: 'The first chapter. Face recognition, made for Mac.', note: 'In the current app · public download coming soon' },
 { name: 'Vision Guard', status: 'Coming soon', icon: ShieldCheck, text: 'A quieter kind of peace of mind. Lock when you leave.', note: 'In development' },
 { name: 'Vision Vault', status: 'Coming soon', icon: FolderLock, text: 'Your apps and files. A more personal layer of access.', note: 'In development' },
 { name: 'Windows Version', status: 'Future', icon: Monitor, text: 'A wider horizon for a more natural way in.', note: 'Future direction · no release date announced' },
];
export default function Roadmap() {
 const reduce=useReducedMotion();
 return <div className="roadmap"><div className="roadmap-header"><span>ONE VISION. A WIDER HORIZON.</span><span>NOW → NEXT → BEYOND</span></div><div className="roadmap-grid">{roadmap.map((item,i)=><motion.article className="roadmap-card" key={item.name} initial={reduce?false:{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6,delay:i*.08}}><div className="roadmap-card-top"><span>0{i+1}</span><span className={`roadmap-status ${i===0?'available':''}`}>{item.status}</span></div><div className="roadmap-icon"><item.icon size={30} strokeWidth={1.2}/><i/></div><h3>{item.name}</h3><p>{item.text}</p><small>{item.note}</small><ArrowUpRight className="roadmap-arrow" size={18}/></motion.article>)}</div></div>;
}
