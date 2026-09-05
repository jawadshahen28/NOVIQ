import { getDatabaseState } from '../config/database.js';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler((_request, response) => {
  return sendSuccess(
    response,
    {
      database: getDatabaseState(),
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
    },
    'NOVIQ API is running',
  );
});
