import { apiRequest } from './apiClient';
import type { ActiveOrderStatus, AdminOrder, OrderStatus } from '../types/catalog';
import type { DeliveryRegionCode } from '../config/delivery';

export interface ListAdminOrdersInput {
  date?: string;
  search?: string;
  status?: OrderStatus;
}

export interface CreateOrderInput {
  customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  deliveryRegion: DeliveryRegionCode;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreatedOrder extends AdminOrder {
  deliveryFee: number;
  deliveryRegion: DeliveryRegionCode;
  deliveryRegionLabel: string;
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

function createListAdminOrdersPath(page: number, input: ListAdminOrdersInput = {}) {
  const params = new URLSearchParams({
    limit: '100',
    page: String(page),
  });

  if (input.date) {
    params.set('date', input.date);
  }

  if (input.search?.trim()) {
    params.set('search', input.search.trim());
  }

  if (input.status) {
    params.set('status', input.status);
  }

  return `/admin/orders?${params.toString()}`;
}

function listAdminOrdersPage(page: number, input: ListAdminOrdersInput = {}) {
  return apiRequest<ListOrdersResponse>(createListAdminOrdersPath(page, input));
}

export async function listAdminOrders(input: ListAdminOrdersInput = {}) {
  const firstPage = await listAdminOrdersPage(1, input);
  const totalPages = firstPage.pagination.totalPages;

  if (totalPages <= 1) {
    return firstPage;
  }

  const orders = [...firstPage.orders];

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await listAdminOrdersPage(page, input);
    orders.push(...response.orders);
  }

  return {
    ...firstPage,
    orders,
  };
}

export function getAdminOrder(orderId: string) {
  return apiRequest<GetOrderResponse>(`/admin/orders/${orderId}`);
}

export function updateAdminOrderStatus(orderId: string, status: ActiveOrderStatus) {
  return apiRequest<GetOrderResponse>(`/admin/orders/${orderId}/status`, {
    body: JSON.stringify({ status }),
    method: 'PATCH',
  });
}

export function deleteAdminOrder(orderId: string) {
  return apiRequest<GetOrderResponse>(`/admin/orders/${orderId}`, {
    method: 'DELETE',
  });
}
