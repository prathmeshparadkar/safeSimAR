import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { WorkerService } from '../services/worker.service';
import { sendSuccess, sendError } from '../utils/response';

export class WorkerController {
  static async listWorkers(req: AuthenticatedRequest, res: Response) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const orgId = typeof req.query.organization_id === 'string' ? req.query.organization_id : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await WorkerService.listWorkers({ search, status, orgId, page, limit });
      return sendSuccess(res, result, 'Workers retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getWorkerById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const workerData = await WorkerService.getWorkerDetail(id);
      return sendSuccess(res, workerData, 'Worker detail retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }
}
