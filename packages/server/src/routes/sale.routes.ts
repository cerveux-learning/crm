import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

export const saleRouter = Router();

// Require authentication and ADMIN or SELLER role
saleRouter.use(authenticateToken);
saleRouter.use(requireRole(['ADMIN', 'SELLER']));

saleRouter.get('/', SaleController.getAll);
saleRouter.get('/:id', SaleController.getById);
saleRouter.post('/', SaleController.create);
saleRouter.patch('/:id/status', SaleController.updateStatus);
saleRouter.post('/:id/convert-to-invoice', SaleController.convertQuoteToInvoice);
saleRouter.delete('/:id', SaleController.delete);
