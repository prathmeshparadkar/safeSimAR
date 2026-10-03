import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled Application Error:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, status);
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
