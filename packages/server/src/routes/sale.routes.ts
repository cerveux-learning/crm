import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller.js';

export const saleRouter = Router();

saleRouter.get('/', SaleController.getAll);
saleRouter.get('/:id', SaleController.getById);
saleRouter.post('/', SaleController.create);
saleRouter.patch('/:id/status', SaleController.updateStatus);
saleRouter.post('/:id/convert-to-invoice', SaleController.convertQuoteToInvoice);
saleRouter.delete('/:id', SaleController.delete);
