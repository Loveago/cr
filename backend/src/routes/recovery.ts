import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/db';
import { validate } from '../middleware/validate';
import { sendEmail } from '../services/email';

const router = Router();

const LeadSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  walletAddr: z.string().max(200).optional(),
  amountLost: z.string().max(60).optional(),
  description: z.string().min(10).max(4000)
});

router.post('/', validate(LeadSchema), async (req, res, next) => {
  try {
    const lead = await prisma.recoveryLead.create({ data: req.body });
    await sendEmail(req.body.email,
      'We received your CRYPTEX recovery request',
      `Hi ${req.body.fullName},\n\nOur recovery team will be in touch within 24 hours.\n\n— CRYPTEX`);
    res.status(201).json({ ok: true, id: lead.id });
  } catch (e) { next(e); }
});

export default router;
