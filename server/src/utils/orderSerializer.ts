import type { HydratedDocument } from 'mongoose';
import type { Order } from '../types/models.js';

const cashOnDeliveryLabel =
  '\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645';

export interface SerializedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  items: Array<{
    productId: string;
    productSlug: string;
    name: string;
    image: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: Order['status'];
  createdAt: string;
  updatedAt?: string;
  paymentMethod: string;
  paymentMethodCode: Order['paymentMethod'];
}

function toIsoDate(value: Date | undefined) {
  return value instanceof Date ? value.toISOString() : undefined;
}

export function serializeOrder(order: HydratedDocument<Order>): SerializedOrder {
  const notes = order.customer.notes?.trim();
  const createdAt = toIsoDate(order.createdAt) ?? new Date().toISOString();
  const serialized: SerializedOrder = {
    address: order.customer.address,
    createdAt,
    customerName: order.customer.name,
    id: order.id,
    items: order.items.map((item) => ({
      image: item.image,
      lineTotal: item.lineTotal,
      name: item.productName,
      productId: item.product.toString(),
      productSlug: item.productSlug ?? '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    orderNumber: order.orderNumber,
    paymentMethod: cashOnDeliveryLabel,
    paymentMethodCode: order.paymentMethod,
    phone: order.customer.phone,
    shipping: order.shipping,
    status: order.status,
    subtotal: order.subtotal,
    total: order.total,
  };

  if (notes) {
    serialized.notes = notes;
  }

  const updatedAt = toIsoDate(order.updatedAt);

  if (updatedAt) {
    serialized.updatedAt = updatedAt;
  }

  return serialized;
}
