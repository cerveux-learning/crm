import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

export const productRouter = Router();

productRouter.use(authenticateToken);
productRouter.use(requireRole(['ADMIN', 'SELLER']));

productRouter.get('/', ProductController.getAll);
productRouter.get('/:id', ProductController.getById);
productRouter.post('/', ProductController.create);
productRouter.put('/:id', ProductController.update);
productRouter.delete('/:id', ProductController.delete);
