'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { api, auth } from '@/lib/api';

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(params.get('email') || '');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(params.get('ref') || '');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res: any = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, referralCode: referralCode || undefined })
      });
      auth.setSession(res.access, res.refresh);
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-md glass p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-2xl font-bold text-white text-center">Create your account</h1>
        <p className="mt-1 text-sm text-muted text-center">Start trading securely today</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-muted">Full Name</label>
            <input className="input mt-1" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted">Email</label>
            <input className="input mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted">Password (min 8 chars)</label>
            <input className="input mt-1" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted">Referral Code (optional)</label>
            <input className="input mt-1" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
          </div>
          {err && <p className="text-sm text-brand-red">{err}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already registered? <Link href="/login" className="text-brand-yellow hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterInner /></Suspense>;
}
