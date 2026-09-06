import heroImage from '../../../assets/noviq-reference-hero-lcp.jpg';

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  storePhone: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  ordersOpen: boolean;
  closedMessage: string;
}

export const defaultStoreSettings: StoreSettings = {
  storeName: 'NOVIQ',
  storeDescription: 'متجر ساعات مختارة تجمع بين الأناقة والجودة والتفاصيل الراقية.',
  whatsappNumber: '',
  storePhone: '',
  heroTitle: 'ساعة تليق بحضورك.',
  heroDescription:
    'اكتشف مجموعة مختارة من الساعات التي تجمع بين الأناقة، الجودة والتفاصيل التي تصنع الفرق.',
  heroImage,
  ordersOpen: true,
  closedMessage: 'المتجر مغلق حالياً، يرجى المحاولة لاحقاً.',
};

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function readRequiredString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function normalizeStoreSettings(value: unknown): StoreSettings {
  if (!value || typeof value !== 'object') {
    return defaultStoreSettings;
  }

  const candidate = value as Partial<StoreSettings>;

  return {
    storeName: readRequiredString(candidate.storeName, defaultStoreSettings.storeName),
    storeDescription: readString(candidate.storeDescription, defaultStoreSettings.storeDescription),
    whatsappNumber: readString(candidate.whatsappNumber, defaultStoreSettings.whatsappNumber),
    storePhone: readString(candidate.storePhone, defaultStoreSettings.storePhone),
    heroTitle: readRequiredString(candidate.heroTitle, defaultStoreSettings.heroTitle),
    heroDescription: readString(candidate.heroDescription, defaultStoreSettings.heroDescription),
    heroImage: readString(candidate.heroImage, defaultStoreSettings.heroImage),
    ordersOpen:
      typeof candidate.ordersOpen === 'boolean'
        ? candidate.ordersOpen
        : defaultStoreSettings.ordersOpen,
    closedMessage: readString(candidate.closedMessage, defaultStoreSettings.closedMessage),
  };
}
