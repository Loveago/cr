import { env } from '../config/env';
import { cacheGet, cacheSet } from '../config/redis';

const MEMORY_TTL_MS = 120_000;
let memoryCache: { data: MarketCoin[]; ts: number } | null = null;
let pendingPromise: Promise<MarketCoin[]> | null = null;

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  sparkline_in_7d?: { price: number[] };
}

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin',
  SOL: 'solana', XRP: 'ripple', DOGE: 'dogecoin', AVAX: 'avalanche-2',
  MATIC: 'matic-network', LINK: 'chainlink', DOT: 'polkadot'
};

export async function getMarkets(): Promise<MarketCoin[]> {
  // 1. Redis cache
  const cached = await cacheGet<MarketCoin[]>('markets:top');
  if (cached) return cached;

  // 2. In-memory stale-while-revalidate buffer (works even without Redis)
  if (memoryCache && Date.now() - memoryCache.ts < MEMORY_TTL_MS) {
    return memoryCache.data;
  }

  // 3. Deduplicate concurrent in-flight requests
  if (pendingPromise) return pendingPromise;

  pendingPromise = (async () => {
    const ids = Object.values(SYMBOL_TO_ID).join(',');
    const url = `${env.COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`;
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      const data = (await res.json()) as MarketCoin[];
      await cacheSet('markets:top', data, 120);
      memoryCache = { data, ts: Date.now() };
      return data;
    } catch (e) {
      console.warn('[markets] live fetch failed, returning fallback:', (e as Error).message);
      const fb = fallbackMarkets();
      memoryCache = { data: fb, ts: Date.now() };
      return fb;
    } finally {
      pendingPromise = null;
    }
  })();

  return pendingPromise;
}

export async function getFearAndGreed(): Promise<{ value: number; classification: string }> {
  const cached = await cacheGet<{ value: number; classification: string }>('fng');
  if (cached) return cached;
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1');
    const j = (await res.json()) as { data: { value: string; value_classification: string }[] };
    const out = { value: Number(j.data[0].value), classification: j.data[0].value_classification };
    await cacheSet('fng', out, 300);
    return out;
  } catch {
    return { value: 72, classification: 'Greed' };
  }
}

function fallbackMarkets(): MarketCoin[] {
  const seed = (n: number) => Array.from({ length: 24 }, (_, i) => n * (1 + Math.sin(i / 3) * 0.02));
  return [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', current_price: 67245.30, price_change_percentage_24h: 2.45, total_volume: 28_450_000_000, market_cap: 1_320_000_000_000, sparkline_in_7d: { price: seed(67000) } },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', current_price: 3512.08, price_change_percentage_24h: 1.32, total_volume: 15_320_000_000, market_cap: 420_000_000_000, sparkline_in_7d: { price: seed(3500) } },
    { id: 'tether', symbol: 'usdt', name: 'Tether', image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', current_price: 1.00, price_change_percentage_24h: 0.0, total_volume: 42_210_000_000, market_cap: 110_000_000_000, sparkline_in_7d: { price: seed(1) } },
    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', current_price: 596.70, price_change_percentage_24h: 0.85, total_volume: 1_850_000_000, market_cap: 90_000_000_000, sparkline_in_7d: { price: seed(596) } },
    { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', current_price: 165.45, price_change_percentage_24h: 3.25, total_volume: 3_300_000_000, market_cap: 75_000_000_000, sparkline_in_7d: { price: seed(165) } },
    { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', current_price: 0.5287, price_change_percentage_24h: -0.35, total_volume: 1_050_000_000, market_cap: 29_000_000_000, sparkline_in_7d: { price: seed(0.52) } },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', current_price: 0.1289, price_change_percentage_24h: 1.70, total_volume: 892_000_000, market_cap: 18_000_000_000, sparkline_in_7d: { price: seed(0.12) } },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', current_price: 28.45, price_change_percentage_24h: 2.91, total_volume: 420_000_000, market_cap: 11_000_000_000, sparkline_in_7d: { price: seed(28) } },
    { id: 'matic-network', symbol: 'matic', name: 'Polygon', image: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', current_price: 0.612, price_change_percentage_24h: 2.45, total_volume: 320_000_000, market_cap: 6_000_000_000, sparkline_in_7d: { price: seed(0.6) } },
    { id: 'chainlink', symbol: 'link', name: 'Chainlink', image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', current_price: 14.82, price_change_percentage_24h: 1.98, total_volume: 280_000_000, market_cap: 9_000_000_000, sparkline_in_7d: { price: seed(14.8) } },
    { id: 'polkadot', symbol: 'dot', name: 'Polkadot', image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', current_price: 6.25, price_change_percentage_24h: 1.25, total_volume: 180_000_000, market_cap: 8_500_000_000, sparkline_in_7d: { price: seed(6.25) } }
  ];
}
