import {
  authConfig,
  createAuthCookieOptions,
  createClearAuthCookieOptions,
} from '../config/auth.js';
import { AdminModel } from '../models/Admin.js';
import { signAdminToken } from '../services/authTokenService.js';
import type { LoginBody } from '../validators/authValidators.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { serializeAdmin } from '../utils/adminSerializer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyPassword } from '../utils/password.js';

const invalidLoginMessage = 'بيانات تسجيل الدخول غير صحيحة';
const unauthorizedMessage = 'يرجى تسجيل الدخول للمتابعة';

export const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body as LoginBody;
  const admin = await AdminModel.findOne({ email }).select('+passwordHash');

  if (!admin || !admin.isActive) {
    throw new AppError(invalidLoginMessage, 401);
  }

  const passwordMatches = await verifyPassword(password, admin.passwordHash);

  if (!passwordMatches) {
    throw new AppError(invalidLoginMessage, 401);
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const safeAdmin = serializeAdmin(admin);
  const token = signAdminToken(safeAdmin);

  response.cookie(authConfig.cookieName, token, createAuthCookieOptions());

  return sendSuccess(response, { admin: safeAdmin }, 'تم تسجيل الدخول بنجاح');
});

export const logout = asyncHandler((_request, response) => {
  response.clearCookie(authConfig.cookieName, createClearAuthCookieOptions());

  return sendSuccess(response, { authenticated: false }, 'تم تسجيل الخروج بنجاح');
});

export const getCurrentAdmin = asyncHandler((request, response) => {
  if (!request.admin) {
    throw new AppError(unauthorizedMessage, 401);
  }

  return sendSuccess(response, { admin: request.admin }, 'تم جلب بيانات المدير بنجاح');
});
