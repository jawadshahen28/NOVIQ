import type { Response } from 'express';
import type { ApiErrorDetail, ApiErrorResponse, ApiSuccessResponse } from '../types/api.js';

export function sendSuccess<TData>(
  response: Response,
  data: TData,
  message = 'OK',
  statusCode = 200,
) {
  const payload: ApiSuccessResponse<TData> = {
    success: true,
    message,
    data,
  };

  return response.status(statusCode).json(payload);
}

export function createErrorPayload(message: string, errors?: ApiErrorDetail[]): ApiErrorResponse {
  if (errors?.length) {
    return {
      success: false,
      message,
      errors,
    };
  }

  return {
    success: false,
    message,
  };
}
