'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Coffee, Copy, Check, Github, Instagram, X } from 'lucide-react';

// Creator portrait from the supplied Hangly product page.
const portrait = "/creator/sharan.webp";

export default function Creator() {
  const reduce = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText('8870786087@yescred'); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  }
  return <section className="creator-section section-pad" id="creator">
    <motion.div className="creator-layout" initial={reduce ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .8 }}>
      {portrait && <div className="creator-portrait"><img src={portrait} alt="Sharan, creator of Vision" width={900} height={1351} loading="lazy" /><div className="portrait-caption"><span>SHARAN</span><span>DESIGNER & CREATOR ↗</span></div></div>}
      <div className="creator-copy"><div className="eyebrow"><span />CHAPTER 09 / MADE WITH FEELING. IN INDIA.</div><h2>Created by<br /><span>Sharan.</span></h2><p className="creator-intro">Designer, filmmaker, photographer and creator passionate about building thoughtful digital experiences.</p><motion.div className="support-card support-card-inline" initial={reduce ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
      <div className="support-symbol"><Coffee size={36} strokeWidth={1.2} /></div><div className="support-copy"><h3>Buy Creator a Coffee</h3><p>A little support if you enjoy Vision.</p><small>Vision is free. Support is always optional.</small></div><button className="button button-orange" type="button" onClick={() => { setCopied(false); setCopyError(false); dialog.current?.showModal(); }}>Support Creator <ArrowRight size={18} /></button>
    </motion.div><div className="creator-social"><a href="https://www.instagram.com/sharan.created.this/"><Instagram size={18} /><span>@sharan.created.this</span><ArrowUpRight size={16} /></a><a href="https://sharancreatedthis.in"><span>sharancreatedthis.in</span><ArrowUpRight size={16} /></a><a href="https://github.com/SharanCreatedThis"><Github size={18} /><span>SharanCreatedThis</span><ArrowUpRight size={16} /></a></div></div>
    </motion.div>
    <dialog ref={dialog} className="release-dialog support-dialog" aria-labelledby="support-title" onClick={e => { if(e.target === e.currentTarget) dialog.current?.close(); }}><div className="release-inner"><button className="dialog-close" type="button" aria-label="Close support details" onClick={() => dialog.current?.close()} autoFocus><X size={20} /></button><Coffee className="accent-text" size={30} /><h2 id="support-title">A little coffee.<br />A lot of feeling.</h2><p>Scan with your UPI app to support Sharan.</p><img src="/creator/support-qr.jpg" alt="UPI payment QR code for Vision creator Sharan" width={260} height={260} loading="lazy" /><div className="support-payment"><code>8870786087@yescred</code><button type="button" onClick={copy} aria-label="Copy creator UPI ID">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div><p className="support-feedback" role="status">{copyError ? 'Select and copy the UPI ID above.' : copied ? 'UPI ID copied.' : 'Choose any amount in your payment app.'}</p><small>Vision is free. Support is always optional.</small></div></dialog>
  </section>;
}
