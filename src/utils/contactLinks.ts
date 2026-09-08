export function createExternalHref(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? trimmed : '';
  } catch {
    return '';
  }
}

export function createPhoneHref(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return `tel:${trimmed.startsWith('+') ? '+' : ''}${digits}`;
}

export function createWhatsAppHref(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const externalHref = createExternalHref(trimmed);

  if (externalHref) {
    return externalHref;
  }

  const digits = trimmed.replace(/\D/g, '');

  return digits ? `https://wa.me/${digits}` : '';
}

export function normalizePalestinianWhatsAppNumber(value: string) {
  const compactValue = value.trim().replace(/[\s-]/g, '');

  if (!/^\+?\d+$/.test(compactValue)) {
    return '';
  }

  const digits = compactValue.startsWith('+') ? compactValue.slice(1) : compactValue;

  if (/^0(?:56|59)\d{7}$/.test(digits)) {
    return `970${digits.slice(1)}`;
  }

  if (/^970(?:56|59)\d{7}$/.test(digits)) {
    return digits;
  }

  return '';
}

export function createPalestinianWhatsAppHref(value: string) {
  const whatsappNumber = normalizePalestinianWhatsAppNumber(value);

  return whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
}
