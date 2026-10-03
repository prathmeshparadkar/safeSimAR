import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { LoginSchema } from '../validators/auth.validator';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', validateBody(LoginSchema), AuthController.login);

// GET /api/v1/auth/me
router.get('/me', authenticateJwt, AuthController.getMe);

export default router;
