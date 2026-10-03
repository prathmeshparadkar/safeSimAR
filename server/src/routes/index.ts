import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import workerRoutes from './worker.routes';
import moduleRoutes from './module.routes';
import analyticsRoutes from './analytics.routes';
import certificateRoutes from './certificate.routes';
import attemptRoutes from './attempt.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/modules', moduleRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/certificates', certificateRoutes);
router.use('/attempts', attemptRoutes);
router.use('/sync', attemptRoutes); // Alias for offline synchronization

export default router;
