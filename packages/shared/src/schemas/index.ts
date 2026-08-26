import { z } from 'zod';

export const CustomerStatusEnum = z.enum(['LEAD', 'PROSPECT', 'CUSTOMER', 'INACTIVE']);
export const DealStageEnum = z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']);
export const DealPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const ProductCategoryEnum = z.enum(['PRODUCT', 'SERVICE', 'SUBSCRIPTION', 'OTHER']);
export const SaleStatusEnum = z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'PAID', 'CANCELLED']);
export const SaleTypeEnum = z.enum(['QUOTE', 'INVOICE']);
export const ActivityTypeEnum = z.enum(['CALL', 'MEETING', 'EMAIL', 'NOTE', 'TASK']);

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  status: CustomerStatusEnum.default('LEAD'),
  address: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CreateDealSchema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  value: z.number().min(0, 'El valor debe ser positivo o 0'),
  currency: z.string().default('USD'),
  stage: DealStageEnum.default('LEAD'),
  priority: DealPriorityEnum.default('MEDIUM'),
  probability: z.number().min(0).max(100).default(20),
  expectedCloseDate: z.string().or(z.date()).optional().nullable(),
  customerId: z.string().min(1, 'El cliente es requerido'),
  notes: z.string().optional().nullable(),
});

export const UpdateDealSchema = CreateDealSchema.partial();

export const UpdateDealStageSchema = z.object({
  stage: DealStageEnum,
});

export const CreateProductSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional().nullable(),
  category: ProductCategoryEnum.default('PRODUCT'),
  unitPrice: z.number().min(0, 'El precio unitario debe ser >= 0'),
  cost: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const CreateSaleOrderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().min(1, 'La descripción del ítem es requerida'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio unitario debe ser >= 0'),
  discount: z.number().min(0).default(0),
});

export const CreateSaleOrderSchema = z.object({
  orderNumber: z.string().optional(),
  type: SaleTypeEnum.default('QUOTE'),
  status: SaleStatusEnum.default('DRAFT'),
  customerId: z.string().min(1, 'El cliente es requerido'),
  issueDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional().nullable(),
  taxRate: z.number().min(0).max(1).default(0.21),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  items: z.array(CreateSaleOrderItemSchema).min(1, 'Debe incluir al menos un ítem'),
});

export const UpdateSaleOrderSchema = CreateSaleOrderSchema.partial();

export const CreateActivitySchema = z.object({
  type: ActivityTypeEnum.default('NOTE'),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
  completed: z.boolean().default(false),
  dueDate: z.string().or(z.date()).optional().nullable(),
});

export const UpdateActivitySchema = CreateActivitySchema.partial();
