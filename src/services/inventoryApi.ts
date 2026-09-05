import { apiRequest } from './apiClient';
import type { Product } from '../types/catalog';

export interface InventoryItem {
  active: boolean;
  category: string;
  id: string;
  image: string;
  isAvailable: boolean;
  lowStock: boolean;
  name: string;
  outOfStock: boolean;
  sellingPrice: number;
  slug: string;
  stock: number;
  updatedAt?: string;
}

export interface InventorySummaryData {
  lowStockProducts: number;
  outOfStockProducts: number;
  threshold: number;
  totalProducts: number;
  totalUnits: number;
}

interface InventoryResponse {
  items: InventoryItem[];
  summary: InventorySummaryData;
}

interface InventoryUpdateResponse {
  item: InventoryItem;
}

export function listInventory() {
  return apiRequest<InventoryResponse>('/admin/inventory');
}

export function updateInventoryStock(productId: string, stock: number, expectedStock: number) {
  return apiRequest<InventoryUpdateResponse>(`/admin/inventory/${productId}`, {
    body: JSON.stringify({ expectedStock, stock }),
    method: 'PATCH',
  });
}

export function applyInventoryItem(product: Product, item: InventoryItem): Product {
  return {
    ...product,
    isAvailable: item.isAvailable,
    stock: item.stock,
  };
}
