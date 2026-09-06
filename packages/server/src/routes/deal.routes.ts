import { Router } from 'express';
import { DealController } from '../controllers/deal.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

export const dealRouter = Router();

dealRouter.use(authenticateToken);
dealRouter.use(requireRole(['ADMIN', 'SELLER']));

dealRouter.get('/', DealController.getAll);
dealRouter.get('/:id', DealController.getById);
dealRouter.post('/', DealController.create);
dealRouter.put('/:id', DealController.update);
dealRouter.patch('/:id/stage', DealController.updateStage);
dealRouter.delete('/:id', DealController.delete);
