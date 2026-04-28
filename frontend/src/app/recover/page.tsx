'use client';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, BadgeCheck, BadgeDollarSign, CheckCircle2, Send } from 'lucide-react';
import { api } from '@/lib/api';

export default function RecoverPage() {
  const [form, setForm] = useState({ fullName: '', email: '', walletAddr: '', amountLost: '', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await api('/api/recovery', { method: 'POST', body: JSON.stringify(form) });
      setSubmitted(true);
    } catch (e: any) {
      setErr(e?.message || 'Submission failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <span className="chip bg-brand-pink/15 text-brand-pink">Crypto Recovery Service</span>
            <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">Lost Funds to a <span className="text-brand-pink">Scam?</span></h1>
            <p className="mt-3 text-white/70">Our certified investigators help victims of crypto fraud, wire fraud, and PayPal scams trace and recover stolen funds. Confidential. No upfront fees.</p>
            <ul className="mt-6 space-y-3 text-white/90">
              <li className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-brand-pink" /> Certified scam recovery specialists</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-brand-pink" /> 100% privacy & encrypted communications</li>
              <li className="flex items-center gap-2"><BadgeDollarSign className="h-5 w-5 text-brand-pink" /> No fees unless we recover</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-brand-pink" /> Trusted recovery partners</li>
            </ul>
          </div>
          <div className="glass p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <CheckCircle2 className="h-12 w-12 text-brand-green" />
                <h2 className="mt-4 text-2xl font-bold text-white">Request received</h2>
                <p className="mt-2 text-white/70">A specialist will contact you within 24 hours at the email you provided.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h2 className="text-xl font-bold text-white">Tell us what happened</h2>
                <div>
                  <label className="text-xs text-muted">Full Name</label>
                  <input required className="input mt-1" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted">Email</label>
                  <input required type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted">Wallet Address (optional)</label>
                  <input className="input mt-1" value={form.walletAddr} onChange={(e) => setForm({ ...form, walletAddr: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted">Amount Lost (optional)</label>
                  <input className="input mt-1" placeholder="e.g. $25,000 or 0.5 BTC" value={form.amountLost} onChange={(e) => setForm({ ...form, amountLost: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted">What happened?</label>
                  <textarea required minLength={10} rows={4} className="input mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                {err && <p className="text-sm text-brand-red">{err}</p>}
                <button disabled={loading} className="btn-danger w-full">{loading ? 'Submitting…' : 'Recover My Funds'}</button>
                <p className="text-center text-xs text-muted">All submissions are confidential and encrypted.</p>
              </form>
            )}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-brand-pink/40 bg-gradient-to-br from-[#2a0e2a] to-[#1a0a25] p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-pink/30 blur-3xl" />
            <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-pink/20">
                <Send className="h-6 w-6 text-brand-pink" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-white">Need urgent help?</h3>
                <p className="mt-1 text-sm text-white/70">
                  If you lost money to a crypto, wire, or PayPal scam and need immediate assistance, reach out to us directly on Telegram.
                </p>
              </div>
              <a
                href="https://t.me/bengoshidesu"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-danger inline-flex items-center gap-2 px-5 py-2.5 text-sm shrink-0"
              >
                <Send className="h-4 w-4" />
                Contact @bengoshidesu
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
