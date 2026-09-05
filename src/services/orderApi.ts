import { apiRequest } from './apiClient';
import type { AdminOrder, OrderStatus } from '../types/catalog';

export interface CreateOrderInput {
  customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreatedOrder extends AdminOrder {
  shipping: number;
  paymentMethodCode: 'cash_on_delivery';
}

interface CreateOrderResponse {
  order: CreatedOrder;
}

interface ListOrdersResponse {
  orders: AdminOrder[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

interface GetOrderResponse {
  order: AdminOrder;
}

export function createOrder(input: CreateOrderInput) {
  return apiRequest<CreateOrderResponse>('/orders', {
    body: JSON.stringify(input),
    method: 'POST',
  });
}

export function listAdminOrders() {
  return apiRequest<ListOrdersResponse>('/admin/orders?limit=100&page=1');
}

export function getAdminOrder(orderId: string) {
  return apiRequest<GetOrderResponse>(`/admin/orders/${orderId}`);
}

export function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  return apiRequest<GetOrderResponse>(`/admin/orders/${orderId}/status`, {
    body: JSON.stringify({ status }),
    method: 'PATCH',
  });
}
