import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.get('/me', authenticateToken, AuthController.me);
authRouter.put('/change-password', authenticateToken, AuthController.changePassword);
