'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn, fmtUSD, fmtPct } from '@/lib/utils';

interface Coin {
  id: string; symbol: string; name: string; image: string;
  current_price: number; price_change_percentage_24h: number;
}

const TABS = ['Top', 'Gainers', 'Losers', 'New'] as const;

export function TopMovers() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [tab, setTab] = useState<typeof TABS[number]>('Top');

  useEffect(() => { api<Coin[]>('/api/markets').then(setCoins).catch(() => {}); }, []);

  const list = useMemo(() => {
    const arr = [...coins];
    if (tab === 'Gainers') arr.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    else if (tab === 'Losers') arr.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    else if (tab === 'New') arr.reverse();
    return arr.slice(0, 6);
  }, [coins, tab]);

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Top Movers</h3>
        <Link href="/markets" className="text-sm text-brand-yellow hover:underline">View All</Link>
      </div>
      <div className="mt-3 flex gap-3 text-xs">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'rounded-full px-3 py-1',
            tab === t ? 'bg-brand-yellow text-black font-semibold' : 'border border-bg-border text-muted hover:text-white'
          )}>{t}</button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {(list.length ? list : Array.from({ length: 6 }).map(() => null)).map((c, i) => (
          <Link key={c?.id || i} href={c ? `/trade?pair=${c.symbol.toUpperCase()}USDT` : '#'}
            className="flex items-center gap-3 rounded-lg border border-bg-border/60 bg-bg-soft/40 px-3 py-2 hover:bg-bg-card">
            {c ? <Image src={c.image} alt={c.symbol} width={28} height={28} className="rounded-full" unoptimized /> :
              <div className="h-7 w-7 rounded-full bg-bg-border animate-pulse" />}
            <div className="flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-white">{c?.symbol.toUpperCase() || '—'}</span>
                <span className="text-xs text-muted">/USDT</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">{c ? fmtUSD(c.current_price) : '—'}</div>
              <div className={cn('text-xs', (c?.price_change_percentage_24h ?? 0) >= 0 ? 'text-brand-green' : 'text-brand-red')}>
                {c ? fmtPct(c.price_change_percentage_24h) : ''}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
