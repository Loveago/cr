'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BarChart3, ArrowLeftRight, Rocket, Sprout, Wallet, ListOrdered,
  User, Users, LifeBuoy, QrCode, ArrowDownCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Markets', href: '/markets', icon: BarChart3 },
  { label: 'Trade', href: '/trade', icon: ArrowLeftRight },
  { label: 'Futures', href: '/trade?futures=1', icon: Rocket, badge: 'NEW' },
  { label: 'Earn', href: '/dashboard', icon: Sprout },
  { label: 'Deposit', href: '/deposit', icon: ArrowDownCircle },
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Orders', href: '/dashboard?tab=orders', icon: ListOrdered },
  { label: 'Profile', href: '/dashboard?tab=profile', icon: User },
  { label: 'Referral', href: '/dashboard?tab=referral', icon: Users },
  { label: 'Support', href: '/recover', icon: LifeBuoy }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-bg-border/60 bg-bg-soft/40 p-3 gap-1">
      {ITEMS.map(({ label, href, icon: Icon, badge }) => {
        const active = pathname === href || (href !== '/' && pathname?.startsWith(href.split('?')[0]));
        return (
          <Link key={label} href={href} className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
            active ? 'bg-gradient-to-r from-brand-yellow/20 to-transparent text-white border-l-2 border-brand-yellow'
                   : 'text-white/70 hover:bg-bg-card hover:text-white'
          )}>
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {badge && <span className="text-[10px] font-bold bg-brand-green/20 text-brand-green rounded px-1.5 py-0.5">{badge}</span>}
          </Link>
        );
      })}
      <div className="mt-auto rounded-xl border border-bg-border bg-gradient-to-br from-bg-card to-bg-soft p-4">
        <p className="text-sm font-semibold text-white">Trade Anywhere Anytime</p>
        <p className="mt-1 text-xs text-muted">Download our mobile app and trade on the go</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="col-span-1 flex items-center justify-center rounded-md bg-white/10 p-3"><QrCode className="h-8 w-8 text-white" /></div>
          <div className="col-span-2 space-y-1.5">
            <div className="rounded-md bg-black/60 px-2 py-1.5 text-[10px] text-white">App Store</div>
            <div className="rounded-md bg-black/60 px-2 py-1.5 text-[10px] text-white">Google Play</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
