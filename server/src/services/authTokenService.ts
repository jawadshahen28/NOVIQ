import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { env } from '../config/env.js';
import type { AuthenticatedAdmin, AdminTokenPayload } from '../types/auth.js';
import { ADMIN_ROLES } from '../types/models.js';
import { AppError } from '../utils/AppError.js';

const unauthorizedMessage = 'يرجى تسجيل الدخول للمتابعة';
type JwtExpiresIn = NonNullable<SignOptions['expiresIn']>;

export function signAdminToken(admin: AuthenticatedAdmin) {
  const signOptions: SignOptions = {
    audience: authConfig.jwtAudience,
    expiresIn: authConfig.jwtExpiresIn as JwtExpiresIn,
    issuer: authConfig.jwtIssuer,
    subject: admin.id,
  };

  return jwt.sign(
    {
      role: admin.role,
    },
    env.JWT_SECRET,
    signOptions,
  );
}

function isAdminRole(value: unknown) {
  return typeof value === 'string' && ADMIN_ROLES.includes(value as (typeof ADMIN_ROLES)[number]);
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  let payload: string | JwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET, {
      audience: authConfig.jwtAudience,
      issuer: authConfig.jwtIssuer,
    });
  } catch {
    throw new AppError(unauthorizedMessage, 401);
  }

  if (
    typeof payload !== 'object' ||
    typeof payload.sub !== 'string' ||
    !isAdminRole(payload.role)
  ) {
    throw new AppError(unauthorizedMessage, 401);
  }

  return {
    adminId: payload.sub,
  };
}
