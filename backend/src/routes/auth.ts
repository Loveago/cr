import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../config/db';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt';
import { generateRealisticAddress } from '../utils/addresses';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(80).optional(),
  referralCode: z.string().optional()
});

router.post('/register', validate(RegisterSchema), async (req, res, next) => {
  try {
    const { email, password, fullName, referralCode } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const referrer = referralCode ? await prisma.user.findUnique({ where: { referralCode } }) : null;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, referredById: referrer?.id }
    });
    // Auto-create wallets for all enabled coins
    const coins = await prisma.coin.findMany({ where: { enabled: true } });
    for (const c of coins) {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          coinId: c.id,
          address: generateRealisticAddress(c.symbol)
        }
      });
    }
    const access = signAccess({ sub: user.id, role: user.role });
    const refresh = signRefresh({ sub: user.id, role: user.role });
    res.status(201).json({ user: publicUser(user), access, refresh });
  } catch (e) { next(e); }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  totp: z.string().optional()
});

router.post('/login', validate(LoginSchema), async (req, res, next) => {
  try {
    const { email, password, totp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'ACTIVE') return res.status(403).json({ error: 'Account is not active' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.twoFactorEnabled) {
      if (!totp) return res.status(206).json({ require2fa: true });
      const valid = authenticator.check(totp, user.twoFactorSecret || '');
      if (!valid) return res.status(401).json({ error: 'Invalid 2FA code' });
    }
    const access = signAccess({ sub: user.id, role: user.role });
    const refresh = signRefresh({ sub: user.id, role: user.role });
    res.json({ user: publicUser(user), access, refresh });
  } catch (e) { next(e); }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.body?.refresh as string;
    if (!token) return res.status(400).json({ error: 'Missing refresh' });
    const payload = verifyRefresh(token);
    const access = signAccess({ sub: payload.sub, role: payload.role });
    res.json({ access });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/2fa/setup', requireAuth, async (req, res, next) => {
  try {
    const secret = authenticator.generateSecret();
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: { twoFactorSecret: secret, twoFactorEnabled: false }
    });
    const otpauth = authenticator.keyuri(user.email, 'CRYPTEX', secret);
    const qr = await QRCode.toDataURL(otpauth);
    res.json({ secret, otpauth, qr });
  } catch (e) { next(e); }
});

router.post('/2fa/enable', requireAuth, async (req, res, next) => {
  try {
    const { code } = req.body as { code: string };
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    if (!user.twoFactorSecret) return res.status(400).json({ error: 'Run setup first' });
    if (!authenticator.check(code, user.twoFactorSecret)) return res.status(400).json({ error: 'Invalid code' });
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

function publicUser(u: any) {
  return {
    id: u.id, email: u.email, fullName: u.fullName, role: u.role, status: u.status,
    kycStatus: u.kycStatus, twoFactorEnabled: u.twoFactorEnabled, referralCode: u.referralCode
  };
}

export default router;
