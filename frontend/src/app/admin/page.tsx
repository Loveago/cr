'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Users, TrendingUp, ArrowDownToLine, Inbox } from 'lucide-react';

interface Stats { users: number; trades24: number; withdrawalsPending: number; leadsNew: number; totalVolume: string }

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { api<Stats>('/api/admin/stats').then(setStats).catch(() => {}); }, []);
  const cards = [
    { icon: Users, label: 'Total Users', value: stats?.users ?? '—', color: 'text-brand-yellow' },
    { icon: TrendingUp, label: '24h Trades', value: stats?.trades24 ?? '—', color: 'text-brand-green' },
    { icon: ArrowDownToLine, label: 'Pending Withdrawals', value: stats?.withdrawalsPending ?? '—', color: 'text-brand-orange' },
    { icon: Inbox, label: 'New Recovery Leads', value: stats?.leadsNew ?? '—', color: 'text-brand-pink' }
  ];
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">Admin Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="glass p-5">
            <c.icon className={`h-6 w-6 ${c.color}`} />
            <p className="mt-3 text-3xl font-extrabold text-white">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 glass p-5">
        <h2 className="text-lg font-bold text-white">Total Trade Volume</h2>
        <p className="mt-1 text-2xl font-extrabold text-brand-yellow">{stats?.totalVolume || '0'}</p>
        <p className="text-xs text-muted">Cumulative base-asset trade amount across all pairs</p>
      </div>
    </div>
  );
}
