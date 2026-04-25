# AGENT.md — CRYPTEX dev guide for AI assistants

Quick orientation for any future agent working on this repo. Read this first.

## What this is

A full-stack crypto exchange demo + crypto-recovery service.

- **Frontend**: Next.js 14 (App Router) + TailwindCSS + lightweight-charts + lucide-react
- **Backend**: Express + TypeScript + Prisma + SQLite (dev) + WebSocket
- **Workspace layout** (npm workspaces, root `package.json` declares `frontend` and `backend`):

```
crypto/
├── frontend/                # Next.js app
│   ├── src/app/             # routes (landing, login, register, dashboard, markets, trade, wallet, recover, admin/*)
│   ├── src/components/      # Hero, Navbar, Sidebar, Footer, LiveChart, MarketsTicker, etc.
│   ├── src/lib/             # api.ts (fetch + auth helpers), utils.ts (cn, fmtUSD, fmtPct, fmtCompact)
│   ├── tailwind.config.ts
│   └── .env.local           # NEXT_PUBLIC_API_BASE, NEXT_PUBLIC_WS_URL
├── backend/
│   ├── src/
│   │   ├── server.ts        # Express bootstrap + WebSocket
│   │   ├── config/db.ts     # PrismaClient singleton
│   │   ├── middleware/      # auth, admin, error
│   │   ├── routes/          # auth, markets, wallet, trade, recovery, admin
│   │   └── services/        # matchingEngine, priceFeed (CoinGecko + WS broadcast)
│   ├── prisma/schema.prisma # Prisma models
│   ├── prisma/seed.ts       # admin + demo user + coins + pairs + wallets
│   ├── prisma/dev.db        # SQLite file (gitignored)
│   └── .env                 # DATABASE_URL, JWT_SECRET, etc.
└── package.json             # workspaces root
```

## Run commands

From the **repo root** (`d:\projects\crypto`):

```powershell
npm install                                       # install all workspace deps
```

Backend (run inside `backend/`):
```powershell
npx prisma generate
npx prisma db push --skip-generate                # apply schema to dev.db
npm run db:seed                                   # seed admin + demo
npm run dev                                       # tsx watch -> http://localhost:4000
```

Frontend (run inside `frontend/`):
```powershell
npm run dev                                       # next dev -> http://localhost:3000
```

> Use **separate terminals** per server. Both must be running for the app to work.
> If port 3000 or 4000 is busy, find/kill the existing dev server before starting.

## Demo credentials (from seed)

- Admin: `admin@cryptex.io` / `Admin@12345` → `/admin`
- Trader: `demo@cryptex.io` / `Demo@12345` → `/dashboard` (preloaded balances)

## Critical gotchas — read before changing the schema

1. **SQLite has no enums.** Every status/role/side field is `String` (e.g. `role`, `kycStatus`, `status`, `side`, `type`, `OrderStatus`, `LeadStatus`). Validate values in code (zod or hand-check). Do **not** add `enum X { ... }` blocks unless you also switch the datasource provider to `postgresql`.
2. **No `@db.Decimal(36, 18)`.** SQLite ignores native type attributes. Use plain `Decimal` (Prisma stores as TEXT). All amounts in API responses are strings — coerce with `Number(x)` only at the edges.
3. **Prisma enum value blocks must be one-per-line** (not `enum X { A B C }`). Prisma validator rejects single-line forms.
4. After **any** `schema.prisma` edit run `npx prisma generate` then `npx prisma db push --skip-generate`. For destructive changes add `--force-reset --accept-data-loss` and re-seed.
5. **Switching to Postgres for prod**: change `provider = "postgresql"` in `@/backend/prisma/schema.prisma:8`, set `DATABASE_URL`, optionally re-introduce real enums and `@db.Decimal(36, 18)`. Run `npx prisma migrate deploy`.

## Auth flow

- `POST /api/auth/register` and `/api/auth/login` return `{ access, refresh, user }`.
- Frontend stores them via `auth.setSession(access, refresh)` in `@/frontend/src/lib/api.ts`.
- All authed routes go through `Authorization: Bearer <access>` (handled by `api()` helper).
- Admin gating: `/admin/*` route guard fetches `/api/auth/me` and redirects non-`ADMIN` users.

## Trading / matching engine

- Spot only. Internal book in `@/backend/src/services/matchingEngine.ts`.
- Market orders fill instantly against the seeded mid-price (CoinGecko quote).
- Withdrawals go to `PENDING` and require admin approval at `/admin/withdrawals`. Approving moves status to `COMPLETED` and debits balance; rejecting unlocks the locked amount.

## Live prices

- `services/priceFeed` polls CoinGecko `/coins/markets` every ~10s and broadcasts deltas via WebSocket on `ws://localhost:4000/ws`.
- Frontend `MarketsTicker` and `LiveChart` subscribe; chart also seeds itself from REST `/api/markets`.
- CoinGecko is keyless for demo volumes; if you hit rate limits, add `COINGECKO_API_KEY` to `.env` and wire it in `priceFeed`.

## Frontend conventions

- All client pages start with `'use client';`.
- Pages that read `useSearchParams()` must be wrapped in `<Suspense>` (see `@/frontend/src/app/register/page.tsx` and `@/frontend/src/app/trade/page.tsx`). Next.js 14 build will fail otherwise.
- Styling tokens live in `@/frontend/tailwind.config.ts` (`brand-yellow`, `brand-green`, `brand-red`, `brand-pink`, `bg`, `bg-soft`, `bg-card`, `bg-border`, `muted`).
- Common utility classes in `@/frontend/src/app/globals.css`: `.glass`, `.input`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.chip`, `.bg-grid-fade`.
- Use the `cn()` helper from `@/frontend/src/lib/utils.ts` for conditional classes.

## Backend conventions

- All routes mounted under `/api/...` in `@/backend/src/server.ts`.
- Use `prisma` from `@/backend/src/config/db.ts` — never instantiate `PrismaClient` elsewhere.
- Validate inputs with `zod` schemas at the top of each route handler.
- Money math: parse with `Number()` from Prisma `Decimal` strings, but persist as strings to avoid float drift in SQLite. For postgres prod, switch back to `Prisma.Decimal` arithmetic.
- Errors: throw — the `errorHandler` middleware formats them.

## Where to add things

- **New page** → `@/frontend/src/app/<route>/page.tsx`. Add to `Sidebar.tsx` if it's a logged-in page.
- **New API route** → create `@/backend/src/routes/<name>.ts`, mount it in `@/backend/src/server.ts`.
- **New model** → edit `schema.prisma`, run generate + push, then update seed if needed.
- **New admin section** → `@/frontend/src/app/admin/<name>/page.tsx` and add to the `NAV` array in `@/frontend/src/app/admin/layout.tsx`.

## Known sharp edges

- During the **first** `next dev` run, Next.js downloads `@next/swc-win32-x64-msvc` which can fail noisily inside `npm run` because of workspaces. If it does, run `npx next dev` directly from `frontend/`.
- The frontend lint errors you may see in the IDE are almost always "module not found" — they disappear once `npm install` has completed at the repo root.
- `prisma db push` from a sibling directory needs `--schema prisma/schema.prisma` if cwd isn't `backend/`.

## Useful one-liners

```powershell
# nuke + reseed dev DB
cd backend; npx prisma db push --skip-generate --force-reset --accept-data-loss; npm run db:seed

# tail backend in current shell instead of background
cd backend; npm run dev

# regenerate Prisma client only (after schema field rename)
cd backend; npx prisma generate
```
