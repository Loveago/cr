'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { api, auth } from '@/lib/api';
import { Users, ArrowDownToLine, Inbox, Settings, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
  { href: '/admin/recovery', label: 'Recovery Leads', icon: Inbox },
  { href: '/admin/settings', label: 'System', icon: Settings }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!auth.isAuthed()) { router.replace('/login'); return; }
    api<{ user: { role: string } }>('/api/auth/me').then(({ user }) => {
      if (user.role !== 'ADMIN') router.replace('/dashboard');
      else setOk(true);
    }).catch(() => router.replace('/login'));
  }, [router]);

  if (!ok) return <div className="min-h-screen flex items-center justify-center text-muted">Loading…</div>;

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-60 shrink-0 border-r border-bg-border bg-bg-soft/40 p-4">
        <Logo />
        <p className="mt-1 text-xs text-brand-yellow font-semibold">ADMIN PANEL</p>
        <nav className="mt-6 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                active ? 'bg-brand-yellow/15 text-brand-yellow' : 'text-white/70 hover:bg-bg-card hover:text-white'
              )}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => { auth.clear(); router.push('/'); }} className="mt-6 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-bg-card">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
