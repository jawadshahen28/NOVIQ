import type { SubmittedOrderSnapshot } from '../types/catalog';

const SUBMITTED_ORDER_STORAGE_KEY = 'noviq-submitted-order-v1';
const SUBMITTED_ORDER_TTL_MS = 30 * 60 * 1000;

function isSubmittedOrderSnapshot(value: unknown): value is SubmittedOrderSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as SubmittedOrderSnapshot;

  return (
    Array.isArray(snapshot.items) &&
    snapshot.items.length > 0 &&
    snapshot.items.every(
      (item) =>
        typeof item.productId === 'string' &&
        typeof item.productName === 'string' &&
        typeof item.productSlug === 'string' &&
        typeof item.image === 'string' &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.unitPrice) &&
        Number.isFinite(item.lineTotal),
    ) &&
    Number.isFinite(snapshot.subtotal) &&
    Number.isFinite(snapshot.shipping) &&
    Number.isFinite(snapshot.total) &&
    typeof snapshot.paymentMethod === 'string' &&
    typeof snapshot.submittedAt === 'string'
  );
}

function isFreshSnapshot(snapshot: SubmittedOrderSnapshot) {
  const submittedAt = new Date(snapshot.submittedAt).getTime();

  return Number.isFinite(submittedAt) && Date.now() - submittedAt < SUBMITTED_ORDER_TTL_MS;
}

export function saveSubmittedOrderSnapshot(snapshot: SubmittedOrderSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(SUBMITTED_ORDER_STORAGE_KEY, JSON.stringify(snapshot));
}

export function loadSubmittedOrderSnapshot() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSnapshot = window.sessionStorage.getItem(SUBMITTED_ORDER_STORAGE_KEY);

  if (!rawSnapshot) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSnapshot) as unknown;

    if (!isSubmittedOrderSnapshot(parsed) || !isFreshSnapshot(parsed)) {
      clearSubmittedOrderSnapshot();
      return null;
    }

    return parsed;
  } catch {
    clearSubmittedOrderSnapshot();
    return null;
  }
}

export function clearSubmittedOrderSnapshot() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(SUBMITTED_ORDER_STORAGE_KEY);
}
