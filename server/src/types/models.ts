import type { Types } from 'mongoose';

export const ADMIN_ROLES = ['admin'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ORDER_STATUSES = [
  '\u062c\u062f\u064a\u062f',
  '\u062a\u0645 \u0627\u0644\u062a\u0623\u0643\u064a\u062f',
  '\u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632',
  '\u0645\u0643\u062a\u0645\u0644',
  '\u0645\u0644\u063a\u064a',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ['cash_on_delivery'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const STORE_CURRENCY_CODE = 'ILS';
export const STORE_CURRENCY_SYMBOL = '\u20aa';

export interface TimestampFields {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Admin extends TimestampFields {
  email: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface Category extends TimestampFields {
  name: string;
  slug: string;
  description: string;
  featuredCopy?: string;
  image: string;
  isActive: boolean;
}

export interface Product extends TimestampFields {
  name: string;
  slug: string;
  brand?: string;
  category: Types.ObjectId;
  shortDescription?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice: number;
  stock: number;
  images: string[];
  primaryImage: string;
  isActive: boolean;
  specifications: Map<string, string>;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface OrderItem {
  product: Types.ObjectId;
  productName: string;
  productSlug?: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order extends TimestampFields {
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface StoreSettings extends TimestampFields {
  key: 'store-settings';
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  storePhone?: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  ordersOpen: boolean;
  closedMessage: string;
  currencyCode: typeof STORE_CURRENCY_CODE;
  currencySymbol: typeof STORE_CURRENCY_SYMBOL;
  paymentMethod: PaymentMethod;
}
