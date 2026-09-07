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
