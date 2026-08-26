import { Response } from 'express';
import { UserService } from '../services/user.service.js';
import { CreateUserSchema, UpdateUserSchema } from '@crm/shared';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class UserController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, role } = req.query;
      const users = await UserService.getAll(search as string, role as string);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener usuarios' });
    }
  }

  static async getSellers(req: AuthenticatedRequest, res: Response) {
    try {
      const sellers = await UserService.getSellers();
      res.json(sellers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener vendedores' });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await UserService.getById(id);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'Usuario no encontrado' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = CreateUserSchema.parse(req.body);
      const user = await UserService.create(validated);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al crear usuario' });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const validated = UpdateUserSchema.parse(req.body);
      const user = await UserService.update(id, validated);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar usuario' });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const id = req.params.id as string;
      // Prevent deleting own account
      if (req.user?.id === id) {
        res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de usuario' });
        return;
      }
      await UserService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al eliminar usuario' });
    }
  }
}
