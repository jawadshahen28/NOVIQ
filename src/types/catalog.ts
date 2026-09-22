import type { StoredDeliveryRegionCode } from '../config/delivery';

export type CategorySlug = string;

export const productDepartments = ['MEN', 'WOMEN'] as const;

export type ProductDepartment = (typeof productDepartments)[number];

export const productDepartmentLabels: Record<ProductDepartment, string> = {
  MEN: '\u0631\u062c\u0627\u0644',
  WOMEN: '\u0646\u0633\u0627\u0621',
};

export const unsetProductDepartmentLabel =
  '\u0627\u0644\u0642\u0633\u0645 \u063a\u064a\u0631 \u0645\u062d\u062f\u062f';

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
  department?: ProductDepartment | null;
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
