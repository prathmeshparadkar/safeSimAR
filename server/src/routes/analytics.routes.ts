import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

// GET /api/v1/analytics/dashboard
router.get('/dashboard', AnalyticsController.getDashboardMetrics);

export default router;
