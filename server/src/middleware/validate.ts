import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = err.issues || (err as any).errors || [];
        const errorMessages = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return sendError(res, `Validation error: ${errorMessages}`, 400);
      }
      return sendError(res, 'Request validation failed', 400);
    }
  };
}
