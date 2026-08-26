import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

export class AnalyticsController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const [metrics, monthlySales, dealsByStage, topCustomers, topProducts] = await Promise.all([
        AnalyticsService.getDashboardMetrics(),
        AnalyticsService.getMonthlySales(),
        AnalyticsService.getDealsByStage(),
        AnalyticsService.getTopCustomers(),
        AnalyticsService.getTopProducts(),
      ]);

      res.json({
        metrics,
        monthlySales,
        dealsByStage,
        topCustomers,
        topProducts,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
