import type { StoredDeliveryRegionCode } from '../config/delivery';

export type CategorySlug = string;

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  image: string;
  featuredCopy: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  shortDescription: string;
  description: string;
  price: number;
  sellingPrice?: number;
  compareAtPrice?: number | null;
  costPrice: number;
  discountPercent: number;
  images: string[];
  stock: number;
  category: CategorySlug;
  categoryId?: string;
  isActive?: boolean;
  isAvailable: boolean;
  specifications: Record<string, string>;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface SubmittedOrderItem {
  productId: string;
  productName: string;
  productSlug?: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SubmittedOrderSnapshot {
  orderNumber?: string;
  items: SubmittedOrderItem[];
  deliveryRegion?: StoredDeliveryRegionCode;
  deliveryRegionLabel?: string;
  deliveryFee?: number;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  submittedAt: string;
}

export const activeOrderStatuses = [
  'جديد',
  'تم الاستلام',
  'تم التجهيز وبانتظار التوصيل',
  'تم التسليم',
] as const;

export const legacyOrderStatuses = [
  'تم التأكيد',
  'قيد التجهيز',
  'مكتمل',
  'ملغي',
] as const;

export const orderStatuses = [
  ...activeOrderStatuses,
  ...legacyOrderStatuses,
] as const;

export type ActiveOrderStatus = (typeof activeOrderStatuses)[number];
export type OrderStatus = (typeof orderStatuses)[number];

export interface AdminOrderItem {
  productId: string;
  productSlug?: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: AdminOrderItem[];
  deliveryRegion?: StoredDeliveryRegionCode;
  deliveryRegionLabel?: string;
  deliveryFee?: number;
  subtotal: number;
  shipping?: number;
  total: number;
  status: OrderStatus;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  paymentMethod: string;
}
