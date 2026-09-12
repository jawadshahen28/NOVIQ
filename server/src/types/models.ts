import type { Types } from 'mongoose';
import type { StoredDeliveryRegionCode } from '../config/delivery.js';

export const ADMIN_ROLES = ['admin'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ACTIVE_ORDER_STATUSES = [
  '\u062c\u062f\u064a\u062f',
  '\u062a\u0645 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645',
  '\u062a\u0645 \u0627\u0644\u062a\u062c\u0647\u064a\u0632 \u0648\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u062a\u0648\u0635\u064a\u0644',
  '\u062a\u0645 \u0627\u0644\u062a\u0633\u0644\u064a\u0645',
] as const;

export const LEGACY_ORDER_STATUSES = [
  '\u062a\u0645 \u0627\u0644\u062a\u0623\u0643\u064a\u062f',
  '\u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632',
  '\u0645\u0643\u062a\u0645\u0644',
  '\u0645\u0644\u063a\u064a',
] as const;

export const ORDER_STATUSES = [
  ...ACTIVE_ORDER_STATUSES,
  ...LEGACY_ORDER_STATUSES,
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type ActiveOrderStatus = (typeof ACTIVE_ORDER_STATUSES)[number];

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
  compareAtPrice?: number | null;
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
  deliveryRegion?: StoredDeliveryRegionCode;
  deliveryRegionLabel?: string;
  deliveryFee?: number;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId;
  stockRestoredAt?: Date;
}

export interface StoreSettings extends TimestampFields {
  key: 'store-settings';
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  storePhone?: string;
  secondaryPhone?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  copyrightText?: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  ordersOpen: boolean;
  closedMessage: string;
  currencyCode: typeof STORE_CURRENCY_CODE;
  currencySymbol: typeof STORE_CURRENCY_SYMBOL;
  paymentMethod: PaymentMethod;
}
