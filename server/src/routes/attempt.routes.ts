import { Router } from 'express';
import { AttemptController } from '../controllers/attempt.controller';

const router = Router();

// GET /api/v1/attempts
router.get('/', AttemptController.listAttempts);

// POST /api/v1/attempts
router.post('/', AttemptController.recordAttempt);

// POST /api/v1/sync (or /api/v1/attempts/sync)
router.post('/sync', AttemptController.syncBatch);

export default router;
