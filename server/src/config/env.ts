import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const envFilePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');

dotenv.config({ path: envFilePath, quiet: true });

function optionalTrimmedUrl() {
  return z.preprocess((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }, z.string().url('CLIENT_URL must be a valid URL').optional());
}

function optionalTrimmedString() {
  return z.preprocess((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }, z.string().optional());
}

function requiredTrimmedString(name: string) {
  return z.preprocess((value) => {
    if (typeof value !== 'string') {
      return '';
    }

    return value.trim();
  }, z.string().min(1, `${name} is required`));
}

const environmentSchema = z.object({
  NODE_ENV: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() ? value.trim() : 'development'),
      z.enum(['development', 'test', 'production']),
    )
    .default('development'),
  PORT: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() ? value.trim() : 5010),
      z.coerce.number().int().min(1).max(65535),
    )
    .default(5010),
  MONGODB_URI: requiredTrimmedString('MONGODB_URI'),
  CLIENT_URL: optionalTrimmedUrl(),
  JWT_SECRET: requiredTrimmedString('JWT_SECRET').refine(
    (value) => value.length >= 32,
    'JWT_SECRET must be at least 32 characters long',
  ),
  JWT_EXPIRES_IN: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() ? value.trim() : '7d'),
      z
        .string()
        .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN must use a value like 15m, 12h, or 7d'),
    )
    .default('7d'),
  AUTH_COOKIE_NAME: z
    .preprocess(
      (value) =>
        typeof value === 'string' && value.trim() ? value.trim() : 'noviq_admin_session',
      z
        .string()
        .regex(
          /^[A-Za-z0-9_]+$/,
          'AUTH_COOKIE_NAME may only contain letters, numbers, and underscores',
        ),
    )
    .default('noviq_admin_session'),
  CLOUDINARY_API_KEY: optionalTrimmedString(),
  CLOUDINARY_API_SECRET: optionalTrimmedString(),
  CLOUDINARY_CLOUD_NAME: optionalTrimmedString(),
  CLOUDINARY_UPLOAD_FOLDER: z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() ? value.trim() : 'noviq'),
      z
        .string()
        .regex(
          /^[A-Za-z0-9/_-]+$/,
          'CLOUDINARY_UPLOAD_FOLDER may only contain letters, numbers, slashes, underscores, and hyphens',
        ),
    )
    .default('noviq'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid server environment: ${details}`);
}

export const env = Object.freeze(parsedEnvironment.data);

export type ServerEnvironment = typeof env;
