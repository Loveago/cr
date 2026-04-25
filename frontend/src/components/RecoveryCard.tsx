'use client';
import Link from 'next/link';
import { ShieldCheck, BadgeCheck, BadgeDollarSign, ArrowRight } from 'lucide-react';

export function RecoveryCard() {
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-brand-pink/40 bg-gradient-to-br from-[#2a0e2a] to-[#1a0a25] p-6 shadow-card">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-pink/30 blur-3xl" />
      <h3 className="text-xl font-extrabold text-white">Lost Crypto to a Scam?</h3>
      <p className="mt-2 text-sm text-white/80">
        We specialize in crypto recovery and blockchain investigation to help you get your funds back.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-white/90">
        <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand-pink" /> Scam Recovery Experts</li>
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-pink" /> Privacy Guaranteed</li>
        <li className="flex items-center gap-2"><BadgeDollarSign className="h-4 w-4 text-brand-pink" /> No Upfront Fees</li>
      </ul>
      <Link href="/recover" className="btn-danger mt-5 w-full">Recover My Funds</Link>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {['#22c55e','#f7c521','#ff8c2b','#ff3a8c'].map((c,i) => (
            <div key={i} className="h-6 w-6 rounded-full ring-2 ring-bg-card" style={{ background: c }} />
          ))}
        </div>
        <span className="text-xs text-white/70">Professional recovery services</span>
      </div>
      <Link href="/recover" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-pink hover:underline">
        How It Works <ArrowRight className="h-3 w-3" />
      </Link>
    </aside>
  );
}
