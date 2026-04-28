fix 9import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateRealisticAddress } from '../src/utils/addresses';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cryptex.io';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || 'Cryptex Admin';

const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', iconUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  { symbol: 'ETH', name: 'Ethereum', iconUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { symbol: 'USDT', name: 'Tether', iconUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { symbol: 'BNB', name: 'BNB', iconUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  { symbol: 'SOL', name: 'Solana', iconUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  { symbol: 'XRP', name: 'XRP', iconUrl: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
  { symbol: 'DOGE', name: 'Dogecoin', iconUrl: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
  { symbol: 'AVAX', name: 'Avalanche', iconUrl: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
  { symbol: 'MATIC', name: 'Polygon', iconUrl: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png' },
  { symbol: 'LINK', name: 'Chainlink', iconUrl: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
  { symbol: 'DOT', name: 'Polkadot', iconUrl: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' }
];

async function main() {
  // Coins
  for (const c of COINS) {
    await prisma.coin.upsert({ where: { symbol: c.symbol }, update: c, create: c });
  }
  const usdt = await prisma.coin.findUniqueOrThrow({ where: { symbol: 'USDT' } });
  for (const c of COINS) {
    if (c.symbol === 'USDT') continue;
    const base = await prisma.coin.findUniqueOrThrow({ where: { symbol: c.symbol } });
    const symbol = `${c.symbol}USDT`;
    await prisma.tradingPair.upsert({
      where: { symbol },
      update: {},
      create: { symbol, baseCoinId: base.id, quoteCoinId: usdt.id }
    });
  }

  // Admin
  const adminPass = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPass,
      fullName: ADMIN_FULL_NAME,
      role: 'ADMIN'
    }
  });

  // Demo user
  const userPass = await bcrypt.hash('Demo@12345', 10);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@cryptex.io' },
    update: {},
    create: { email: 'demo@cryptex.io', passwordHash: userPass, fullName: 'Demo Trader' }
  });

  // Wallets for demo
  for (const c of COINS) {
    const coin = await prisma.coin.findUniqueOrThrow({ where: { symbol: c.symbol } });
    await prisma.wallet.upsert({
      where: { userId_coinId: { userId: demo.id, coinId: coin.id } },
      update: {},
      create: {
        userId: demo.id,
        coinId: coin.id,
        address: generateRealisticAddress(c.symbol),
        balance: c.symbol === 'USDT' ? '10000' : c.symbol === 'BTC' ? '0.5' : '5'
      }
    });
  }

  // Settings
  await prisma.setting.upsert({
    where: { key: 'tradingFeeBps' },
    update: { value: '10' },
    create: { key: 'tradingFeeBps', value: '10' }
  });

  console.log(`Seed complete: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}  ·  demo@cryptex.io / Demo@12345`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
