import { Schema, model } from 'mongoose';
import {
  PAYMENT_METHODS,
  STORE_CURRENCY_CODE,
  STORE_CURRENCY_SYMBOL,
  type StoreSettings,
} from '../types/models.js';

const storeSettingsSchema = new Schema<StoreSettings>(
  {
    closedMessage: {
      default: '',
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
      default: '',
      trim: true,
      type: String,
    },
    heroImage: {
      default: '',
      trim: true,
      type: String,
    },
    heroTitle: {
      default: '',
      trim: true,
      type: String,
    },
    key: {
      default: 'store-settings',
      enum: ['store-settings'],
      required: true,
      type: String,
    },
    ordersOpen: {
      default: true,
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
      default: '',
      trim: true,
      type: String,
    },
    storeName: {
      default: 'NOVIQ',
      required: true,
      trim: true,
      type: String,
    },
    storePhone: {
      default: '',
      trim: true,
      type: String,
    },
    whatsappNumber: {
      default: '',
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
