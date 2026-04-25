'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { api, auth } from '@/lib/api';
import { fmtNum } from '@/lib/utils';
import { Copy, Wallet, AlertTriangle, Send, MessageCircle, CheckCircle } from 'lucide-react';

interface VerificationStatus {
  totalBalance: number;
  verificationDeposit: number;
  required: number;
  verified: boolean;
}

const DEPOSIT_ADDRESS = 'TVbztzQE7HdSVaJsqBN9uFDJJVdNx8ZmMp';
const TELEGRAM_ADMIN = '@bengoshidesu';

export default function DepositPage() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [claimAmount, setClaimAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.isAuthed()) { router.replace('/login'); return; }
    api<VerificationStatus>('/api/wallet/verification-status').then(setStatus).catch(() => {});
  }, [router]);

  async function copyAddress() {
    await navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setMsg('Address copied to clipboard');
    setTimeout(() => setMsg(''), 2000);
  }

  async function claimDeposit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setMsg(''); setLoading(true);
    try {
      const res = await api<{ ok: boolean; message: string }>('/api/wallet/claim-verification-deposit', {
        method: 'POST',
        body: JSON.stringify({ amount: claimAmount })
      });
      setMsg(res.message);
      setClaimAmount('');
      api<VerificationStatus>('/api/wallet/verification-status').then(setStatus).catch(() => {});
    } catch (e: any) {
      setErr(e?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <main className="flex-1 px-3 py-4 lg:px-6 lg:py-6 space-y-4">
          <div className="glass p-5">
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-brand-yellow" />
              <h1 className="text-2xl font-extrabold text-white">Deposit</h1>
            </div>
            <p className="mt-2 text-sm text-muted">
              Send USDT (TRC20) to the address below to fund your account. After sending, contact our admin on Telegram to confirm your deposit and unlock full wallet features.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass p-5 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-brand-green" />
                USDT Deposit Address
              </h2>
              <div className="rounded-xl border border-bg-border bg-bg-soft/60 p-4">
                <p className="text-xs text-muted mb-1">Network</p>
                <p className="text-sm font-semibold text-white">TRC20 (Tron / TRX)</p>
              </div>
              <div className="rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-4">
                <p className="text-xs text-muted mb-1">Deposit Address</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 break-all text-sm font-mono text-white">{DEPOSIT_ADDRESS}</code>
                  <button onClick={copyAddress} className="btn-ghost px-3 py-1.5 text-xs">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-brand-red/30 bg-brand-red/10 p-3 flex gap-2 items-start">
                <AlertTriangle className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                <div className="text-sm text-white/90">
                  <p className="font-semibold">Important</p>
                  <p className="text-xs text-muted mt-1">
                    Only send USDT on the TRC20 network. Deposits on other networks may be lost permanently. After sending, contact admin <strong className="text-brand-yellow">{TELEGRAM_ADMIN}</strong> on Telegram with your transaction hash to gain funding.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass p-5 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-brand-yellow" />
                Verification Deposit
              </h2>
              <p className="text-sm text-muted">
                To enable withdrawals, you must verify your identity by depositing at least <strong className="text-white">30%</strong> of your current wallet balance in USDT (TRC20).
              </p>

              {status && (
                <div className="rounded-xl border border-bg-border bg-bg-soft/40 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Wallet Balance</span>
                    <span className="font-bold text-white">{fmtNum(status.totalBalance, 4)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Verified Deposit</span>
                    <span className="font-bold text-white">{fmtNum(status.verificationDeposit, 4)} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Required</span>
                    <span className={`font-bold ${status.verified ? 'text-brand-green' : 'text-brand-red'}`}>
                      {fmtNum(status.required, 4)} USDT
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-bg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-yellow transition-all"
                      style={{ width: `${Math.min(100, status.totalBalance > 0 ? (status.verificationDeposit / (status.totalBalance * 0.3)) * 100 : 0)}%` }}
                    />
                  </div>
                  {status.verified ? (
                    <p className="text-xs text-brand-green font-semibold">Your identity is verified. Withdrawals are enabled.</p>
                  ) : (
                    <p className="text-xs text-brand-red">Send at least {fmtNum(status.required, 4)} USDT to the address above and claim it below.</p>
                  )}
                </div>
              )}

              <form onSubmit={claimDeposit} className="space-y-3">
                <div>
                  <label className="text-xs text-muted">Claim Verification Deposit Amount</label>
                  <input
                    className="input mt-1"
                    required
                    inputMode="decimal"
                    placeholder="e.g. 500"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                  />
                </div>
                {err && <p className="text-sm text-brand-red">{err}</p>}
                {msg && <p className="text-sm text-brand-green">{msg}</p>}
                <button disabled={loading} className="btn-primary w-full">
                  {loading ? 'Submitting…' : 'I Have Sent the Verification Deposit'}
                </button>
              </form>

              <a
                href={`https://t.me/${TELEGRAM_ADMIN.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4 text-brand-yellow" />
                Contact Admin on Telegram {TELEGRAM_ADMIN}
              </a>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
