import { z } from 'zod';
import { mongoObjectIdSchema, paginationQuerySchema, slugSchema } from './commonSchemas.js';
import { ORDER_STATUSES } from '../types/models.js';

const requiredTextSchema = (field: string, max: number) =>
  z.string().trim().min(1, `${field} is required`).max(max);

const orderItemSchema = z
  .object({
    productId: mongoObjectIdSchema.optional(),
    productSlug: slugSchema.optional(),
    quantity: z.coerce.number().int().min(1).max(99),
  })
  .refine((value) => value.productId || value.productSlug, {
    message: 'Order item productId or productSlug is required',
    path: ['productId'],
  });

export const createOrderBodySchema = z.object({
  customer: z.object({
    address: requiredTextSchema('Customer address', 500),
    name: requiredTextSchema('Customer name', 120),
    notes: z.string().trim().max(1_000).optional(),
    phone: requiredTextSchema('Customer phone', 40),
  }),
  items: z.array(orderItemSchema).min(1).max(50),
});

export const adminOrderListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
});

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusBodySchema>;
