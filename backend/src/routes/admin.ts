import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
router.use(requireAuth, requireAdmin);

// --- Analytics ---
router.get('/stats', async (_req, res, next) => {
  try {
    const [users, trades24, withdrawalsPending, leadsNew, totalVolume] = await Promise.all([
      prisma.user.count(),
      prisma.trade.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
      prisma.transaction.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } }),
      prisma.recoveryLead.count({ where: { status: 'NEW' } }),
      prisma.trade.aggregate({ _sum: { amount: true } })
    ]);
    res.json({ users, trades24, withdrawalsPending, leadsNew, totalVolume: totalVolume._sum.amount?.toString() || '0' });
  } catch (e) { next(e); }
});

// --- Users ---
router.get('/users', async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    const users = await prisma.user.findMany({
      where: q ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { fullName: { contains: q, mode: 'insensitive' } }] } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { wallets: { include: { coin: true } } }
    });
    res.json(users);
  } catch (e) { next(e); }
});

router.patch('/users/:id/balance', validate(z.object({
  coinId: z.string(),
  balance: z.string().regex(/^\d+(\.\d+)?$/)
})), async (req, res, next) => {
  try {
    const { coinId, balance } = req.body;
    const wallet = await prisma.wallet.upsert({
      where: { userId_coinId: { userId: req.params.id, coinId } },
      update: { balance },
      create: { userId: req.params.id, coinId, address: `admin_${coinId}_${req.params.id.slice(0,12)}`, balance }
    });
    await prisma.auditLog.create({ data: { userId: req.user!.sub, action: 'balance.update', target: wallet.id, meta: JSON.stringify({ balance }) } });
    res.json(wallet);
  } catch (e) { next(e); }
});

router.patch('/users/:id', validate(z.object({
  status: z.enum(['ACTIVE', 'FROZEN', 'SUSPENDED']).optional(),
  kycStatus: z.enum(['NONE', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  role: z.enum(['USER', 'ADMIN']).optional()
})), async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body });
    await prisma.auditLog.create({ data: { userId: req.user!.sub, action: 'user.update', target: user.id, meta: JSON.stringify(req.body) } });
    res.json(user);
  } catch (e) { next(e); }
});

// --- Withdrawals ---
router.get('/withdrawals', async (_req, res, next) => {
  try {
    const txs = await prisma.transaction.findMany({
      where: { type: 'WITHDRAWAL' },
      orderBy: { createdAt: 'desc' }, take: 200,
      include: { user: { select: { email: true, fullName: true } } }
    });
    res.json(txs);
  } catch (e) { next(e); }
});

router.post('/withdrawals/:id/approve', async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findUniqueOrThrow({ where: { id: req.params.id } });
    if (tx.status !== 'PENDING') return res.status(400).json({ error: 'Not pending' });
    const coin = await prisma.coin.findUniqueOrThrow({ where: { symbol: tx.coin } });
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId_coinId: { userId: tx.userId, coinId: coin.id } },
        data: { locked: { decrement: tx.amount.toString() } }
      }),
      prisma.transaction.update({ where: { id: tx.id }, data: { status: 'COMPLETED' } }),
      prisma.auditLog.create({ data: { userId: req.user!.sub, action: 'withdrawal.approve', target: tx.id } })
    ]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/withdrawals/:id/reject', async (req, res, next) => {
  try {
    const tx = await prisma.transaction.findUniqueOrThrow({ where: { id: req.params.id } });
    if (tx.status !== 'PENDING') return res.status(400).json({ error: 'Not pending' });
    const coin = await prisma.coin.findUniqueOrThrow({ where: { symbol: tx.coin } });
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId_coinId: { userId: tx.userId, coinId: coin.id } },
        data: { locked: { decrement: tx.amount.toString() }, balance: { increment: tx.amount.toString() } }
      }),
      prisma.transaction.update({ where: { id: tx.id }, data: { status: 'REJECTED' } }),
      prisma.auditLog.create({ data: { userId: req.user!.sub, action: 'withdrawal.reject', target: tx.id } })
    ]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// --- Recovery Leads ---
router.get('/recovery', async (_req, res, next) => {
  try {
    const leads = await prisma.recoveryLead.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
    res.json(leads);
  } catch (e) { next(e); }
});

router.patch('/recovery/:id', validate(z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  internalNote: z.string().max(4000).optional(),
  assignedTo: z.string().optional()
})), async (req, res, next) => {
  try {
    const lead = await prisma.recoveryLead.update({ where: { id: req.params.id }, data: req.body });
    res.json(lead);
  } catch (e) { next(e); }
});

// --- Trading Pairs ---
router.get('/pairs', async (_req, res, next) => {
  try {
    const pairs = await prisma.tradingPair.findMany({ include: { baseCoin: true, quoteCoin: true } });
    res.json(pairs);
  } catch (e) { next(e); }
});

router.patch('/pairs/:id', validate(z.object({
  enabled: z.boolean().optional(),
  feeBps: z.number().int().min(0).max(1000).optional()
})), async (req, res, next) => {
  try {
    const pair = await prisma.tradingPair.update({ where: { id: req.params.id }, data: req.body });
    res.json(pair);
  } catch (e) { next(e); }
});

// --- Coins ---
router.get('/coins', async (_req, res, next) => {
  try { res.json(await prisma.coin.findMany({ orderBy: { symbol: 'asc' } })); } catch (e) { next(e); }
});
router.patch('/coins/:id', validate(z.object({ enabled: z.boolean().optional() })), async (req, res, next) => {
  try { res.json(await prisma.coin.update({ where: { id: req.params.id }, data: req.body })); } catch (e) { next(e); }
});

// --- Audit logs ---
router.get('/audit', async (_req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    res.json(logs);
  } catch (e) { next(e); }
});

export default router;
