import { Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginSchema, ChangePasswordSchema } from '@crm/shared';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class AuthController {
  static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = LoginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al iniciar sesión' });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const user = await AuthService.getMe(req.user.id);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al obtener datos de usuario' });
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const validated = ChangePasswordSchema.parse(req.body);
      await AuthService.changePassword(req.user.id, validated);
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al cambiar contraseña' });
    }
  }
}
