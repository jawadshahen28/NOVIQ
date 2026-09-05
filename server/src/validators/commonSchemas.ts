import { z } from 'zod';

export const mongoObjectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid MongoDB ObjectId');

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens');

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});
