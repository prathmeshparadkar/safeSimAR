import { Router } from 'express';
import { WorkerController } from '../controllers/worker.controller';
import { authenticateJwt, requireRoles } from '../middleware/auth';

const router = Router();

// GET /api/v1/workers (accessible to SUPER_ADMIN, ORG_ADMIN, TRAINER)
router.get(
  '/',
  authenticateJwt,
  requireRoles('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'),
  WorkerController.listWorkers
);

// GET /api/v1/workers/:id
router.get(
  '/:id',
  authenticateJwt,
  requireRoles('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER', 'WORKER'),
  WorkerController.getWorkerById
);

export default router;
