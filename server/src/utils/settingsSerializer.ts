import type { HydratedDocument } from 'mongoose';
import type { StoreSettings } from '../types/models.js';

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

function toIsoDate(value: Date | undefined) {
  return value instanceof Date ? value.toISOString() : undefined;
}

export function serializeStoreSettings(settings: HydratedDocument<StoreSettings>) {
  const serialized: SerializedStoreSettings = {
    closedMessage: settings.closedMessage,
    currencyCode: settings.currencyCode,
    currencySymbol: settings.currencySymbol,
    heroDescription: settings.heroDescription,
    heroImage: settings.heroImage,
    heroTitle: settings.heroTitle,
    id: settings.id,
    ordersOpen: settings.ordersOpen,
    paymentMethod: settings.paymentMethod,
    storeDescription: settings.storeDescription,
    storeName: settings.storeName,
    storePhone: settings.storePhone ?? '',
    whatsappNumber: settings.whatsappNumber,
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
