import { prisma } from '../prisma.js';
import type { CreateStockEntryInput } from '@crm/shared';

export class StockService {
  static async getMovements(filters?: {
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.type && filters.type !== 'ALL') {
      where.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
          },
        },
        saleOrder: {
          select: {
            id: true,
            orderNumber: true,
            type: true,
            status: true,
            total: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async createEntry(data: CreateStockEntryInput, userId?: string) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          type: 'IN',
          quantity: data.quantity,
          notes: data.notes || null,
          userId: userId || null,
        },
        include: {
          product: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const updatedProduct = await tx.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            increment: data.quantity,
          },
        },
      });

      return {
        movement,
        product: updatedProduct,
      };
    });
  }

  static async recordSaleOutflows(
    saleOrderId: string,
    items: { productId?: string | null; quantity: number }[],
    userId?: string,
    txClient?: any
  ) {
    const client = txClient || prisma;

    const saleOrder = await client.saleOrder.findUnique({
      where: { id: saleOrderId },
      select: { orderNumber: true },
    });

    const movements = [];

    for (const item of items) {
      if (!item.productId) continue;

      const product = await client.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) continue;

      const quantityInt = Math.round(item.quantity);
      if (quantityInt <= 0) continue;

      const movement = await client.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'OUT',
          quantity: quantityInt,
          notes: `Salida automática por factura ${saleOrder?.orderNumber || ''}`.trim(),
          saleOrderId,
          userId: userId || null,
        },
      });

      await client.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: quantityInt,
          },
        },
      });

      movements.push(movement);
    }

    return movements;
  }
}
