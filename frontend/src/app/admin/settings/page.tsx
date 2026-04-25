'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Pair { id: string; symbol: string; enabled: boolean; feeBps: number }
interface Coin { id: string; symbol: string; name: string; enabled: boolean }

export default function AdminSettings() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);

  async function load() {
    setPairs(await api('/api/admin/pairs'));
    setCoins(await api('/api/admin/coins'));
  }
  useEffect(() => { load(); }, []);

  async function patchPair(id: string, patch: Partial<Pair>) {
    await api(`/api/admin/pairs/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    load();
  }
  async function patchCoin(id: string, patch: Partial<Coin>) {
    await api(`/api/admin/coins/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">System Controls</h1>
      <section className="glass p-5">
        <h2 className="text-lg font-bold text-white">Trading Pairs</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr><th className="p-2">Symbol</th><th className="p-2">Enabled</th><th className="p-2">Fee (bps)</th></tr>
          </thead>
          <tbody>
            {pairs.map(p => (
              <tr key={p.id} className="border-t border-bg-border/40">
                <td className="p-2 text-white">{p.symbol}</td>
                <td className="p-2">
                  <button onClick={() => patchPair(p.id, { enabled: !p.enabled })}
                    className={`chip ${p.enabled ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-red/15 text-brand-red'}`}>
                    {p.enabled ? 'ON' : 'OFF'}
                  </button>
                </td>
                <td className="p-2">
                  <input type="number" defaultValue={p.feeBps} className="input max-w-[100px]"
                    onBlur={(e) => patchPair(p.id, { feeBps: Number(e.target.value) })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="glass p-5">
        <h2 className="text-lg font-bold text-white">Supported Coins</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {coins.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-soft/40 p-3">
              <div>
                <p className="text-sm font-bold text-white">{c.symbol}</p>
                <p className="text-xs text-muted">{c.name}</p>
              </div>
              <button onClick={() => patchCoin(c.id, { enabled: !c.enabled })}
                className={`chip ${c.enabled ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-red/15 text-brand-red'}`}>
                {c.enabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
