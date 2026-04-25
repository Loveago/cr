'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, fmtUSD, fmtPct, fmtCompact } from '@/lib/utils';
import { api } from '@/lib/api';
import { Sparkline } from './Sparkline';

interface Coin {
  id: string; symbol: string; name: string; image: string;
  current_price: number; price_change_percentage_24h: number;
  total_volume: number; sparkline_in_7d?: { price: number[] };
}

const TABS = ['Hot', 'Gainers', 'Losers', 'New Listings'] as const;

export function MarketOverview() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [tab, setTab] = useState<typeof TABS[number]>('Hot');

  useEffect(() => {
    api<Coin[]>('/api/markets').then(setCoins).catch(() => {});
  }, []);

  const list = useMemo(() => {
    const arr = [...coins];
    if (tab === 'Gainers') arr.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    else if (tab === 'Losers') arr.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    else if (tab === 'New Listings') arr.reverse();
    else arr.sort((a, b) => b.total_volume - a.total_volume);
    return arr.slice(0, 7);
  }, [coins, tab]);

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Market Overview</h2>
        <Link href="/markets" className="text-sm text-brand-yellow hover:underline">View All</Link>
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('pb-2 border-b-2 transition',
              tab === t ? 'border-brand-yellow text-white' : 'border-transparent text-muted hover:text-white')}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Name</th>
              <th className="py-2 pr-2">Price</th>
              <th className="py-2 pr-2">24H Change</th>
              <th className="py-2 pr-2">24H Volume</th>
              <th className="py-2 pr-2">Chart</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => {
              const up = c.price_change_percentage_24h >= 0;
              return (
                <tr key={c.id} className="border-t border-bg-border/40 hover:bg-bg-soft/40">
                  <td className="py-2.5 pr-2 text-muted">{i + 1}</td>
                  <td className="py-2.5 pr-2">
                    <Link href={`/trade?pair=${c.symbol.toUpperCase()}USDT`} className="flex items-center gap-2">
                      <Image src={c.image} alt={c.symbol} width={20} height={20} className="rounded-full" unoptimized />
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-xs text-muted">{c.symbol.toUpperCase()}</span>
                    </Link>
                  </td>
                  <td className="py-2.5 pr-2 text-white">{fmtUSD(c.current_price)}</td>
                  <td className={cn('py-2.5 pr-2', up ? 'text-brand-green' : 'text-brand-red')}>{fmtPct(c.price_change_percentage_24h)}</td>
                  <td className="py-2.5 pr-2 text-white/80">${fmtCompact(c.total_volume)}</td>
                  <td className="py-2.5 pr-2"><Sparkline data={c.sparkline_in_7d?.price || []} positive={up} /></td>
                </tr>
              );
            })}
            {!list.length && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-bg-border/40"><td colSpan={6} className="py-3 text-muted">Loading…</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
