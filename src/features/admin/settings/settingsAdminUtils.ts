import type { AdminSettings } from './AdminSettingsContext';

export type AdminSettingsFormValues = AdminSettings;

export type AdminSettingsFormErrors = Partial<
  Record<
    | 'storeName'
    | 'whatsappNumber'
    | 'storePhone'
    | 'heroTitle'
    | 'heroImage',
    string
  >
>;

function hasValidPhoneShape(value: string) {
  if (!value.trim()) {
    return true;
  }

  const digits = value.replace(/\D/g, '');
  const hasOnlyPhoneCharacters = /^[+\d\s()-]+$/.test(value.trim());

  return hasOnlyPhoneCharacters && digits.length >= 7 && digits.length <= 15;
}

function hasValidImagePath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  if (/\s/.test(trimmed)) {
    return false;
  }

  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeAdminSettings(values: AdminSettingsFormValues): AdminSettings {
  return {
    storeName: values.storeName.trim(),
    storeDescription: values.storeDescription.trim(),
    whatsappNumber: values.whatsappNumber.trim(),
    storePhone: values.storePhone.trim(),
    heroTitle: values.heroTitle.trim(),
    heroDescription: values.heroDescription.trim(),
    heroImage: values.heroImage.trim(),
    ordersOpen: values.ordersOpen,
    closedMessage: values.closedMessage.trim(),
  };
}

export function validateAdminSettings(values: AdminSettingsFormValues) {
  const errors: AdminSettingsFormErrors = {};

  if (!values.storeName.trim()) {
    errors.storeName = 'يرجى إدخال اسم المتجر';
  }

  if (!hasValidPhoneShape(values.whatsappNumber)) {
    errors.whatsappNumber = 'يرجى إدخال رقم WhatsApp بصيغة صحيحة';
  }

  if (!hasValidPhoneShape(values.storePhone)) {
    errors.storePhone = 'يرجى إدخال رقم هاتف صحيح';
  }

  if (!values.heroTitle.trim()) {
    errors.heroTitle = 'يرجى إدخال عنوان Hero';
  }

  if (!hasValidImagePath(values.heroImage)) {
    errors.heroImage = 'يرجى إدخال رابط أو مسار صورة صحيح';
  }

  return errors;
}
