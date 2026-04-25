'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fmtUSD, fmtPct, cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Coin {
  id: string; symbol: string; name: string; image: string;
  current_price: number; price_change_percentage_24h: number;
}

const TICKER_SYMBOLS = ['btc', 'eth', 'bnb', 'sol', 'xrp', 'doge'];

export function PriceTicker() {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      try {
        const data = await api<Coin[]>('/api/markets');
        if (alive) setCoins(data);
      } catch {}
    };
    fetchData();
    const i = setInterval(fetchData, 15000);
    return () => { alive = false; clearInterval(i); };
  }, []);

  const featured = coins.filter(c => TICKER_SYMBOLS.includes(c.symbol.toLowerCase())).slice(0, 6);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {(featured.length ? featured : Array.from({ length: 6 }).map((_, i) => null)).map((c, i) => (
        <div key={c?.id || i} className="glass flex items-center gap-3 px-4 py-3">
          {c ? (
            <Image src={c.image} alt={c.symbol} width={32} height={32} className="rounded-full" unoptimized />
          ) : <div className="h-8 w-8 rounded-full bg-bg-border animate-pulse" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-xs text-muted">
              <span className="font-semibold text-white">{c?.symbol.toUpperCase() || '—'}</span>
              <span>/USDT</span>
              <span className={cn('ml-auto', (c?.price_change_percentage_24h ?? 0) >= 0 ? 'text-brand-green' : 'text-brand-red')}>
                {c ? fmtPct(c.price_change_percentage_24h) : '—'}
              </span>
            </div>
            <div className="text-sm font-bold text-white truncate">{c ? fmtUSD(c.current_price) : '—'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
