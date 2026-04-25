import Redis from 'ioredis';
import { env } from './env';

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(env.REDIS_URL, { lazyConnect: false, maxRetriesPerRequest: 2 });
    client.on('error', (e) => console.warn('[redis]', e.message));
  }
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis(); if (!r) return null;
  try { const v = await r.get(key); return v ? JSON.parse(v) as T : null; } catch { return null; }
}
export async function cacheSet(key: string, value: unknown, ttlSec = 30) {
  const r = getRedis(); if (!r) return;
  try { await r.set(key, JSON.stringify(value), 'EX', ttlSec); } catch {}
}
