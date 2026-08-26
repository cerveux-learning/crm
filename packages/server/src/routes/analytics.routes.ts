import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard', AnalyticsController.getDashboard);
