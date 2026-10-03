import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess, sendError } from '../utils/response';

export class AnalyticsController {
  static async getDashboardMetrics(_req: Request, res: Response) {
    try {
      const data = await AnalyticsService.getDashboardMetrics();
      return sendSuccess(res, data, 'Analytics data retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
