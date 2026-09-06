import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { generateToken } from '../middleware/auth.middleware.js';
import type { LoginInput, ChangePasswordInput, AuthResponse, AuthUser, UserRole } from '@crm/shared';

export class AuthService {
  static async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.active) {
      throw new Error('Esta cuenta de usuario ha sido desactivada');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };

    const token = generateToken(authUser);

    return {
      token,
      user: authUser,
    };
  }

  static async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  static async getMe(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };
  }
}
