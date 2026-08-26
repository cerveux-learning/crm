import { prisma } from '../prisma.js';
import type { CreateSaleOrderInput, UpdateSaleOrderInput } from '@crm/shared';

export class SaleService {
  static async getAll(filters?: { type?: string; status?: string; customerId?: string; search?: string }) {
    const where: any = {};

    if (filters?.type && filters.type !== 'ALL') {
      where.type = filters.type;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { company: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.saleOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.saleOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  static async create(data: CreateSaleOrderInput) {
    // Generate order number if not provided
    const count = await prisma.saleOrder.count({
      where: { type: data.type },
    });
    const prefix = data.type === 'QUOTE' ? 'COT' : 'FAC';
    const year = new Date().getFullYear();
    const orderNumber = data.orderNumber || `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;

    // Calculate line item totals and subtotal
    const calculatedItems = data.items.map(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const discountAmount = item.discount ? (lineSubtotal * item.discount) / 100 : 0;
      const total = lineSubtotal - discountAmount;
      return {
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total,
      };
    });

    const subtotal = calculatedItems.reduce((acc, item) => acc + item.total, 0);
    const taxRate = data.taxRate !== undefined ? data.taxRate : 0.21;
    const discountAmount = data.discountAmount || 0;
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const total = subtotal - discountAmount + taxAmount;

    return prisma.saleOrder.create({
      data: {
        orderNumber,
        type: data.type,
        status: data.status || (data.type === 'QUOTE' ? 'DRAFT' : 'SENT'),
        customerId: data.customerId,
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal,
        taxRate,
        taxAmount,
        discountAmount,
        total,
        notes: data.notes,
        items: {
          create: calculatedItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.saleOrder.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  static async convertQuoteToInvoice(quoteId: string) {
    const quote = await prisma.saleOrder.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });

    if (!quote) throw new Error('Cotización no encontrada');
    if (quote.type !== 'QUOTE') throw new Error('El documento ya es una factura');

    const invoiceCount = await prisma.saleOrder.count({
      where: { type: 'INVOICE' },
    });
    const year = new Date().getFullYear();
    const orderNumber = `FAC-${year}-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Update quote status to ACCEPTED
    await prisma.saleOrder.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
    });

    // Create new Invoice
    return prisma.saleOrder.create({
      data: {
        orderNumber,
        type: 'INVOICE',
        status: 'SENT',
        customerId: quote.customerId,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        discountAmount: quote.discountAmount,
        total: quote.total,
        notes: `Factura generada a partir de cotización ${quote.orderNumber}. ${quote.notes || ''}`,
        items: {
          create: quote.items.map(item => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });
  }

  static async delete(id: string) {
    return prisma.saleOrder.delete({
      where: { id },
    });
  }
}
