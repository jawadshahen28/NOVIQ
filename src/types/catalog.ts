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
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  submittedAt: string;
}

export type OrderStatus = 'جديد' | 'تم التأكيد' | 'قيد التجهيز' | 'مكتمل' | 'ملغي';

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
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: string;
}
