'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Coffee, Copy, Heart, X } from 'lucide-react';

const UPI_ID = '8870786087@yescred';

export default function CoffeeSupport() {
  const dialog = useRef<HTMLDialogElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    const sheet = dialog.current;
    if (!open || !sheet) return;
    sheet.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      sheet.close();
      document.body.style.overflow = previousOverflow;
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [open]);

  async function copyUPI() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopyState('copied');
      resetTimer.current = setTimeout(() => setCopyState('idle'), 2500);
    } catch {
      setCopyState('failed');
    }
  }

  return (
    <div className="coffee-support">
      <p className="coffee-signature">Made with <Heart size={14} fill="currentColor" aria-label="love" /> by @sharan.created.this</p>
      <button className="coffee-invite" onClick={() => { setCopyState('idle'); setOpen(true); }} aria-haspopup="dialog">
        <span className="coffee-invite-icon"><Coffee size={29} strokeWidth={1.5} /></span>
        <span><strong>Buy Creator a Coffee</strong><small>A little appreciation, if you feel like it.</small></span>
        <span className="coffee-invite-arrow" aria-hidden="true">↗</span>
      </button>
      <p className="coffee-free-note">Hangly is free. A coffee is always optional.</p>

      <dialog ref={dialog} className="coffee-sheet" aria-labelledby="coffee-title" aria-describedby="coffee-description" onClose={() => setOpen(false)} onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
      }}>
        <button className="coffee-close" aria-label="Close coffee sheet" onClick={() => setOpen(false)} autoFocus><X size={20} /></button>
        <div className="coffee-sheet-icon" aria-hidden="true"><Coffee size={32} strokeWidth={1.5} /></div>
        <h2 id="coffee-title">☕ Buy Creator a Coffee</h2>
        <p id="coffee-description">Help keep Hangly growing.</p>
        <div className="coffee-qr"><img src="/coffee-upi.svg" alt="UPI payment QR code for 8870786087@yescred" width={280} height={280} /></div>
        <p className="coffee-scan-note">Scan with any UPI app. Choose your own amount.</p>
        <label className="coffee-upi-label" htmlFor="coffee-upi-id">UPI ID</label>
        <div className="coffee-copy-row">
          <input id="coffee-upi-id" value={UPI_ID} readOnly aria-label="UPI ID" onFocus={event => event.currentTarget.select()} />
          <button onClick={copyUPI} aria-label={copyState === 'copied' ? 'UPI ID copied' : 'Copy UPI ID'}>
            {copyState === 'copied' ? <Check size={17} /> : <Copy size={17} />}
            {copyState === 'copied' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="coffee-copy-status" role="status" aria-live="polite">{copyState === 'failed' ? 'Please select the UPI ID above and copy it manually.' : copyState === 'copied' ? 'UPI ID copied.' : '\u00a0'}</p>
        <p className="coffee-thanks">Thank you for using Hangly <span aria-label="love">❤️</span></p>
      </dialog>
    </div>
  );
}
