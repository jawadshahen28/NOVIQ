import type { ApiErrorDetail } from '../types/api.js';

export class AppError extends Error {
  public readonly errors?: ApiErrorDetail[];
  public readonly isOperational = true;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500, errors?: ApiErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;

    if (errors?.length) {
      this.errors = errors;
    }

    Error.captureStackTrace?.(this, AppError);
  }
}
