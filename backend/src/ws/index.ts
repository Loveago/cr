import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { getMarkets } from '../services/marketData';

export function attachWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'hello', message: 'CRYPTEX live feed' }));
  });

  // Broadcast market data every 30s (CoinGecko free-tier rate limit friendly)
  setInterval(async () => {
    try {
      const markets = await getMarkets();
      const payload = JSON.stringify({ type: 'markets', data: markets, ts: Date.now() });
      wss.clients.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(payload); });
    } catch {}
  }, 30000);

  return wss;
}
