import { Router } from 'express';
import { getMarkets, getFearAndGreed } from '../services/marketData';
import { prisma } from '../config/db';

const router = Router();

router.get('/', async (_req, res, next) => {
  try { res.json(await getMarkets()); } catch (e) { next(e); }
});

router.get('/sentiment', async (_req, res, next) => {
  try { res.json(await getFearAndGreed()); } catch (e) { next(e); }
});

router.get('/pairs', async (_req, res, next) => {
  try {
    const pairs = await prisma.tradingPair.findMany({
      where: { enabled: true },
      include: { baseCoin: true, quoteCoin: true }
    });
    res.json(pairs);
  } catch (e) { next(e); }
});

export default router;
