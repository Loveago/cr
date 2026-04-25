'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Lead {
  id: string; fullName: string; email: string; walletAddr?: string; amountLost?: string;
  description: string; status: string; internalNote?: string; createdAt: string;
}

const STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

export default function AdminRecovery() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState<Lead | null>(null);
  const [note, setNote] = useState('');

  async function load() { setLeads(await api('/api/admin/recovery')); }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: Partial<Lead>) {
    await api(`/api/admin/recovery/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    load();
    if (open?.id === id) setOpen({ ...open, ...patch } as Lead);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">Recovery Leads</h1>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass overflow-x-auto p-3">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr><th className="p-2">Date</th><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Amount</th><th className="p-2">Status</th></tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} onClick={() => { setOpen(l); setNote(l.internalNote || ''); }}
                  className={`cursor-pointer border-t border-bg-border/40 hover:bg-bg-soft/40 ${open?.id === l.id ? 'bg-bg-soft/60' : ''}`}>
                  <td className="p-2 text-muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 text-white">{l.fullName}</td>
                  <td className="p-2 text-white/80">{l.email}</td>
                  <td className="p-2 text-white/80">{l.amountLost || '—'}</td>
                  <td className="p-2"><span className={`chip ${l.status === 'NEW' ? 'bg-brand-pink/15 text-brand-pink' : l.status === 'RESOLVED' ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-yellow/15 text-brand-yellow'}`}>{l.status}</span></td>
                </tr>
              ))}
              {!leads.length && <tr><td colSpan={5} className="p-4 text-center text-muted">No leads</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="glass p-5">
          {open ? (
            <div>
              <h2 className="text-lg font-bold text-white">{open.fullName}</h2>
              <p className="text-sm text-muted">{open.email}</p>
              <div className="mt-3 space-y-2 text-sm text-white/80">
                <p><span className="text-muted">Wallet:</span> {open.walletAddr || '—'}</p>
                <p><span className="text-muted">Amount lost:</span> {open.amountLost || '—'}</p>
                <p><span className="text-muted">Submitted:</span> {new Date(open.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-3 text-sm text-white/90 whitespace-pre-wrap">{open.description}</p>
              <div className="mt-4">
                <label className="text-xs text-muted">Internal note</label>
                <textarea rows={4} className="input mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
                <button onClick={() => update(open.id, { internalNote: note })} className="btn-ghost mt-2 text-sm">Save note</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => update(open.id, { status: s })}
                    className={`rounded-full px-3 py-1 text-xs ${open.status === s ? 'bg-brand-yellow text-black font-semibold' : 'border border-bg-border text-muted hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : <p className="text-muted">Select a lead to view details</p>}
        </div>
      </div>
    </div>
  );
}
