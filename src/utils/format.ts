import type { Product } from '../types/catalog';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('ar-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDiscountedPrice(product: Product) {
  if (product.sellingPrice !== undefined) {
    return product.sellingPrice;
  }

  if (product.discountPercent <= 0) {
    return product.price;
  }

  return Math.round(product.price * (1 - product.discountPercent / 100));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('ar-IL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function stockLabel(stock: number) {
  if (stock <= 0) {
    return 'نفدت الكمية';
  }

  if (stock <= 3) {
    return `بقي ${stock} فقط`;
  }

  return 'متوفر';
}
