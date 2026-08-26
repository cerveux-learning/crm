import { Router } from 'express';
import { DealController } from '../controllers/deal.controller.js';

export const dealRouter = Router();

dealRouter.get('/', DealController.getAll);
dealRouter.get('/:id', DealController.getById);
dealRouter.post('/', DealController.create);
dealRouter.put('/:id', DealController.update);
dealRouter.patch('/:id/stage', DealController.updateStage);
dealRouter.delete('/:id', DealController.delete);
