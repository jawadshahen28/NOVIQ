import type { Order } from '../types/models.js';
import {
  ACTIVE_ORDER_STATUSES,
  type ActiveOrderStatus,
  type OrderStatus,
} from '../types/models.js';

export const deliveredStatus: ActiveOrderStatus = ACTIVE_ORDER_STATUSES[3];
export const activePendingStatuses: ActiveOrderStatus[] = ACTIVE_ORDER_STATUSES.filter(
  (status) => status !== deliveredStatus,
);
export const legacyCancelledStatus: OrderStatus = 'ملغي';
export const legacyCompletedStatus: OrderStatus = 'مكتمل';

export function isRevenueStatus(status: string) {
  return status === deliveredStatus;
}

export function isActivePendingStatus(status: string) {
  return activePendingStatuses.includes(status as ActiveOrderStatus);
}

export function isCompletedInventoryStatus(status: string) {
  return status === deliveredStatus || status === legacyCompletedStatus;
}

export function shouldRestoreStockOnSoftDelete(
  order: Pick<Order, 'status' | 'stockRestoredAt'>,
) {
  return (
    !order.stockRestoredAt &&
    order.status !== legacyCancelledStatus &&
    !isCompletedInventoryStatus(order.status)
  );
}
