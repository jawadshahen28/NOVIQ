import type { HydratedDocument } from 'mongoose';
import { DEFAULT_STORE_SETTINGS } from '../config/storeSettings.js';
import {
  STORE_CURRENCY_CODE,
  STORE_CURRENCY_SYMBOL,
  type StoreSettings,
} from '../types/models.js';

export interface SerializedStoreSettings {
  id: string;
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  storePhone: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  ordersOpen: boolean;
  closedMessage: string;
  currencyCode: string;
  currencySymbol: string;
  paymentMethod: StoreSettings['paymentMethod'];
  createdAt?: string;
  updatedAt?: string;
}

export type PublicStoreSettings = Pick<
  SerializedStoreSettings,
  | 'closedMessage'
  | 'heroDescription'
  | 'heroImage'
  | 'heroTitle'
  | 'ordersOpen'
  | 'storeDescription'
  | 'storeName'
  | 'storePhone'
  | 'whatsappNumber'
>;

function toIsoDate(value: Date | undefined) {
  return value instanceof Date ? value.toISOString() : undefined;
}

function stringValue(value: string | undefined, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function nonEmptyStringValue(value: string | undefined, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function serializeStoreSettings(settings: HydratedDocument<StoreSettings>) {
  const serialized: SerializedStoreSettings = {
    closedMessage: stringValue(settings.closedMessage, DEFAULT_STORE_SETTINGS.closedMessage),
    currencyCode: settings.currencyCode ?? STORE_CURRENCY_CODE,
    currencySymbol: settings.currencySymbol ?? STORE_CURRENCY_SYMBOL,
    heroDescription: stringValue(
      settings.heroDescription,
      DEFAULT_STORE_SETTINGS.heroDescription,
    ),
    heroImage: stringValue(settings.heroImage, DEFAULT_STORE_SETTINGS.heroImage),
    heroTitle: nonEmptyStringValue(settings.heroTitle, DEFAULT_STORE_SETTINGS.heroTitle),
    id: settings.id,
    ordersOpen:
      typeof settings.ordersOpen === 'boolean'
        ? settings.ordersOpen
        : DEFAULT_STORE_SETTINGS.ordersOpen,
    paymentMethod: settings.paymentMethod ?? 'cash_on_delivery',
    storeDescription: stringValue(
      settings.storeDescription,
      DEFAULT_STORE_SETTINGS.storeDescription,
    ),
    storeName: nonEmptyStringValue(settings.storeName, DEFAULT_STORE_SETTINGS.storeName),
    storePhone: stringValue(settings.storePhone, DEFAULT_STORE_SETTINGS.storePhone),
    whatsappNumber: stringValue(
      settings.whatsappNumber,
      DEFAULT_STORE_SETTINGS.whatsappNumber,
    ),
  };

  const createdAt = toIsoDate(settings.createdAt);
  const updatedAt = toIsoDate(settings.updatedAt);

  if (createdAt) {
    serialized.createdAt = createdAt;
  }

  if (updatedAt) {
    serialized.updatedAt = updatedAt;
  }

  return serialized;
}

export function serializePublicStoreSettings(settings: HydratedDocument<StoreSettings>) {
  const serialized = serializeStoreSettings(settings);
  const publicSettings: PublicStoreSettings = {
    closedMessage: serialized.closedMessage,
    heroDescription: serialized.heroDescription,
    heroImage: serialized.heroImage,
    heroTitle: serialized.heroTitle,
    ordersOpen: serialized.ordersOpen,
    storeDescription: serialized.storeDescription,
    storeName: serialized.storeName,
    storePhone: serialized.storePhone,
    whatsappNumber: serialized.whatsappNumber,
  };

  return publicSettings;
}
