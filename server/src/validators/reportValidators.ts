import { z } from 'zod';

export const adminReportQuerySchema = z.object({
  range: z.enum(['7d', '30d', '90d', 'all']).default('30d'),
});

export type AdminReportQuery = z.infer<typeof adminReportQuerySchema>;
