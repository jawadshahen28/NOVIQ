import { z } from 'zod';

function hasValidPhoneShape(value: string) {
  if (!value.trim()) {
    return true;
  }

  const digits = value.replace(/\D/g, '');
  return /^[+\d\s()-]+$/.test(value.trim()) && digits.length >= 7 && digits.length <= 15;
}

function hasValidImagePath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return !/\s/.test(trimmed) && (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed));
}

export const updateStoreSettingsBodySchema = z
  .object({
    closedMessage: z.string().trim().max(1_000).optional(),
    heroDescription: z.string().trim().max(1_000).optional(),
    heroImage: z
      .string()
      .trim()
      .max(2_000)
      .refine(hasValidImagePath, 'Hero image must be a URL or site path')
      .optional(),
    heroTitle: z.string().trim().min(1).max(180).optional(),
    ordersOpen: z.boolean().optional(),
    storeDescription: z.string().trim().max(1_000).optional(),
    storeName: z.string().trim().min(1).max(120).optional(),
    storePhone: z
      .string()
      .trim()
      .max(40)
      .refine(hasValidPhoneShape, 'Store phone is invalid')
      .optional(),
    whatsappNumber: z
      .string()
      .trim()
      .max(40)
      .refine(hasValidPhoneShape, 'WhatsApp number is invalid')
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one settings field is required');

export type UpdateStoreSettingsBody = z.infer<typeof updateStoreSettingsBodySchema>;
