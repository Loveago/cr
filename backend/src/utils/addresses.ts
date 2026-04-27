/**
 * Generate realistic-looking cryptocurrency deposit addresses
 * These are fake addresses for demo purposes - they look real but aren't valid on-chain
 */

function randomHex(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function randomBase58(length: number): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomAlphanum(length: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateRealisticAddress(symbol: string): string {
  switch (symbol) {
    // Bitcoin - Bech32 format (bc1q...)
    case 'BTC': {
      const suffix = randomAlphanum(39);
      return `bc1q${suffix}`;
    }
    
    // Ethereum & ERC-20 tokens - 0x + 40 hex chars
    case 'ETH':
    case 'USDT':
    case 'BNB':  // BEP-20 on BSC uses same format
    case 'MATIC':
    case 'LINK':
    case 'AVAX': {
      return `0x${randomHex(40)}`;
    }
    
    // Solana - Base58 encoded, 32-44 chars
    case 'SOL': {
      return randomBase58(44);
    }
    
    // XRP - starts with 'r', 25-35 chars
    case 'XRP': {
      const suffix = randomAlphanum(24);
      return `r${suffix}`;
    }
    
    // Dogecoin - starts with 'D', 34 chars
    case 'DOGE': {
      const middle = randomBase58(33);
      return `D${middle}`;
    }
    
    // Polkadot - SS58 format, starts with '1', 48 chars
    case 'DOT': {
      const suffix = randomBase58(47);
      return `1${suffix}`;
    }
    
    // Default fallback
    default: {
      return `${symbol.toLowerCase()}_${randomHex(12)}`;
    }
  }
}
