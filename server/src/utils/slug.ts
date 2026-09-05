const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createSlug(value: string, fallbackPrefix: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

  if (slugPattern.test(normalized)) {
    return normalized;
  }

  return `${fallbackPrefix}-${Date.now().toString(36)}`;
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
