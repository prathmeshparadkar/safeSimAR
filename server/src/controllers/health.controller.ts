import { Request, Response } from 'express';
import { HealthService } from '../services/health.service';
import { sendSuccess } from '../utils/response';

export class HealthController {
  static async getHealth(_req: Request, res: Response) {
    const health = await HealthService.checkHealth();
    const statusCode = health.status === 'pass' ? 200 : 503;
    return sendSuccess(res, health, 'System is operational', statusCode);
  }
}
