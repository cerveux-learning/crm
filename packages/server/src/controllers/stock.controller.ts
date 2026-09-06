import { Response } from 'express';
import { StockService } from '../services/stock.service.js';
import { CreateStockEntrySchema } from '@crm/shared';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class StockController {
  static async getMovements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = {
        productId: req.query.productId as string | undefined,
        type: req.query.type as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const movements = await StockService.getMovements(filters);
      res.json(movements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = CreateStockEntrySchema.parse(req.body);
      const user = req.user!;

      const result = await StockService.createEntry(validated, user.id);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }
}
