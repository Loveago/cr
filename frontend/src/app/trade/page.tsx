'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { LiveChart } from '@/components/LiveChart';
import { api, auth } from '@/lib/api';
import { cn, fmtNum, fmtUSD } from '@/lib/utils';

function TradeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pair = (params.get('pair') || 'BTCUSDT').toUpperCase();
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [pairs, setPairs] = useState<{ symbol: string }[]>([]);

  useEffect(() => { api<{ symbol: string }[]>('/api/markets/pairs').then(setPairs).catch(() => {}); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setMsg(''); setLoading(true);
    if (!auth.isAuthed()) { router.push('/login'); return; }
    try {
      await api('/api/trade/orders', {
        method: 'POST',
        body: JSON.stringify({ pair, side, type, amount, price: type === 'LIMIT' ? price : undefined })
      });
      setMsg('Order filled');
      setAmount(''); setPrice('');
    } catch (e: any) {
      setErr(e?.message || 'Order failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <main className="flex-1 px-3 py-4 lg:px-6 lg:py-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="glass flex flex-wrap items-center gap-3 p-4">
                <select value={pair} onChange={(e) => router.push(`/trade?pair=${e.target.value}`)}
                  className="input max-w-[180px]">
                  {pairs.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol}</option>)}
                </select>
                <span className="text-sm text-muted">Spot · BINANCE</span>
              </div>
              <LiveChart symbol={pair} />
            </div>
            <div className="glass p-5">
              <div className="flex rounded-lg border border-bg-border bg-bg-soft p-1">
                {(['BUY', 'SELL'] as const).map(s => (
                  <button key={s} onClick={() => setSide(s)}
                    className={cn('flex-1 rounded-md py-2 text-sm font-semibold',
                      side === s ? (s === 'BUY' ? 'bg-brand-green text-black' : 'bg-brand-red text-white') : 'text-muted')}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                {(['MARKET', 'LIMIT'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={cn('rounded-full px-3 py-1', type === t ? 'bg-brand-yellow text-black font-semibold' : 'border border-bg-border text-muted')}>
                    {t}
                  </button>
                ))}
              </div>
              <form onSubmit={submit} className="mt-4 space-y-3">
                {type === 'LIMIT' && (
                  <div>
                    <label className="text-xs text-muted">Price (USDT)</label>
                    <input className="input mt-1" required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted">Amount ({pair.replace('USDT', '')})</label>
                  <input className="input mt-1" required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                {err && <p className="text-sm text-brand-red">{err}</p>}
                {msg && <p className="text-sm text-brand-green">{msg}</p>}
                <button disabled={loading}
                  className={cn('w-full font-semibold py-2.5 rounded-lg',
                    side === 'BUY' ? 'bg-brand-green text-black hover:brightness-110' : 'bg-brand-red text-white hover:brightness-110')}>
                  {loading ? 'Placing…' : `${side} ${pair.replace('USDT', '')}`}
                </button>
              </form>
              <p className="mt-3 text-xs text-muted">Fee: 0.10% · Settlement is instant on internal book.</p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function TradePage() {
  return <Suspense><TradeInner /></Suspense>;
}
