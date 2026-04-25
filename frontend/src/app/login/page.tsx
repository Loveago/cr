'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { api, auth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needs2fa, setNeeds2fa] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res: any = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, totp: totp || undefined }) });
      if (res?.require2fa) { setNeeds2fa(true); return; }
      auth.setSession(res.access, res.refresh);
      router.push(res.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg">
      <div className="absolute inset-0 -z-10 bg-grid-fade" />
      <div className="w-full max-w-md glass p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-2xl font-bold text-white text-center">Welcome back</h1>
        <p className="mt-1 text-sm text-muted text-center">Sign in to your CRYPTEX account</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-muted">Email</label>
            <input className="input mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted">Password</label>
            <input className="input mt-1" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {needs2fa && (
            <div>
              <label className="text-xs text-muted">2FA Code</label>
              <input className="input mt-1" inputMode="numeric" value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="6-digit code" />
            </div>
          )}
          {err && <p className="text-sm text-brand-red">{err}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          New here? <Link href="/register" className="text-brand-yellow hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
