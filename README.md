# CRYPTEX — Production-Ready Crypto Exchange

Full-stack cryptocurrency exchange platform inspired by Binance/Coinbase.

- **Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lucide
- **Backend**: Node.js · Express · TypeScript · Prisma · PostgreSQL · Redis (optional) · WebSockets
- **Auth**: JWT + Refresh tokens + 2FA (TOTP)
- **Market Data**: Live prices via CoinGecko + WebSocket fan-out
- **Charts**: TradingView widget

## Features

- Modern dark UI matching the provided design
- Live crypto ticker, market overview, top movers, market sentiment (fear & greed)
- Spot trading (market & limit orders) with a basic in-memory matching engine
- Wallet system (deposit addresses, withdrawals with admin approval, internal transfers)
- KYC uploads (S3-ready, local fallback)
- Crypto Recovery lead capture + admin review pipeline
- Powerful admin panel: users, KYC, withdrawals, trading control, analytics, recovery leads, system controls
- Security: bcrypt, JWT, 2FA, rate limiting, helmet, Zod validation, audit logs
- Referral system, in-app + email notifications

## Quick Start

### Prereqs
- Node.js 20+
- PostgreSQL 14+ (or use SQLite by switching the Prisma `provider`)
- (Optional) Redis 7+

### Install
```bash
npm install
```

### Configure
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# edit DATABASE_URL, JWT_SECRET, etc.
```

### Database
```bash
npm run db:migrate
npm run db:seed
```

Seed creates an admin (`admin@cryptex.io` / `Admin@12345`) and a demo user (`demo@cryptex.io` / `Demo@12345`).

### Run
```bash
npm run dev
# frontend: http://localhost:3000
# backend:  http://localhost:4000
# ws:       ws://localhost:4000/ws
```

## Project Structure

```
crypto/
  frontend/        # Next.js app
    src/app        # routes (App Router)
    src/components # UI
    src/lib        # api client, utils
  backend/         # Express + Prisma
    prisma/        # schema + seed
    src/routes     # REST endpoints
    src/services   # market data, matching engine, email
    src/ws         # WebSocket gateway
```

## Production Deployment

- Run `npm run build` to compile both apps.
- Frontend can be deployed to Vercel; backend to Render/Railway/Fly/EC2.
- Behind a reverse proxy, mount the WebSocket endpoint at `/ws`.
- Set `NODE_ENV=production`, real `JWT_SECRET`, `DATABASE_URL`, `REDIS_URL`, `S3_*`, `STRIPE_*`.

## Security Notes

This codebase ships with the foundations (hashing, JWT, 2FA, rate limiting, validation, audit logs). Before mainnet money flows, you must add: real custody integration, KYC/AML provider (Sumsub/Persona), pen-test, SOC2 controls, and a production-grade matching engine.
