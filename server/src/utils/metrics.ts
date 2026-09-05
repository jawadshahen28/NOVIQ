import type { OrderStatus } from '../types/models.js';

export const cancelledStatus: OrderStatus = 'ملغي';
export const revenueStatuses: OrderStatus[] = ['جديد', 'تم التأكيد', 'قيد التجهيز', 'مكتمل'];

export function isRevenueStatus(status: string) {
  return status !== cancelledStatus;
}