'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const TIMEFRAMES = ['1m', '1H', '1D', '1W'] as const;

export function LiveChart({ symbol = 'BTCUSDT' }: { symbol?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState<typeof TIMEFRAMES[number]>('1D');

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const interval = tf === '1m' ? '1' : tf === '1H' ? '60' : tf === '1D' ? 'D' : 'W';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      backgroundColor: 'rgba(22, 26, 54, 0)',
      gridColor: 'rgba(35, 40, 71, 0.6)',
      withdateranges: true,
      save_image: false,
      support_host: 'https://www.tradingview.com'
    });
    ref.current.appendChild(script);
  }, [symbol, tf]);

  return (
    <div className="glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Live Chart</h3>
            <span className="text-xs text-muted">TradingView</span>
          </div>
          <p className="mt-1 text-xs text-muted">{symbol.replace('USDT', '/USDT')}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-bg-border bg-bg-soft p-1">
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={() => setTf(t)} className={cn(
              'rounded-md px-3 py-1 text-xs',
              tf === t ? 'bg-brand-yellow text-black font-semibold' : 'text-muted hover:text-white'
            )}>{t}</button>
          ))}
        </div>
      </div>
      <div ref={ref} className="mt-4 h-[360px] w-full" />
    </div>
  );
}
