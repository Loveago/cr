import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error';

import authRoutes from './routes/auth';
import marketsRoutes from './routes/markets';
import walletRoutes from './routes/wallet';
import tradeRoutes from './routes/trade';
import recoveryRoutes from './routes/recovery';
import adminRoutes from './routes/admin';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(compression());
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

const apiLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: true, legacyHeaders: false });

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/markets', apiLimiter, marketsRoutes);
app.use('/api/wallet', apiLimiter, walletRoutes);
app.use('/api/trade', apiLimiter, tradeRoutes);
app.use('/api/recovery', apiLimiter, recoveryRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

app.use(notFound);
app.use(errorHandler);
