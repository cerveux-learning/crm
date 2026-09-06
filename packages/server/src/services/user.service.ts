import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import type { CreateUserInput, UpdateUserInput, UserRole } from '@crm/shared';

export class UserService {
  static async getAll(search?: string, role?: string) {
    const where: any = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sales: true,
            deals: true,
          },
        },
      },
    });

    return users;
  }

  static async getSellers() {
    return prisma.user.findMany({
      where: {
        role: { in: ['SELLER', 'ADMIN'] },
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sales: true,
            deals: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  static async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error('Ya existe un usuario con este correo electrónico');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: data.role,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async update(id: string, data: UpdateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Usuario no encontrado');
    }

    if (data.email && data.email.toLowerCase().trim() !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      });
      if (emailTaken) {
        throw new Error('El correo electrónico ya está en uso por otro usuario');
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.email) updateData.email = data.email.toLowerCase().trim();
    if (data.role) updateData.role = data.role;
    if (typeof data.active === 'boolean') updateData.active = data.active;
    if (data.password && data.password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async delete(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sales: true, deals: true },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // If user has sales or deals, we deactivate instead of hard delete to preserve history
    if (user._count.sales > 0 || user._count.deals > 0) {
      return prisma.user.update({
        where: { id },
        data: { active: false },
      });
    }

    return prisma.user.delete({
      where: { id },
    });
  }
}
