import { z } from 'zod';
import { mongoObjectIdSchema } from './commonSchemas.js';

const stockSchema = z.coerce.number().int().min(0).max(1_000_000);

export const inventoryProductParamsSchema = z.object({ id: mongoObjectIdSchema });

export const updateInventoryStockBodySchema = z.object({
  expectedStock: stockSchema,
  stock: stockSchema,
});

export type UpdateInventoryStockBody = z.infer<typeof updateInventoryStockBodySchema>;