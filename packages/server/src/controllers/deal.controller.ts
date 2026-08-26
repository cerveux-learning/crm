import { Request, Response } from 'express';
import { DealService } from '../services/deal.service.js';
import { CreateDealSchema, UpdateDealSchema, UpdateDealStageSchema } from '@crm/shared';

export class DealController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        stage: req.query.stage as string | undefined,
        priority: req.query.priority as string | undefined,
        customerId: req.query.customerId as string | undefined,
        search: req.query.search as string | undefined,
      };
      const deals = await DealService.getAll(filters);
      res.json(deals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deal = await DealService.getById(id);
      if (!deal) {
        res.status(404).json({ error: 'Oportunidad no encontrada' });
        return;
      }
      res.json(deal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateDealSchema.parse(req.body);
      const deal = await DealService.create(validated);
      res.status(201).json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = UpdateDealSchema.parse(req.body);
      const deal = await DealService.update(id, validated);
      res.json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async updateStage(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = UpdateDealStageSchema.parse(req.body);
      const deal = await DealService.updateStage(id, validated.stage);
      res.json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await DealService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
