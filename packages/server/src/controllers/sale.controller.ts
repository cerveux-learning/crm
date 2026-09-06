import { Response } from 'express';
import { SaleService } from '../services/sale.service.js';
import { CreateSaleOrderSchema } from '@crm/shared';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class SaleController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const filters: any = {
        type: req.query.type as string | undefined,
        status: req.query.status as string | undefined,
        customerId: req.query.customerId as string | undefined,
        search: req.query.search as string | undefined,
      };

      // If user is SELLER, only allow them to see their own sales
      if (user.role === 'SELLER') {
        filters.userId = user.id;
      } else if (user.role === 'ADMIN' && req.query.userId) {
        filters.userId = req.query.userId as string;
      }

      const sales = await SaleService.getAll(filters);
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user!;
      
      const sale = await SaleService.getById(id);
      if (!sale) {
        res.status(404).json({ error: 'Documento no encontrado' });
        return;
      }

      // Check ownership if seller
      if (user.role === 'SELLER' && sale.userId && sale.userId !== user.id) {
        res.status(403).json({ error: 'No tienes permiso para ver esta venta' });
        return;
      }

      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const validated = CreateSaleOrderSchema.parse(req.body);
      const user = req.user!;
      
      // If seller, assign to themselves. If admin, can specify or defaults to admin
      const assignedUserId = user.role === 'SELLER' ? user.id : (validated.userId || user.id);
      
      const sale = await SaleService.create(validated, assignedUserId);
      res.status(201).json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user!;
      await SaleService.checkOwnership(id, user);

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

  static async convertQuoteToInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user!;
      await SaleService.checkOwnership(id, user);

      const invoice = await SaleService.convertQuoteToInvoice(id, user.id);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user!;
      await SaleService.checkOwnership(id, user);

      await SaleService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
