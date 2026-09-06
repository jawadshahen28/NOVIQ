import { Schema, model } from 'mongoose';
import {
  PAYMENT_METHODS,
  STORE_CURRENCY_CODE,
  STORE_CURRENCY_SYMBOL,
  type StoreSettings,
} from '../types/models.js';
import { DEFAULT_STORE_SETTINGS, STORE_SETTINGS_KEY } from '../config/storeSettings.js';

const storeSettingsSchema = new Schema<StoreSettings>(
  {
    closedMessage: {
      default: DEFAULT_STORE_SETTINGS.closedMessage,
      trim: true,
      type: String,
    },
    currencyCode: {
      default: STORE_CURRENCY_CODE,
      enum: [STORE_CURRENCY_CODE],
      immutable: true,
      required: true,
      type: String,
    },
    currencySymbol: {
      default: STORE_CURRENCY_SYMBOL,
      enum: [STORE_CURRENCY_SYMBOL],
      immutable: true,
      required: true,
      type: String,
    },
    heroDescription: {
      default: DEFAULT_STORE_SETTINGS.heroDescription,
      trim: true,
      type: String,
    },
    heroImage: {
      default: DEFAULT_STORE_SETTINGS.heroImage,
      trim: true,
      type: String,
    },
    heroTitle: {
      default: DEFAULT_STORE_SETTINGS.heroTitle,
      trim: true,
      type: String,
    },
    key: {
      default: STORE_SETTINGS_KEY,
      enum: [STORE_SETTINGS_KEY],
      immutable: true,
      required: true,
      type: String,
    },
    ordersOpen: {
      default: DEFAULT_STORE_SETTINGS.ordersOpen,
      required: true,
      type: Boolean,
    },
    paymentMethod: {
      default: 'cash_on_delivery',
      enum: PAYMENT_METHODS,
      immutable: true,
      required: true,
      type: String,
    },
    storeDescription: {
      default: DEFAULT_STORE_SETTINGS.storeDescription,
      trim: true,
      type: String,
    },
    storeName: {
      default: DEFAULT_STORE_SETTINGS.storeName,
      required: true,
      trim: true,
      type: String,
    },
    storePhone: {
      default: DEFAULT_STORE_SETTINGS.storePhone,
      trim: true,
      type: String,
    },
    whatsappNumber: {
      default: DEFAULT_STORE_SETTINGS.whatsappNumber,
      trim: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

storeSettingsSchema.index({ key: 1 }, { unique: true });

export const StoreSettingsModel = model<StoreSettings>('StoreSettings', storeSettingsSchema);
