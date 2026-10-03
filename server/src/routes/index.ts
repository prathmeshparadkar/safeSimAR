import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import workerRoutes from './worker.routes';
import moduleRoutes from './module.routes';
import analyticsRoutes from './analytics.routes';
import certificateRoutes from './certificate.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/modules', moduleRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/certificates', certificateRoutes);

export default router;
