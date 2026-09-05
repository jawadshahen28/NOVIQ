import type { RequestHandler } from 'express';
import type { ZodError, ZodType } from 'zod';
import type { ApiErrorDetail } from '../types/api.js';
import { AppError } from '../utils/AppError.js';

interface RequestValidationSchemas {
  body?: ZodType<unknown>;
  params?: ZodType<unknown>;
  query?: ZodType<unknown>;
}

function formatZodPath(path: readonly PropertyKey[]) {
  return path.map(String).join('.');
}

function createValidationError(error: ZodError) {
  const errors: ApiErrorDetail[] = error.issues.map((issue) => {
    const path = formatZodPath(issue.path);
    const detail: ApiErrorDetail = {
      code: issue.code,
      message: issue.message,
    };

    if (path) {
      detail.path = path;
    }

    return detail;
  });

  return new AppError('Request validation failed', 400, errors);
}

export function validateRequest(schemas: RequestValidationSchemas): RequestHandler {
  return (request, _response, next) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(request.params);

      if (!result.success) {
        next(createValidationError(result.error));
        return;
      }

      request.params = result.data as typeof request.params;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(request.query);

      if (!result.success) {
        next(createValidationError(result.error));
        return;
      }

      Object.defineProperty(request, 'query', {
        configurable: true,
        enumerable: true,
        value: result.data,
      });
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(request.body);

      if (!result.success) {
        next(createValidationError(result.error));
        return;
      }

      request.body = result.data;
    }

    next();
  };
}
