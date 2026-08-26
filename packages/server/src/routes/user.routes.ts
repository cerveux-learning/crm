import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

export const userRouter = Router();

// Apply auth middleware to all user routes
userRouter.use(authenticateToken);

// Sellers list (accessible by admin and sellers for assignments)
userRouter.get('/sellers', requireRole(['ADMIN', 'SELLER']), UserController.getSellers);

// Full user management (restricted to ADMIN)
userRouter.get('/', requireRole(['ADMIN']), UserController.getAll);
userRouter.get('/:id', requireRole(['ADMIN']), UserController.getById);
userRouter.post('/', requireRole(['ADMIN']), UserController.create);
userRouter.put('/:id', requireRole(['ADMIN']), UserController.update);
userRouter.delete('/:id', requireRole(['ADMIN']), UserController.delete);
