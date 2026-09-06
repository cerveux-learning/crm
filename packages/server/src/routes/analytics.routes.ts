import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

export const analyticsRouter = Router();

analyticsRouter.use(authenticateToken);
analyticsRouter.use(requireRole(['ADMIN', 'SELLER', 'VIEWER']));

analyticsRouter.get('/dashboard', AnalyticsController.getDashboard);
