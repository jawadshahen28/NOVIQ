import type { Order } from '../types/models.js';

interface OrderTotalsInput {
  deliveryFee?: number;
  items: Pick<Order['items'][number], 'lineTotal'>[];
  shipping?: number;
  subtotal?: number;
  total?: number;
}

function isFiniteMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function calculateItemsSubtotal(items: OrderTotalsInput['items']) {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

export function getOrderSubtotal(order: OrderTotalsInput) {
  return isFiniteMoney(order.subtotal) ? order.subtotal : calculateItemsSubtotal(order.items);
}

export function getOrderDeliveryFee(order: OrderTotalsInput) {
  if (isFiniteMoney(order.deliveryFee)) {
    return order.deliveryFee;
  }

  return isFiniteMoney(order.shipping) ? order.shipping : 0;
}

export function getOrderTotal(order: OrderTotalsInput) {
  return isFiniteMoney(order.total) ? order.total : getOrderSubtotal(order) + getOrderDeliveryFee(order);
}

export function calculateOrderPricing(
  items: OrderTotalsInput['items'],
  deliveryFee: number,
) {
  const subtotal = calculateItemsSubtotal(items);

  return {
    deliveryFee,
    shipping: deliveryFee,
    subtotal,
    total: subtotal + deliveryFee,
  };
}
