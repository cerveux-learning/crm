import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Deal,
  CreateDealInput,
  UpdateDealInput,
  DealStage,
  Product,
  CreateProductInput,
  UpdateProductInput,
  SaleOrder,
  CreateSaleOrderInput,
  CreateActivityInput,
  Activity,
  DashboardMetrics,
  MonthlySalesData,
  DealsByStageData,
  TopCustomerData,
  TopProductData,
} from '@crm/shared';

const BASE_URL = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      }
    } catch {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  analytics: {
    getDashboard: () =>
      fetchJSON<{
        metrics: DashboardMetrics;
        monthlySales: MonthlySalesData[];
        dealsByStage: DealsByStageData[];
        topCustomers: TopCustomerData[];
        topProducts: TopProductData[];
      }>('/analytics/dashboard'),
  },

  customers: {
    getAll: (search?: string, status?: string) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      return fetchJSON<Customer[]>(`/customers?${params.toString()}`);
    },
    getById: (id: string) => fetchJSON<Customer & { deals: Deal[]; sales: SaleOrder[]; activities: Activity[] }>(`/customers/${id}`),
    create: (data: CreateCustomerInput) => fetchJSON<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateCustomerInput) => fetchJSON<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/customers/${id}`, { method: 'DELETE' }),
    addActivity: (id: string, data: CreateActivityInput) => fetchJSON<Activity>(`/customers/${id}/activities`, { method: 'POST', body: JSON.stringify(data) }),
  },

  deals: {
    getAll: (filters?: { stage?: string; priority?: string; customerId?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.stage) params.append('stage', filters.stage);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.search) params.append('search', filters.search);
      return fetchJSON<Deal[]>(`/deals?${params.toString()}`);
    },
    getById: (id: string) => fetchJSON<Deal & { customer: Customer; activities: Activity[] }>(`/deals/${id}`),
    create: (data: CreateDealInput) => fetchJSON<Deal>('/deals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateDealInput) => fetchJSON<Deal>(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStage: (id: string, stage: DealStage) => fetchJSON<Deal>(`/deals/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
    delete: (id: string) => fetchJSON<void>(`/deals/${id}`, { method: 'DELETE' }),
  },

  products: {
    getAll: (category?: string, search?: string) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      return fetchJSON<Product[]>(`/products?${params.toString()}`);
    },
    getById: (id: string) => fetchJSON<Product>(`/products/${id}`),
    create: (data: CreateProductInput) => fetchJSON<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateProductInput) => fetchJSON<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchJSON<void>(`/products/${id}`, { method: 'DELETE' }),
  },

  sales: {
    getAll: (filters?: { type?: string; status?: string; customerId?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.search) params.append('search', filters.search);
      return fetchJSON<SaleOrder[]>(`/sales?${params.toString()}`);
    },
    getById: (id: string) => fetchJSON<SaleOrder>(`/sales/${id}`),
    create: (data: CreateSaleOrderInput) => fetchJSON<SaleOrder>('/sales', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) => fetchJSON<SaleOrder>(`/sales/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    convertQuoteToInvoice: (id: string) => fetchJSON<SaleOrder>(`/sales/${id}/convert-to-invoice`, { method: 'POST' }),
    delete: (id: string) => fetchJSON<void>(`/sales/${id}`, { method: 'DELETE' }),
  },
};
