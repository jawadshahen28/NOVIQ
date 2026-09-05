import { StoreSettingsModel } from '../models/StoreSettings.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeStoreSettings } from '../utils/settingsSerializer.js';
import type { UpdateStoreSettingsBody } from '../validators/settingsValidators.js';

export async function getStoreSettingsDocument() {
  return StoreSettingsModel.findOneAndUpdate(
    { key: 'store-settings' },
    { $setOnInsert: { key: 'store-settings' } },
    {
      returnDocument: 'after',
      setDefaultsOnInsert: true,
      upsert: true,
    },
  );
}

export const getStoreSettings = asyncHandler(async (_request, response) => {
  const settings = await getStoreSettingsDocument();

  return sendSuccess(
    response,
    { settings: serializeStoreSettings(settings) },
    'Store settings fetched successfully',
  );
});

export const updateStoreSettings = asyncHandler(async (request, response) => {
  const body = request.body as UpdateStoreSettingsBody;
  const settings = await getStoreSettingsDocument();

  if (body.closedMessage !== undefined) {
    settings.closedMessage = body.closedMessage;
  }

  if (body.heroDescription !== undefined) {
    settings.heroDescription = body.heroDescription;
  }

  if (body.heroImage !== undefined) {
    settings.heroImage = body.heroImage;
  }

  if (body.heroTitle !== undefined) {
    settings.heroTitle = body.heroTitle;
  }

  if (body.ordersOpen !== undefined) {
    settings.ordersOpen = body.ordersOpen;
  }

  if (body.storeDescription !== undefined) {
    settings.storeDescription = body.storeDescription;
  }

  if (body.storeName !== undefined) {
    settings.storeName = body.storeName;
  }

  if (body.storePhone !== undefined) {
    settings.storePhone = body.storePhone;
  }

  if (body.whatsappNumber !== undefined) {
    settings.whatsappNumber = body.whatsappNumber;
  }

  await settings.save();

  return sendSuccess(
    response,
    { settings: serializeStoreSettings(settings) },
    'Store settings updated successfully',
  );
});
