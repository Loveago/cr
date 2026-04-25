import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { attachWebSocket } from './ws';

const server = http.createServer(app);
attachWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`[cryptex] API listening on http://localhost:${env.PORT}`);
  console.log(`[cryptex] WebSocket on ws://localhost:${env.PORT}/ws`);
});
