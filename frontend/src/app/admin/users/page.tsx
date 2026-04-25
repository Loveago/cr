'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Wallet, ChevronDown, ChevronUp } from 'lucide-react';

interface Coin { id: string; symbol: string; name: string }
interface WalletItem { id: string; coinId: string; coin: Coin; balance: string; address: string }
interface User { id: string; email: string; fullName?: string; role: string; status: string; kycStatus: string; createdAt: string; wallets?: WalletItem[] }

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editCoinId, setEditCoinId] = useState('');
  const [editBalance, setEditBalance] = useState('');

  async function load() {
    const data = await api<User[]>(`/api/admin/users?q=${encodeURIComponent(q)}`);
    setUsers(data);
  }
  async function loadCoins() {
    const data = await api<Coin[]>('/api/admin/coins');
    setCoins(data);
  }
  useEffect(() => { load(); loadCoins(); }, []); // eslint-disable-line

  async function update(id: string, patch: Partial<User>) {
    await api(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    load();
  }

  async function saveBalance(userId: string) {
    if (!editCoinId || !editBalance) return;
    await api(`/api/admin/users/${userId}/balance`, { method: 'PATCH', body: JSON.stringify({ coinId: editCoinId, balance: editBalance }) });
    setEditUserId(null);
    setEditCoinId('');
    setEditBalance('');
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">Users</h1>
        <div className="flex items-center gap-2 rounded-lg border border-bg-border bg-bg-soft px-3 py-2 w-72">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()}
            className="flex-1 bg-transparent text-sm placeholder:text-muted focus:outline-none" placeholder="Search email or name" />
        </div>
      </div>
      <div className="mt-4 glass overflow-x-auto p-3">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr><th className="p-2">Email</th><th className="p-2">Name</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">KYC</th><th className="p-2">Joined</th><th className="p-2">Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <>
                <tr key={u.id} className="border-t border-bg-border/40 cursor-pointer hover:bg-bg-soft/40" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                  <td className="p-2 text-white">{u.email}</td>
                  <td className="p-2 text-white/80">{u.fullName || '—'}</td>
                  <td className="p-2"><span className="chip bg-bg-soft text-white/80">{u.role}</span></td>
                  <td className="p-2">
                    <span className={`chip ${u.status === 'ACTIVE' ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-red/15 text-brand-red'}`}>{u.status}</span>
                  </td>
                  <td className="p-2"><span className="chip bg-brand-yellow/15 text-brand-yellow">{u.kycStatus}</span></td>
                  <td className="p-2 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {u.status !== 'FROZEN'
                        ? <button onClick={(e) => { e.stopPropagation(); update(u.id, { status: 'FROZEN' as any }); }} className="rounded bg-brand-red/20 px-2 py-1 text-xs text-brand-red">Freeze</button>
                        : <button onClick={(e) => { e.stopPropagation(); update(u.id, { status: 'ACTIVE' as any }); }} className="rounded bg-brand-green/20 px-2 py-1 text-xs text-brand-green">Activate</button>}
                      {u.kycStatus === 'PENDING' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); update(u.id, { kycStatus: 'APPROVED' as any }); }} className="rounded bg-brand-green/20 px-2 py-1 text-xs text-brand-green">Approve KYC</button>
                          <button onClick={(e) => { e.stopPropagation(); update(u.id, { kycStatus: 'REJECTED' as any }); }} className="rounded bg-brand-red/20 px-2 py-1 text-xs text-brand-red">Reject KYC</button>
                        </>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setExpanded(expanded === u.id ? null : u.id); }} className="rounded bg-bg-border px-2 py-1 text-xs text-white/70">
                        {expanded === u.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === u.id && (
                  <tr className="border-t border-bg-border/40 bg-bg-soft/30">
                    <td colSpan={7} className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <Wallet className="h-4 w-4 text-brand-yellow" />
                          Wallets
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {(u.wallets || []).map(w => (
                            <div key={w.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-card px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-brand-yellow">{w.coin.symbol}</span>
                                <span className="text-xs text-muted">{w.address.slice(0,12)}…{w.address.slice(-4)}</span>
                              </div>
                              <span className="text-sm font-semibold text-white">{w.balance}</span>
                            </div>
                          ))}
                          {(!u.wallets || u.wallets.length === 0) && <p className="text-xs text-muted">No wallets</p>}
                        </div>
                        {editUserId === u.id ? (
                          <div className="flex flex-wrap items-end gap-2">
                            <div>
                              <label className="text-xs text-muted">Coin</label>
                              <select value={editCoinId} onChange={(e) => setEditCoinId(e.target.value)} className="input mt-1 text-sm">
                                <option value="">Select coin</option>
                                {coins.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-muted">Balance</label>
                              <input type="number" step="0.00000001" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="input mt-1 text-sm" placeholder="0.00" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveBalance(u.id)} className="btn-primary px-3 py-1.5 text-xs">Save</button>
                              <button onClick={() => { setEditUserId(null); setEditCoinId(''); setEditBalance(''); }} className="btn-ghost px-3 py-1.5 text-xs">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setEditUserId(u.id)} className="btn-primary w-fit px-3 py-1.5 text-xs">Edit Balance</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {!users.length && <tr><td colSpan={7} className="p-4 text-center text-muted">No users</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
