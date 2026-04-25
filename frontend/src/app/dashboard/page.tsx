'use client';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { api, auth } from '@/lib/api';
import { fmtUSD, fmtNum } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';

interface User { id: string; email: string; fullName?: string; role: string; kycStatus: string; twoFactorEnabled: boolean; referralCode: string; }
interface Wallet { id: string; balance: string; locked: string; address: string; coin: { symbol: string; name: string; iconUrl?: string } }
interface Tx { id: string; type: string; status: string; coin: string; amount: string; createdAt: string; note?: string }

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    if (!auth.isAuthed()) { router.replace('/login'); return; }
    api<{ user: User }>('/api/auth/me').then((r) => setUser(r.user)).catch(() => router.replace('/login'));
    api<Wallet[]>('/api/wallet').then(setWallets).catch(() => {});
    api<Tx[]>('/api/wallet/transactions').then(setTxs).catch(() => {});
  }, [router]);

  function logout() { auth.clear(); router.push('/'); }

  const totalUsd = wallets.reduce((s, w) => s + Number(w.balance) * (w.coin.symbol === 'USDT' ? 1 : 1), 0);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <main className="flex-1 px-3 py-4 lg:px-6 lg:py-6 space-y-4">
          <div className="glass flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs text-muted">Welcome back</p>
              <h1 className="text-2xl font-extrabold text-white">{user?.fullName || user?.email}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="chip bg-brand-yellow/15 text-brand-yellow">KYC: {user?.kycStatus || 'NONE'}</span>
                <span className={`chip ${user?.twoFactorEnabled ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-red/15 text-brand-red'}`}>
                  <ShieldCheck className="h-3 w-3" /> 2FA {user?.twoFactorEnabled ? 'ON' : 'OFF'}
                </span>
                <span className="chip bg-bg-soft text-muted">Ref: {user?.referralCode}</span>
              </div>
            </div>
            <button onClick={logout} className="btn-ghost"><LogOut className="h-4 w-4" /> Logout</button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass p-5 lg:col-span-2">
              <h2 className="text-lg font-bold text-white">Wallet Overview</h2>
              <p className="mt-1 text-xs text-muted">Estimated total balance</p>
              <p className="mt-2 text-3xl font-extrabold text-white">{fmtUSD(totalUsd)}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {wallets.map(w => (
                  <div key={w.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-soft/40 p-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{w.coin.symbol}</p>
                      <p className="text-xs text-muted truncate max-w-[140px]" title={w.address}>{w.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{fmtNum(Number(w.balance), 6)}</p>
                      {Number(w.locked) > 0 && <p className="text-xs text-brand-red">Locked: {fmtNum(Number(w.locked), 6)}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/trade" className="btn-primary">Trade</Link>
                <Link href="/wallet" className="btn-ghost">Deposit / Withdraw</Link>
              </div>
            </div>
            <div className="glass p-5">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <div className="mt-3 space-y-2">
                {txs.slice(0, 8).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-soft/40 p-2 text-sm">
                    <div>
                      <p className="font-semibold text-white">{tx.type} <span className="text-xs text-muted">{tx.coin}</span></p>
                      <p className="text-xs text-muted">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{fmtNum(Number(tx.amount), 6)}</p>
                      <p className={`text-xs ${tx.status === 'COMPLETED' ? 'text-brand-green' : tx.status === 'PENDING' ? 'text-brand-yellow' : 'text-brand-red'}`}>{tx.status}</p>
                    </div>
                  </div>
                ))}
                {!txs.length && <p className="text-sm text-muted">No transactions yet.</p>}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
