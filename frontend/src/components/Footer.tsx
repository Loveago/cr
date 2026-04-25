import { Star } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-bg-border/60 bg-bg-soft/30">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-4 py-6 lg:px-8">
        <p className="text-sm text-muted">Your trusted<br /><span className="text-white font-semibold">Crypto Exchange</span></p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-white/80">
          <span className="text-sm font-semibold tracking-wide">Spot</span>
          <span className="text-sm font-semibold tracking-wide">Futures</span>
          <span className="text-sm font-semibold tracking-wide">Earn</span>
          <span className="text-sm font-semibold tracking-wide">NFT</span>
          <span className="text-sm font-semibold tracking-wide">Wallet</span>
          <div className="flex items-center gap-1 text-brand-green">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
          </div>
        </div>
      </div>
      <div className="border-t border-bg-border/40 px-4 py-4 text-center text-xs text-muted lg:px-8">
        © {new Date().getFullYear()} CRYPTEX. All rights reserved. · Cryptocurrency trading involves significant risk.
      </div>
    </footer>
  );
}
