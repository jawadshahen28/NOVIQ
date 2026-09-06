import { z } from 'zod';

const safeId = z.string().regex(/^[A-Za-z0-9_-]{8,100}$/);
const safePath = z.string().trim().min(1).max(200).refine((value) => value.startsWith('/'));
const maxAnalyticsRangeMs = 90 * 24 * 60 * 60 * 1000;

export const analyticsTrackSchema = z.object({
  anonymousVisitorId: safeId,
  eventType: z.enum(['page_view', 'product_view', 'session_start']),
  path: safePath,
  productId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  productSlug: z.string().trim().max(120).regex(/^[a-z0-9-]+$/).optional(),
  referrer: z.string().trim().max(500).optional(),
  sessionId: safeId,
  source: z.string().trim().max(40).optional(),
}).strict();

export const analyticsRangeSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
}).strict().superRefine((value, context) => {
  if (!value.start && !value.end) {
    return;
  }

  const startTime = value.start ? Date.parse(value.start) : undefined;
  const endTime = value.end ? Date.parse(value.end) : Date.now();

  if (startTime !== undefined && startTime > endTime) {
    context.addIssue({
      code: 'custom',
      message: 'start must be before end',
      path: ['start'],
    });
  }

  if (startTime !== undefined && endTime - startTime > maxAnalyticsRangeMs) {
    context.addIssue({
      code: 'custom',
      message: 'Analytics range may not exceed 90 days',
      path: ['end'],
    });
  }
});

export type AnalyticsTrackBody = z.infer<typeof analyticsTrackSchema>;
export type AnalyticsRangeQuery = z.infer<typeof analyticsRangeSchema>;
