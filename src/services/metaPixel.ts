import type { AdminOrder, CartLine, Product } from '../types/catalog';
import { getDiscountedPrice, STORE_CURRENCY_CODE } from '../utils/format';

type MetaPixelStandardEvent =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

interface MetaPixelEventPayload {
  content_ids?: string[];
  content_name?: string;
  content_type?: 'product';
  currency?: typeof STORE_CURRENCY_CODE;
  num_items?: number;
  value?: number;
}

interface MetaPixelFbq {
  (command: 'init', pixelId: string): void;
  (command: 'track', eventName: MetaPixelStandardEvent, payload?: MetaPixelEventPayload): void;
}

declare global {
  interface Window {
    fbq?: MetaPixelFbq;
  }
}

const trackedEventKeys = new Set<string>();
const trackedPurchaseKeys = new Set<string>();
const trackedPurchasesStorageKey = 'noviq-meta-pixel-purchases-v1';

function normalizeValue(value: number) {
  return Number(value.toFixed(2));
}

function trackEvent(eventName: MetaPixelStandardEvent, payload: MetaPixelEventPayload) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  try {
    window.fbq('track', eventName, payload);
  } catch {
    // Pixel failures must never interrupt the customer's shopping flow.
  }
}

function trackEventOnce(
  key: string,
  eventName: MetaPixelStandardEvent,
  payload: MetaPixelEventPayload,
) {
  if (trackedEventKeys.has(key)) {
    return;
  }

  trackedEventKeys.add(key);
  trackEvent(eventName, payload);
}

function getCartContentIds(items: CartLine[]) {
  return items.map((item) => item.product.id);
}

function getCartItemCount(items: CartLine[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getTrackedPurchaseKeysFromStorage() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.sessionStorage.getItem(trackedPurchasesStorageKey);
    const parsed = rawValue ? (JSON.parse(rawValue) as unknown) : [];

    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

function hasTrackedPurchase(orderKey: string) {
  return (
    trackedPurchaseKeys.has(orderKey) ||
    getTrackedPurchaseKeysFromStorage().includes(orderKey)
  );
}

function markPurchaseTracked(orderKey: string) {
  trackedPurchaseKeys.add(orderKey);

  if (typeof window === 'undefined') {
    return;
  }

  try {
    const storedKeys = getTrackedPurchaseKeysFromStorage();
    const nextKeys = Array.from(new Set([...storedKeys, orderKey])).slice(-50);
    window.sessionStorage.setItem(trackedPurchasesStorageKey, JSON.stringify(nextKeys));
  } catch {
    // Session storage can be unavailable in private or restricted contexts.
  }
}

export function trackViewContent(product: Product, viewKey: string) {
  trackEventOnce(`view-content:${viewKey}:${product.id}`, 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    currency: STORE_CURRENCY_CODE,
    value: normalizeValue(getDiscountedPrice(product)),
  });
}

export function trackAddToCart(product: Product, quantity: number) {
  trackEvent('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    currency: STORE_CURRENCY_CODE,
    value: normalizeValue(getDiscountedPrice(product) * quantity),
  });
}

export function trackInitiateCheckout(items: CartLine[], cartTotal: number, checkoutKey: string) {
  if (items.length === 0) {
    return;
  }

  trackEventOnce(`initiate-checkout:${checkoutKey}`, 'InitiateCheckout', {
    content_ids: getCartContentIds(items),
    currency: STORE_CURRENCY_CODE,
    num_items: getCartItemCount(items),
    value: normalizeValue(cartTotal),
  });
}

export function trackPurchase(order: AdminOrder) {
  const orderKey = order.orderNumber || order.id;

  if (!orderKey || hasTrackedPurchase(orderKey)) {
    return;
  }

  markPurchaseTracked(orderKey);
  trackEvent('Purchase', {
    content_ids: order.items.map((item) => item.productId),
    content_type: 'product',
    currency: STORE_CURRENCY_CODE,
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    value: normalizeValue(order.total),
  });
}
