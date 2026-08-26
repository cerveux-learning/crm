import { prisma } from '../prisma.js';
import type { CreateCustomerInput, UpdateCustomerInput, CreateActivityInput } from '@crm/shared';

export class CustomerService {
  static async getAll(search?: string, status?: string) {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            deals: true,
            sales: true,
            activities: true,
          },
        },
      },
    });

    return customers.map(c => ({
      ...c,
      tags: c.tags ? JSON.parse(c.tags) : [],
    }));
  }

  static async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        deals: {
          orderBy: { createdAt: 'desc' },
        },
        sales: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) return null;

    return {
      ...customer,
      tags: customer.tags ? JSON.parse(customer.tags) : [],
    };
  }

  static async create(data: CreateCustomerInput) {
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        position: data.position,
        status: data.status ?? 'LEAD',
        address: data.address,
        tags: data.tags ? JSON.stringify(data.tags) : JSON.stringify([]),
        notes: data.notes,
      },
    });
  }

  static async update(id: string, data: UpdateCustomerInput) {
    const updateData: any = { ...data };
    if (data.tags !== undefined) {
      updateData.tags = JSON.stringify(data.tags);
    }

    return prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  }

  static async addActivity(customerId: string, data: CreateActivityInput) {
    return prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        customerId,
        dealId: data.dealId,
        completed: data.completed ?? false,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }
}
