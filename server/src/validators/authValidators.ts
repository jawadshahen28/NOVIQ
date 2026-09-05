import { z } from 'zod';
import { validatePasswordStrength } from '../utils/password.js';

export const loginBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(1, 'يرجى إدخال كلمة المرور'),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;

export const adminBootstrapSchema = z
  .object({
    ADMIN_BOOTSTRAP_EMAIL: z.string().trim().toLowerCase().email('Invalid admin email'),
    ADMIN_BOOTSTRAP_NAME: z.string().trim().min(2, 'Admin name is required'),
    ADMIN_BOOTSTRAP_PASSWORD: z.string().superRefine((password, context) => {
      validatePasswordStrength(password).forEach((message) => {
        context.addIssue({
          code: 'custom',
          message,
        });
      });
    }),
  })
  .strict();

export type AdminBootstrapInput = z.infer<typeof adminBootstrapSchema>;
