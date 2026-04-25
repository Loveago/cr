import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function fmtUSD(n: number, opts: Intl.NumberFormatOptions = {}) {
  if (!isFinite(n)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n < 1 ? 4 : 2, ...opts }).format(n);
}
export function fmtNum(n: number, decimals = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(n);
}
export function fmtPct(n: number | null | undefined) {
  if (n == null || !isFinite(n)) return '0.00%';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}
export function fmtCompact(n: number | null | undefined) {
  if (n == null || !isFinite(n)) return '0';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n);
}
