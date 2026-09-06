import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { getAllowedCorsOrigins } from './cors.js';
import { AppError } from '../utils/AppError.js';

const unsafeMethods = new Set(['DELETE', 'PATCH', 'POST', 'PUT']);

function readOriginFromReferer(referer: string | undefined) {
  if (!referer) {
    return undefined;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return undefined;
  }
}

function getRequestOrigin(headerValue: string | undefined) {
  if (!headerValue) {
    return undefined;
  }

  try {
    return new URL(headerValue).origin;
  } catch {
    return undefined;
  }
}

export const requireTrustedOrigin: RequestHandler = (request, _response, next) => {
  if (!unsafeMethods.has(request.method)) {
    next();
    return;
  }

  const requestOrigin =
    getRequestOrigin(request.get('origin')) ?? readOriginFromReferer(request.get('referer'));

  if (!requestOrigin && env.NODE_ENV !== 'production') {
    next();
    return;
  }

  if (requestOrigin && getAllowedCorsOrigins().includes(requestOrigin)) {
    next();
    return;
  }

  next(new AppError('Request origin is not allowed', 403));
};
