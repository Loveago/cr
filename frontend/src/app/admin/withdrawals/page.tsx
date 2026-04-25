'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Tx {
  id: string; userId: string; coin: string; amount: string; address?: string;
  status: string; createdAt: string;
  user: { email: string; fullName?: string };
}

export default function AdminWithdrawals() {
  const [txs, setTxs] = useState<Tx[]>([]);
  async function load() { setTxs(await api('/api/admin/withdrawals')); }
  useEffect(() => { load(); }, []);
  async function approve(id: string) { await api(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' }); load(); }
  async function reject(id: string) { await api(`/api/admin/withdrawals/${id}/reject`, { method: 'POST' }); load(); }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">Withdrawals</h1>
      <div className="mt-4 glass overflow-x-auto p-3">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr><th className="p-2">Created</th><th className="p-2">User</th><th className="p-2">Coin</th><th className="p-2">Amount</th><th className="p-2">Address</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.id} className="border-t border-bg-border/40">
                <td className="p-2 text-muted">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-2 text-white">{t.user?.email}</td>
                <td className="p-2 text-white">{t.coin}</td>
                <td className="p-2 text-white">{t.amount}</td>
                <td className="p-2 text-muted text-xs truncate max-w-[200px]" title={t.address || ''}>{t.address || '—'}</td>
                <td className="p-2">
                  <span className={`chip ${t.status === 'PENDING' ? 'bg-brand-yellow/15 text-brand-yellow' : t.status === 'COMPLETED' ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-red/15 text-brand-red'}`}>{t.status}</span>
                </td>
                <td className="p-2">
                  {t.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <button onClick={() => approve(t.id)} className="rounded bg-brand-green/20 px-2 py-1 text-xs text-brand-green">Approve</button>
                      <button onClick={() => reject(t.id)} className="rounded bg-brand-red/20 px-2 py-1 text-xs text-brand-red">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!txs.length && <tr><td colSpan={7} className="p-4 text-center text-muted">No withdrawals</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
