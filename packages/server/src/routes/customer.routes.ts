import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

export const customerRouter = Router();

customerRouter.use(authenticateToken);
customerRouter.use(requireRole(['ADMIN', 'SELLER']));

customerRouter.get('/', CustomerController.getAll);
customerRouter.get('/:id', CustomerController.getById);
customerRouter.post('/', CustomerController.create);
customerRouter.put('/:id', CustomerController.update);
customerRouter.delete('/:id', CustomerController.delete);
customerRouter.post('/:id/activities', CustomerController.addActivity);
