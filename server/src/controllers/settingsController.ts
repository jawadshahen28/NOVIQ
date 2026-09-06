import { StoreSettingsModel } from '../models/StoreSettings.js';
import { STORE_SETTINGS_KEY } from '../config/storeSettings.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  serializePublicStoreSettings,
  serializeStoreSettings,
} from '../utils/settingsSerializer.js';
import type { UpdateStoreSettingsBody } from '../validators/settingsValidators.js';

const updateableSettingsFields = [
  'closedMessage',
  'heroDescription',
  'heroImage',
  'heroTitle',
  'ordersOpen',
  'storeDescription',
  'storeName',
  'storePhone',
  'whatsappNumber',
] as const satisfies readonly (keyof UpdateStoreSettingsBody)[];

export async function getStoreSettingsDocument() {
  const settings = await StoreSettingsModel.findOneAndUpdate(
    { key: STORE_SETTINGS_KEY },
    { $setOnInsert: { key: STORE_SETTINGS_KEY } },
    {
      returnDocument: 'after',
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );

  if (!settings) {
    throw new AppError('Store settings could not be initialized', 500);
  }

  return settings;
}

export const getAdminStoreSettings = asyncHandler(async (_request, response) => {
  const settings = await getStoreSettingsDocument();

  return sendSuccess(
    response,
    { settings: serializeStoreSettings(settings) },
    'Store settings fetched successfully',
  );
});

export const getPublicStoreSettings = asyncHandler(async (_request, response) => {
  const settings = await getStoreSettingsDocument();

  return sendSuccess(
    response,
    { settings: serializePublicStoreSettings(settings) },
    'Public store settings fetched successfully',
  );
});

export const updateAdminStoreSettings = asyncHandler(async (request, response) => {
  const body = request.body as UpdateStoreSettingsBody;
  const update: Partial<Record<(typeof updateableSettingsFields)[number], string | boolean>> = {};

  updateableSettingsFields.forEach((field) => {
    if (body[field] !== undefined) {
      update[field] = body[field];
    }
  });

  const settings = await StoreSettingsModel.findOneAndUpdate(
    { key: STORE_SETTINGS_KEY },
    {
      $set: update,
      $setOnInsert: { key: STORE_SETTINGS_KEY },
    },
    {
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );

  if (!settings) {
    throw new AppError('Store settings could not be updated', 500);
  }

  return sendSuccess(
    response,
    { settings: serializeStoreSettings(settings) },
    'Store settings updated successfully',
  );
});
