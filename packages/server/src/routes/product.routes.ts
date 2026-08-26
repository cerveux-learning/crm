import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

export const productRouter = Router();

productRouter.get('/', ProductController.getAll);
productRouter.get('/:id', ProductController.getById);
productRouter.post('/', ProductController.create);
productRouter.put('/:id', ProductController.update);
productRouter.delete('/:id', ProductController.delete);
