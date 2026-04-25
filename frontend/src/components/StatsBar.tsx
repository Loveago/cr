import { Users, Coins, TrendingUp, ServerCog, Headphones, ShieldCheck } from 'lucide-react';

const ITEMS = [
  { icon: Users, value: 'Global', label: 'Traders' },
  { icon: Coins, value: '350+', label: 'Cryptocurrencies' },
  { icon: TrendingUp, value: 'Low Fees', label: 'Trading' },
  { icon: ServerCog, value: '99.99%', label: 'Uptime SLA' },
  { icon: Headphones, value: '24/7', label: 'Support' },
  { icon: ShieldCheck, value: 'Secure', label: 'Encryption' }
];

export function StatsBar() {
  return (
    <div className="glass grid grid-cols-2 gap-px overflow-hidden md:grid-cols-3 lg:grid-cols-6">
      {ITEMS.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-3 bg-bg-card/40 px-5 py-4">
          <div className="rounded-lg bg-brand-yellow/15 p-2"><Icon className="h-5 w-5 text-brand-yellow" /></div>
          <div>
            <div className="text-base font-extrabold text-white leading-none">{value}</div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
