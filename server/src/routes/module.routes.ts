import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// GET /api/v1/modules (authenticated)
router.get('/', authenticateJwt, ModuleController.listModules);

// GET /api/v1/modules/:id (authenticated)
router.get('/:id', authenticateJwt, ModuleController.getModuleDetails);

export default router;
