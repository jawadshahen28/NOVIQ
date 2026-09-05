import type { CorsOptions } from 'cors';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const developmentOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
] as const;

export function getAllowedCorsOrigins() {
  const origins = new Set<string>();

  if (env.CLIENT_URL) {
    origins.add(env.CLIENT_URL);
  }

  if (env.NODE_ENV !== 'production') {
    developmentOrigins.forEach((origin) => origins.add(origin));
  }

  return Array.from(origins);
}

export function createCorsOptions(): CorsOptions {
  const allowedOrigins = getAllowedCorsOrigins();

  return {
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError('Origin is not allowed by CORS policy', 403));
    },
  };
}
