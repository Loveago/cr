'use client';

import { useState, useEffect } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';

export function ScamPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('scam-popup-dismissed');
    if (!dismissed) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem('scam-popup-dismissed', '1');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-brand-pink/40 bg-gradient-to-br from-[#2a0e2a] to-[#1a0a25] p-6 shadow-2xl">
        <button onClick={dismiss} className="absolute right-3 top-3 rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white transition">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink/20">
            <AlertTriangle className="h-5 w-5 text-brand-pink" />
          </div>
          <h2 className="text-lg font-extrabold text-white">Have you been scammed?</h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-white/80">
          Lost crypto to a scam? You are not alone. Our certified blockchain investigators have recovered millions for victims worldwide. Reach out now for immediate, confidential help.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <a
            href="https://t.me/bengoshidesu"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="btn-danger inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
          >
            <Send className="h-4 w-4" />
            Contact us on Telegram (@bengoshidesu)
          </a>
          <button
            onClick={dismiss}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-bg-border bg-bg-soft/60 px-4 py-2 text-xs text-white/70 hover:bg-bg-card transition"
          >
            No thanks, I am here to trade
          </button>
        </div>
      </div>
    </div>
  );
}
