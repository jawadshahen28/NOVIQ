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

function createProductFromInventoryItem(item: InventoryItem): Product {
  return {
    category: item.category,
    costPrice: 0,
    description: '',
    discountPercent: 0,
    id: item.id,
    images: item.image ? [item.image] : [],
    isAvailable: item.isAvailable,
    name: item.name,
    price: item.sellingPrice,
    sellingPrice: item.sellingPrice,
    shortDescription: '',
    slug: item.slug,
    specifications: {},
    stock: item.stock,
  };
}

export function applyInventoryItem(product: Product | undefined, item: InventoryItem): Product {
  const baseProduct = product ?? createProductFromInventoryItem(item);

  return {
    ...baseProduct,
    category: item.category || baseProduct.category,
    images: baseProduct.images.length > 0 ? baseProduct.images : createProductFromInventoryItem(item).images,
    isAvailable: item.isAvailable,
    sellingPrice: item.sellingPrice,
    stock: item.stock,
  };
}
