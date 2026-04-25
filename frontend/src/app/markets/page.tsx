'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { Sparkline } from '@/components/Sparkline';
import { api } from '@/lib/api';
import { cn, fmtUSD, fmtPct, fmtCompact } from '@/lib/utils';
import { Search } from 'lucide-react';

interface Coin {
  id: string; symbol: string; name: string; image: string;
  current_price: number; price_change_percentage_24h: number;
  total_volume: number; market_cap: number;
  sparkline_in_7d?: { price: number[] };
}

export default function MarketsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { api<Coin[]>('/api/markets').then(setCoins).catch(() => {}); }, []);
  const filtered = coins.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.symbol.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <main className="flex-1 px-3 py-4 lg:px-6 lg:py-6">
          <div className="glass p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-white">Markets</h1>
              <div className="flex items-center gap-2 rounded-lg border border-bg-border bg-bg-soft px-3 py-2 text-sm w-72">
                <Search className="h-4 w-4 text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent placeholder:text-muted focus:outline-none" placeholder="Search coins" />
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Price</th>
                    <th className="py-2 pr-2">24H</th>
                    <th className="py-2 pr-2">Volume</th>
                    <th className="py-2 pr-2">Market Cap</th>
                    <th className="py-2 pr-2">Last 7d</th>
                    <th className="py-2 pr-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const up = c.price_change_percentage_24h >= 0;
                    return (
                      <tr key={c.id} className="border-t border-bg-border/40 hover:bg-bg-soft/40">
                        <td className="py-2.5 pr-2 text-muted">{i + 1}</td>
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <Image src={c.image} alt={c.symbol} width={20} height={20} className="rounded-full" unoptimized />
                            <span className="font-semibold text-white">{c.name}</span>
                            <span className="text-xs text-muted">{c.symbol.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-2 text-white">{fmtUSD(c.current_price)}</td>
                        <td className={cn('py-2.5 pr-2', up ? 'text-brand-green' : 'text-brand-red')}>{fmtPct(c.price_change_percentage_24h)}</td>
                        <td className="py-2.5 pr-2 text-white/80">${fmtCompact(c.total_volume)}</td>
                        <td className="py-2.5 pr-2 text-white/80">${fmtCompact(c.market_cap)}</td>
                        <td className="py-2.5 pr-2"><Sparkline data={c.sparkline_in_7d?.price || []} positive={up} /></td>
                        <td className="py-2.5 pr-2">
                          <Link href={`/trade?pair=${c.symbol.toUpperCase()}USDT`} className="btn-primary px-3 py-1 text-xs">Trade</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
