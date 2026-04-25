import { NextFunction, Request, Response } from 'express';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ error: err?.message || 'Server error' });
}
