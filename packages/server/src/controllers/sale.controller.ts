import { Request, Response } from 'express';
import { SaleService } from '../services/sale.service.js';
import { CreateSaleOrderSchema } from '@crm/shared';

export class SaleController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as string | undefined,
        status: req.query.status as string | undefined,
        customerId: req.query.customerId as string | undefined,
        search: req.query.search as string | undefined,
      };
      const sales = await SaleService.getAll(filters);
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const sale = await SaleService.getById(id);
      if (!sale) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }
      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateSaleOrderSchema.parse(req.body);
      const sale = await SaleService.create(validated);
      res.status(201).json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: 'El estado es requerido' });
        return;
      }
      const sale = await SaleService.updateStatus(id, status);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async convertQuoteToInvoice(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const invoice = await SaleService.convertQuoteToInvoice(id);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await SaleService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
