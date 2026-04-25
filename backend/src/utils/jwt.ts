import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload { sub: string; role: 'USER' | 'ADMIN'; }

export function signAccess(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
}
export function signRefresh(payload: JwtPayload) {
  return jwt.sign(payload, env.REFRESH_SECRET, { expiresIn: env.REFRESH_EXPIRES_IN } as SignOptions);
}
export function verifyAccess(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload & { iat: number; exp: number };
}
export function verifyRefresh(token: string) {
  return jwt.verify(token, env.REFRESH_SECRET) as JwtPayload & { iat: number; exp: number };
}
