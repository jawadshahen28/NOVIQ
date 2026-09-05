import type { CookieOptions } from 'express';
import { env } from './env.js';

const durationPattern = /^(\d+)([smhd])$/;
const durationUnitMs = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

function parseDurationToMs(value: string) {
  const match = durationPattern.exec(value);

  if (!match) {
    throw new Error('Invalid auth token duration');
  }

  const [, amount, unit] = match;

  if (!amount || !unit || !(unit in durationUnitMs)) {
    throw new Error('Invalid auth token duration');
  }

  return Number(amount) * durationUnitMs[unit as keyof typeof durationUnitMs];
}

export const authConfig = Object.freeze({
  cookieName: env.AUTH_COOKIE_NAME,
  cookieMaxAgeMs: parseDurationToMs(env.JWT_EXPIRES_IN),
  jwtAudience: 'noviq-admin',
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtIssuer: 'noviq-api',
});

export function createAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: authConfig.cookieMaxAgeMs,
    path: '/api',
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  };
}

export function createClearAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    path: '/api',
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  };
}
