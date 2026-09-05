import type { Request } from 'express';
import { authConfig } from '../config/auth.js';
import { AdminModel } from '../models/Admin.js';
import { verifyAdminToken } from '../services/authTokenService.js';
import { AppError } from '../utils/AppError.js';
import { serializeAdmin } from '../utils/adminSerializer.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const unauthorizedMessage = 'يرجى تسجيل الدخول للمتابعة';

function getCookieValue(request: Request, name: string) {
  const cookies = request.cookies as unknown;

  if (!cookies || typeof cookies !== 'object') {
    return undefined;
  }

  const value = (cookies as Record<string, unknown>)[name];

  return typeof value === 'string' ? value : undefined;
}

export const requireAdminAuth = asyncHandler(async (request, _response, next) => {
  const token = getCookieValue(request, authConfig.cookieName);

  if (!token) {
    next(new AppError(unauthorizedMessage, 401));
    return;
  }

  const { adminId } = verifyAdminToken(token);
  const admin = await AdminModel.findById(adminId);

  if (!admin || !admin.isActive) {
    next(new AppError(unauthorizedMessage, 401));
    return;
  }

  request.admin = serializeAdmin(admin);
  next();
});
