import { Router } from 'express';
import { StockController } from '../controllers/stock.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

export const stockRouter = Router();

stockRouter.use(authenticateToken);
stockRouter.use(requireRole(['ADMIN', 'SELLER']));

stockRouter.get('/movements', StockController.getMovements);
stockRouter.post('/entry', StockController.createEntry);
