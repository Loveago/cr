import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_SECRET: process.env.REFRESH_SECRET || 'dev-refresh-secret-change-me',
  REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || '30d',
  REDIS_URL: process.env.REDIS_URL || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  COINGECKO_BASE: process.env.COINGECKO_BASE || 'https://api.coingecko.com/api/v3'
};
