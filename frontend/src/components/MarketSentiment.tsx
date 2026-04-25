'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function MarketSentiment() {
  const [data, setData] = useState<{ value: number; classification: string }>({ value: 72, classification: 'Greed' });
  useEffect(() => { api<{ value: number; classification: string }>('/api/markets/sentiment').then(setData).catch(() => {}); }, []);

  // gauge: arc from -90deg to 90deg
  const angle = -90 + (data.value / 100) * 180;
  return (
    <div className="glass p-5">
      <h3 className="text-lg font-bold text-white">Market Sentiment</h3>
      <div className="mt-4 flex items-center justify-center">
        <div className="relative h-36 w-64">
          <svg viewBox="0 0 200 110" className="h-full w-full">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f7c521" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <path d="M10 100 A90 90 0 0 1 190 100" stroke="url(#g1)" strokeWidth="14" fill="none" strokeLinecap="round" />
            <line x1="100" y1="100" x2={100 + 70 * Math.cos((angle * Math.PI) / 180)} y2={100 + 70 * Math.sin((angle * Math.PI) / 180)}
              stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill="white" />
          </svg>
          <div className="absolute inset-x-0 top-12 text-center">
            <div className="text-4xl font-extrabold text-white">{data.value}</div>
            <div className="text-xs font-semibold text-brand-green">{data.classification}</div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>0 Fear</span><span>100 Greed</span>
      </div>
    </div>
  );
}
