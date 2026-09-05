export interface StoredCartLine {
  productId: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'noviq-cart-v1';

export function loadStoredCart(): StoredCartLine[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawCart) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawCart) as StoredCartLine[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (line) =>
        typeof line.productId === 'string' &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function saveStoredCart(lines: StoredCartLine[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
}
