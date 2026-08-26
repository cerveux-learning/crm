import { prisma } from '../prisma.js';
import type { DashboardMetrics, MonthlySalesData, DealsByStageData, TopCustomerData, TopProductData } from '@crm/shared';

export class AnalyticsService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Total Paid Invoices Revenue
    const paidInvoices = await prisma.saleOrder.findMany({
      where: { type: 'INVOICE', status: 'PAID' },
      select: { total: true },
    });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // This Month Revenue
    const thisMonthPaidInvoices = await prisma.saleOrder.findMany({
      where: {
        type: 'INVOICE',
        status: 'PAID',
        createdAt: { gte: startOfMonth },
      },
      select: { total: true },
    });
    const monthlyRevenue = thisMonthPaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Prev Month Revenue for growth
    const prevMonthPaidInvoices = await prisma.saleOrder.findMany({
      where: {
        type: 'INVOICE',
        status: 'PAID',
        createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
      select: { total: true },
    });
    const prevMonthRevenue = prevMonthPaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const revenueGrowthPercentage = prevMonthRevenue > 0
      ? Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : monthlyRevenue > 0 ? 100 : 0;

    // Customer counts
    const totalCustomers = await prisma.customer.count();
    const newCustomersThisMonth = await prisma.customer.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Deals Metrics
    const deals = await prisma.deal.findMany({
      select: { stage: true, value: true },
    });

    const activeDeals = deals.filter(d => !['WON', 'LOST'].includes(d.stage));
    const activeDealsCount = activeDeals.length;
    const dealsPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);

    const dealsWonCount = deals.filter(d => d.stage === 'WON').length;
    const dealsLostCount = deals.filter(d => d.stage === 'LOST').length;
    const closedDealsCount = dealsWonCount + dealsLostCount;
    const winRate = closedDealsCount > 0 ? Math.round((dealsWonCount / closedDealsCount) * 100) : 0;

    const averageTicket = paidInvoices.length > 0 ? Math.round(totalRevenue / paidInvoices.length) : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      revenueGrowthPercentage,
      totalCustomers,
      newCustomersThisMonth,
      activeDealsCount,
      dealsPipelineValue,
      dealsWonCount,
      dealsLostCount,
      winRate,
      averageTicket,
    };
  }

  static async getMonthlySales(): Promise<MonthlySalesData[]> {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const results: MonthlySalesData[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

      const monthSales = await prisma.saleOrder.findMany({
        where: {
          type: 'INVOICE',
          status: 'PAID',
          createdAt: { gte: d, lt: nextD },
        },
        select: { total: true },
      });

      const monthDeals = await prisma.deal.count({
        where: {
          stage: 'WON',
          updatedAt: { gte: d, lt: nextD },
        },
      });

      const revenue = monthSales.reduce((acc, s) => acc + s.total, 0);
      results.push({
        month: monthLabel,
        revenue,
        deals: monthDeals,
        invoices: monthSales.length,
      });
    }

    return results;
  }

  static async getDealsByStage(): Promise<DealsByStageData[]> {
    const stages = [
      { stage: 'LEAD', label: 'Prospección', color: '#94a3b8' },
      { stage: 'QUALIFIED', label: 'Calificado', color: '#38bdf8' },
      { stage: 'PROPOSAL', label: 'Propuesta', color: '#818cf8' },
      { stage: 'NEGOTIATION', label: 'Negociación', color: '#fbbf24' },
      { stage: 'WON', label: 'Ganada', color: '#34d399' },
      { stage: 'LOST', label: 'Perdida', color: '#f87171' },
    ] as const;

    const deals = await prisma.deal.findMany({
      select: { stage: true, value: true },
    });

    return stages.map(s => {
      const stageDeals = deals.filter(d => d.stage === s.stage);
      return {
        stage: s.stage,
        label: s.label,
        count: stageDeals.length,
        totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0),
        color: s.color,
      };
    });
  }

  static async getTopCustomers(): Promise<TopCustomerData[]> {
    const customers = await prisma.customer.findMany({
      include: {
        sales: {
          where: { type: 'INVOICE', status: 'PAID' },
          select: { total: true },
        },
      },
    });

    return customers
      .map(c => ({
        id: c.id,
        name: c.name,
        company: c.company,
        totalSpent: c.sales.reduce((sum, s) => sum + s.total, 0),
        salesCount: c.sales.length,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  }

  static async getTopProducts(): Promise<TopProductData[]> {
    const items = await prisma.saleOrderItem.findMany({
      where: {
        saleOrder: { type: 'INVOICE', status: 'PAID' },
        productId: { not: null },
      },
      include: {
        product: true,
      },
    });

    const productMap = new Map<string, { id: string; name: string; code: string; unitsSold: number; totalRevenue: number }>();

    for (const item of items) {
      if (!item.productId || !item.product) continue;
      const current = productMap.get(item.productId) || {
        id: item.productId,
        name: item.product.name,
        code: item.product.code,
        unitsSold: 0,
        totalRevenue: 0,
      };
      current.unitsSold += item.quantity;
      current.totalRevenue += item.total;
      productMap.set(item.productId, current);
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }
}
