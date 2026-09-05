import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { createErrorPayload } from '../utils/apiResponse.js';

export const loginRateLimiter = rateLimit({
  handler: (_request, response) => {
    response
      .status(429)
      .json(createErrorPayload('تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة لاحقا'));
  },
  legacyHeaders: false,
  max: env.NODE_ENV === 'test' ? 5 : 20,
  standardHeaders: true,
  windowMs: env.NODE_ENV === 'test' ? 60_000 : 15 * 60_000,
});

export const checkoutRateLimiter = rateLimit({
  handler: (_request, response) => {
    response.status(429).json(createErrorPayload('Too many order attempts. Please try again later.'));
  },
  legacyHeaders: false,
  max: env.NODE_ENV === 'test' ? 10 : 30,
  standardHeaders: true,
  windowMs: env.NODE_ENV === 'test' ? 60_000 : 15 * 60_000,
});

export const uploadRateLimiter = rateLimit({
  handler: (_request, response) => {
    response.status(429).json(createErrorPayload('Too many upload attempts. Please try again later.'));
  },
  legacyHeaders: false,
  max: env.NODE_ENV === 'test' ? 10 : 40,
  standardHeaders: true,
  windowMs: env.NODE_ENV === 'test' ? 60_000 : 15 * 60_000,
});
