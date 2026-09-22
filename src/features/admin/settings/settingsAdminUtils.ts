import type { AdminSettings } from './AdminSettingsContext';

export type AdminSettingsFormValues = AdminSettings;

export type AdminSettingsFormErrors = Partial<
  Record<
    | 'storeName'
    | 'whatsappNumber'
    | 'storePhone'
    | 'secondaryPhone'
    | 'instagramUrl'
    | 'facebookUrl'
    | 'copyrightText'
    | 'heroTitle'
    | 'heroImage'
    | 'menDepartmentImage'
    | 'womenDepartmentImage',
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

function hasValidHttpUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function hasValidWhatsAppValue(value: string) {
  return hasValidPhoneShape(value) || hasValidHttpUrl(value);
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
    secondaryPhone: values.secondaryPhone.trim(),
    instagramUrl: values.instagramUrl.trim(),
    facebookUrl: values.facebookUrl.trim(),
    copyrightText: values.copyrightText.trim(),
    heroTitle: values.heroTitle.trim(),
    heroDescription: values.heroDescription.trim(),
    heroImage: values.heroImage.trim(),
    menDepartmentImage: values.menDepartmentImage.trim(),
    womenDepartmentImage: values.womenDepartmentImage.trim(),
    ordersOpen: values.ordersOpen,
    closedMessage: values.closedMessage.trim(),
  };
}

export function validateAdminSettings(values: AdminSettingsFormValues) {
  const errors: AdminSettingsFormErrors = {};

  if (!values.storeName.trim()) {
    errors.storeName = 'يرجى إدخال اسم المتجر';
  }

  if (!hasValidWhatsAppValue(values.whatsappNumber)) {
    errors.whatsappNumber = 'يرجى إدخال رقم أو رابط WhatsApp صحيح';
  }

  if (!hasValidPhoneShape(values.storePhone)) {
    errors.storePhone = 'يرجى إدخال رقم هاتف صحيح';
  }

  if (!hasValidPhoneShape(values.secondaryPhone)) {
    errors.secondaryPhone = 'يرجى إدخال رقم هاتف إضافي صحيح';
  }

  if (!hasValidHttpUrl(values.instagramUrl)) {
    errors.instagramUrl = 'يرجى إدخال رابط Instagram صحيح يبدأ بـ http أو https';
  }

  if (!hasValidHttpUrl(values.facebookUrl)) {
    errors.facebookUrl = 'يرجى إدخال رابط Facebook صحيح يبدأ بـ http أو https';
  }

  if (values.copyrightText.trim().length > 300) {
    errors.copyrightText = 'يرجى إدخال نص حقوق نشر لا يتجاوز 300 حرف';
  }

  if (!values.heroTitle.trim()) {
    errors.heroTitle = 'يرجى إدخال عنوان Hero';
  }

  if (!hasValidImagePath(values.heroImage)) {
    errors.heroImage = 'يرجى إدخال رابط أو مسار صورة صحيح';
  }

  if (!hasValidImagePath(values.menDepartmentImage)) {
    errors.menDepartmentImage = 'Please enter a valid image URL or site path';
  }

  if (!hasValidImagePath(values.womenDepartmentImage)) {
    errors.womenDepartmentImage = 'Please enter a valid image URL or site path';
  }

  return errors;
}
