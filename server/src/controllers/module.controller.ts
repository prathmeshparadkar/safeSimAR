import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { ModuleService } from '../services/module.service';
import { sendSuccess, sendError } from '../utils/response';

export class ModuleController {
  static async listModules(_req: AuthenticatedRequest, res: Response) {
    try {
      const modules = await ModuleService.listModules();
      return sendSuccess(res, modules, 'Training modules retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getModuleDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const moduleData = await ModuleService.getModuleDetails(id);
      return sendSuccess(res, moduleData, 'Module details retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }
}
