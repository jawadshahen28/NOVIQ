import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import type { ApiErrorDetail, ApiErrorResponse } from '../types/api.js';
import { AppError } from '../utils/AppError.js';
import { createErrorPayload } from '../utils/apiResponse.js';

interface NormalizedError {
  errors?: ApiErrorDetail[];
  message: string;
  statusCode: number;
}

interface DuplicateKeyError {
  code: 11000;
  keyValue?: Record<string, unknown>;
}

interface JsonParseError extends SyntaxError {
  status?: number;
  type?: string;
}

function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  );
}

function isJsonParseError(error: unknown): error is JsonParseError {
  return (
    error instanceof SyntaxError &&
    (error as JsonParseError).status === 400 &&
    (error as JsonParseError).type === 'entity.parse.failed'
  );
}

function createDuplicateKeyErrors(error: DuplicateKeyError): ApiErrorDetail[] {
  if (!error.keyValue) {
    return [];
  }

  return Object.keys(error.keyValue).map((field) => ({
    code: 'duplicate',
    message: `${field} must be unique`,
    path: field,
  }));
}

function createMongooseValidationErrors(error: mongoose.Error.ValidationError): ApiErrorDetail[] {
  return Object.values(error.errors).map((validationError) => ({
    code: validationError.kind,
    message: validationError.message,
    path: validationError.path,
  }));
}

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AppError) {
    const normalized: NormalizedError = {
      message: error.message,
      statusCode: error.statusCode,
    };

    if (error.errors?.length) {
      normalized.errors = error.errors;
    }

    return normalized;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      errors: createMongooseValidationErrors(error),
      message: 'Database validation failed',
      statusCode: 400,
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return {
      errors: [
        {
          code: 'invalid_cast',
          message: 'Invalid resource identifier',
          path: error.path,
        },
      ],
      message: 'Invalid request value',
      statusCode: 400,
    };
  }

  if (isDuplicateKeyError(error)) {
    return {
      errors: createDuplicateKeyErrors(error),
      message: 'Duplicate value violates a unique constraint',
      statusCode: 409,
    };
  }

  if (isJsonParseError(error)) {
    return {
      errors: [
        {
          code: 'invalid_json',
          message: 'Request body must be valid JSON',
          path: 'body',
        },
      ],
      message: 'Request body must be valid JSON',
      statusCode: 400,
    };
  }

  return {
    message: 'Internal server error',
    statusCode: 500,
  };
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const normalizedError = normalizeError(error);

  if (env.NODE_ENV !== 'test' && normalizedError.statusCode >= 500) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[api] ${message}`);
  }

  const payload: ApiErrorResponse & { stack?: string } = createErrorPayload(
    normalizedError.message,
    normalizedError.errors,
  );

  if (
    env.NODE_ENV !== 'production' &&
    normalizedError.statusCode >= 500 &&
    error instanceof Error &&
    error.stack
  ) {
    payload.stack = error.stack;
  }

  response.status(normalizedError.statusCode).json(payload);
};
