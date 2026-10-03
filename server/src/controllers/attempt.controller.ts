import { Request, Response } from 'express';
import { AttemptService } from '../services/attempt.service';
import { sendSuccess, sendError } from '../utils/response';

export class AttemptController {
  static async recordAttempt(req: Request, res: Response) {
    try {
      const result = await AttemptService.recordAttempt(req.body);
      return sendSuccess(res, result, 'Attempt successfully recorded', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async listAttempts(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const attempts = await AttemptService.listAttempts(limit);
      return sendSuccess(res, attempts, 'Attempts retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async syncBatch(req: Request, res: Response) {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body.items || [req.body];
      const results = [];
      for (const item of items) {
        try {
          const recorded = await AttemptService.recordAttempt({ ...item, isOffline: true });
          results.push({ id: item.sessionId || recorded.attemptId, status: 'SYNCED', success: true });
        } catch (e: any) {
          results.push({ id: item.sessionId, status: 'FAILED', error: e.message, success: false });
        }
      }
      return sendSuccess(res, results, `Processed ${results.length} offline sync items`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
