import { prisma } from '../prisma.js';
import type { CreateProductInput, UpdateProductInput } from '@crm/shared';

export class ProductService {
  static async getAll(category?: string, search?: string) {
    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  static async create(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category ?? 'PRODUCT',
        unitPrice: data.unitPrice,
        cost: data.cost,
        stock: data.stock ?? 0,
        active: data.active ?? true,
      },
    });
  }

  static async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
