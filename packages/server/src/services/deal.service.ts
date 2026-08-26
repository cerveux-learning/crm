import { prisma } from '../prisma.js';
import type { CreateDealInput, UpdateDealInput, DealStage } from '@crm/shared';

export class DealService {
  static async getAll(filters?: { stage?: string; priority?: string; customerId?: string; search?: string }) {
    const where: any = {};

    if (filters?.stage && filters.stage !== 'ALL') {
      where.stage = filters.stage;
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { company: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.deal.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.deal.findUnique({
      where: { id },
      include: {
        customer: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  static async create(data: CreateDealInput) {
    return prisma.deal.create({
      data: {
        title: data.title,
        value: data.value,
        currency: data.currency ?? 'USD',
        stage: data.stage ?? 'LEAD',
        priority: data.priority ?? 'MEDIUM',
        probability: data.probability ?? 20,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        customerId: data.customerId,
        notes: data.notes,
      },
      include: {
        customer: true,
      },
    });
  }

  static async update(id: string, data: UpdateDealInput) {
    const updateData: any = { ...data };
    if (data.expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = data.expectedCloseDate ? new Date(data.expectedCloseDate) : null;
    }

    return prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });
  }

  static async updateStage(id: string, stage: DealStage) {
    // Determine default probability when stage changes if appropriate
    let probability: number | undefined;
    switch (stage) {
      case 'LEAD': probability = 10; break;
      case 'QUALIFIED': probability = 30; break;
      case 'PROPOSAL': probability = 60; break;
      case 'NEGOTIATION': probability = 80; break;
      case 'WON': probability = 100; break;
      case 'LOST': probability = 0; break;
    }

    return prisma.deal.update({
      where: { id },
      data: {
        stage,
        ...(probability !== undefined ? { probability } : {}),
      },
      include: {
        customer: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.deal.delete({
      where: { id },
    });
  }
}
