'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Sun, Moon, ChevronDown, LogOut, Wallet, UserCircle, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { auth } from '@/lib/api';
import { Logo } from './Logo';

const NAV = [
  { label: 'Markets', href: '/markets' },
  { label: 'Trade', href: '/trade' },
  { label: 'Earn', href: '/dashboard' },
  { label: 'Buy Crypto', href: '/deposit' },
  { label: 'Wallet', href: '/wallet' }
];

interface AuthedUser {
  id: string;
  email: string;
  fullName?: string;
  role: string;
}

export function Navbar() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
    if (auth.isAuthed()) {
      setAuthed(true);
      import('@/lib/api').then(({ api }) => {
        api<{ user: AuthedUser }>('/api/auth/me').then(r => setUser(r.user)).catch(() => setAuthed(false));
      });
    }
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('cryptex.theme', next ? 'dark' : 'light');
    setIsDark(next);
  }

  function logout() {
    auth.clear();
    setAuthed(false);
    setUser(null);
    setMenuOpen(false);
    router.push('/');
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-bg-border/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 lg:px-8">
        <Link href="/" className="flex items-center"><Logo /></Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map(n => (
            <Link key={n.label} href={n.href} className="text-sm text-white/80 hover:text-white transition">
              {n.label}
            </Link>
          ))}
          <button className="flex items-center gap-1 text-sm text-white/80 hover:text-white">
            More <ChevronDown className="h-4 w-4" />
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-bg-border bg-bg-soft px-3 py-2 text-sm text-muted w-64">
            <Search className="h-4 w-4" />
            <input className="flex-1 bg-transparent placeholder:text-muted focus:outline-none" placeholder="Search coins" />
          </div>

          {authed ? (
            <>
              <button className="rounded-lg border border-bg-border bg-bg-soft p-2 hover:bg-bg-card"><Bell className="h-4 w-4" /></button>
              <button onClick={toggleTheme} className="rounded-lg border border-bg-border bg-bg-soft p-2 hover:bg-bg-card" title="Toggle theme">
                {isDark ? <Sun className="h-4 w-4 text-brand-yellow" /> : <Moon className="h-4 w-4 text-brand-pink" />}
              </button>
              <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm">Dashboard</Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-brand-pink ring-2 ring-bg-border text-white text-sm font-bold hover:brightness-110 transition"
                >
                  {user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-bg-border bg-bg-card shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-bg-border/40">
                      <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-bg-soft transition">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link href="/wallet" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-bg-soft transition">
                        <Wallet className="h-4 w-4" /> Wallet
                      </Link>
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-bg-soft transition">
                        <UserCircle className="h-4 w-4" /> Profile
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-bg-soft transition">
                          <ShieldCheck className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-bg-border/40 p-1">
                      <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-red hover:bg-brand-red/10 transition">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/80 hover:text-white transition">Sign In</Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
