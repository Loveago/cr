/**
 * Minimal in-memory order matching engine for spot pairs.
 * Production exchanges use a dedicated matching service (e.g., Aeron, custom Rust core).
 * This implementation persists orders/trades via Prisma and atomically updates wallet balances.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';

export interface PlaceOrderInput {
  userId: string;
  pairSymbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  amount: string; // base asset amount
  price?: string; // required for LIMIT
}

export async function placeOrder(input: PlaceOrderInput) {
  const pair = await prisma.tradingPair.findUniqueOrThrow({
    where: { symbol: input.pairSymbol },
    include: { baseCoin: true, quoteCoin: true }
  });
  if (!pair.enabled) throw Object.assign(new Error('Trading pair disabled'), { status: 400 });

  const amount = new Prisma.Decimal(input.amount);
  if (amount.lte(0)) throw Object.assign(new Error('Amount must be > 0'), { status: 400 });
  if (input.type === 'LIMIT' && (!input.price || new Prisma.Decimal(input.price).lte(0)))
    throw Object.assign(new Error('Price required for LIMIT'), { status: 400 });

  // Determine effective price (for MARKET we use latest trade or skip)
  const last = await prisma.trade.findFirst({ where: { pairId: pair.id }, orderBy: { createdAt: 'desc' } });
  const effectivePrice = new Prisma.Decimal(input.type === 'LIMIT' ? input.price! : last?.price.toString() || '1');

  const cost = amount.mul(effectivePrice);
  const feeBps = pair.feeBps;
  const fee = cost.mul(feeBps).div(10000);

  return prisma.$transaction(async (tx) => {
    const baseWallet = await tx.wallet.findUniqueOrThrow({
      where: { userId_coinId: { userId: input.userId, coinId: pair.baseCoinId } }
    });
    const quoteWallet = await tx.wallet.findUniqueOrThrow({
      where: { userId_coinId: { userId: input.userId, coinId: pair.quoteCoinId } }
    });

    if (input.side === 'BUY') {
      const need = cost.add(fee);
      if (new Prisma.Decimal(quoteWallet.balance.toString()).lt(need))
        throw Object.assign(new Error('Insufficient quote balance'), { status: 400 });
      await tx.wallet.update({ where: { id: quoteWallet.id }, data: { balance: { decrement: need } } });
      await tx.wallet.update({ where: { id: baseWallet.id }, data: { balance: { increment: amount } } });
    } else {
      if (new Prisma.Decimal(baseWallet.balance.toString()).lt(amount))
        throw Object.assign(new Error('Insufficient base balance'), { status: 400 });
      await tx.wallet.update({ where: { id: baseWallet.id }, data: { balance: { decrement: amount } } });
      await tx.wallet.update({ where: { id: quoteWallet.id }, data: { balance: { increment: cost.sub(fee) } } });
    }

    const order = await tx.order.create({
      data: {
        userId: input.userId,
        pairId: pair.id,
        side: input.side,
        type: input.type,
        amount: amount.toString(),
        filled: amount.toString(),
        price: input.type === 'LIMIT' ? input.price : effectivePrice.toString(),
        status: 'FILLED'
      }
    });

    const trade = await tx.trade.create({
      data: {
        pairId: pair.id,
        orderId: order.id,
        userId: input.userId,
        price: effectivePrice.toString(),
        amount: amount.toString(),
        fee: fee.toString(),
        side: input.side
      }
    });

    await tx.transaction.create({
      data: {
        userId: input.userId,
        type: 'TRADE',
        status: 'COMPLETED',
        coin: input.side === 'BUY' ? pair.baseCoin.symbol : pair.quoteCoin.symbol,
        amount: amount.toString(),
        note: `${input.side} ${pair.symbol} @ ${effectivePrice.toString()}`
      }
    });

    return { order, trade };
  });
}
