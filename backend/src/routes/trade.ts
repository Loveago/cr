import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { placeOrder } from '../services/matchingEngine';

const router = Router();
router.use(requireAuth);

const OrderSchema = z.object({
  pair: z.string().min(3).max(20),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT']),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  price: z.string().regex(/^\d+(\.\d+)?$/).optional()
});

router.post('/orders', validate(OrderSchema), async (req, res, next) => {
  try {
    const { pair, side, type, amount, price } = req.body;
    const result = await placeOrder({ userId: req.user!.sub, pairSymbol: pair, side, type, amount, price });
    res.status(201).json(result);
  } catch (e) { next(e); }
});

router.get('/orders', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.sub },
      include: { pair: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(orders);
  } catch (e) { next(e); }
});

router.get('/trades', async (req, res, next) => {
  try {
    const trades = await prisma.trade.findMany({
      where: { userId: req.user!.sub },
      include: { pair: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(trades);
  } catch (e) { next(e); }
});

export default router;
