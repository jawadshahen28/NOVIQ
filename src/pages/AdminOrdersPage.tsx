import { useMemo, useState } from 'react';
import { orderStatuses, orders as initialOrders } from '../data/orders';
import OrderDetailsDrawer from '../features/admin/orders/components/OrderDetailsDrawer';
import OrdersFilters, {
  type OrderDateFilter,
  type OrderStatusFilter,
} from '../features/admin/orders/components/OrdersFilters';
import OrdersMobileCards from '../features/admin/orders/components/OrdersMobileCards';
import OrdersSummary, {
  type OrderSummaryCounts,
} from '../features/admin/orders/components/OrdersSummary';
import OrdersTable from '../features/admin/orders/components/OrdersTable';
import type { AdminOrder, OrderStatus } from '../types/catalog';

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhoneValue(value: string) {
  return value.replace(/[^\d]/g, '');
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function getReferenceDate(orders: AdminOrder[]) {
  const latestTimestamp = Math.max(...orders.map((order) => new Date(order.createdAt).getTime()));

  return Number.isFinite(latestTimestamp) ? new Date(latestTimestamp) : new Date();
}

function isWithinDateFilter(order: AdminOrder, filter: OrderDateFilter, referenceDate: Date) {
  if (filter === 'all') {
    return true;
  }

  const orderDate = new Date(order.createdAt);
  const referenceStart = startOfDay(referenceDate);
  const referenceEnd = endOfDay(referenceDate);

  if (filter === 'today') {
    return orderDate >= referenceStart && orderDate <= referenceEnd;
  }

  if (filter === 'last-7-days') {
    const sevenDaysStart = new Date(referenceStart);
    sevenDaysStart.setDate(sevenDaysStart.getDate() - 6);

    return orderDate >= sevenDaysStart && orderDate <= referenceEnd;
  }

  return (
    orderDate.getFullYear() === referenceDate.getFullYear() &&
    orderDate.getMonth() === referenceDate.getMonth()
  );
}

function createSummaryCounts(orders: AdminOrder[]): OrderSummaryCounts {
  const counts = orderStatuses.reduce(
    (result, status) => ({ ...result, [status]: 0 }),
    { all: orders.length } as OrderSummaryCounts,
  );

  orders.forEach((order) => {
    counts[order.status] += 1;
  });

  return counts;
}

function filterOrders(
  orders: AdminOrder[],
  searchTerm: string,
  statusFilter: OrderStatusFilter,
  dateFilter: OrderDateFilter,
  referenceDate: Date,
) {
  const normalizedSearch = normalizeSearchValue(searchTerm);
  const normalizedPhoneSearch = normalizePhoneValue(searchTerm);

  return orders
    .filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        normalizeSearchValue(order.orderNumber).includes(normalizedSearch) ||
        normalizeSearchValue(order.customerName).includes(normalizedSearch) ||
        order.phone.includes(normalizedSearch) ||
        (normalizedPhoneSearch.length > 0 &&
          normalizePhoneValue(order.phone).includes(normalizedPhoneSearch));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesDate = isWithinDateFilter(order, dateFilter, referenceDate);

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<OrderDateFilter>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState('');

  const referenceDate = useMemo(() => getReferenceDate(orders), [orders]);
  const summaryCounts = useMemo(() => createSummaryCounts(orders), [orders]);
  const visibleOrders = useMemo(
    () => filterOrders(orders, searchTerm, statusFilter, dateFilter, referenceDate),
    [dateFilter, orders, referenceDate, searchTerm, statusFilter],
  );
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );
  const hasActiveFilters = Boolean(searchTerm.trim()) || statusFilter !== 'all' || dateFilter !== 'all';
  const emptyMessage = orders.length === 0 ? 'لا توجد طلبات حالياً' : 'لا توجد طلبات مطابقة';

  function resetFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
  }

  function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? { ...order, status } : order)),
    );
    setStatusFeedback('تم تحديث حالة الطلب');
  }

  function openOrder(orderId: string) {
    setSelectedOrderId(orderId);
    setStatusFeedback('');
  }

  function closeOrder() {
    setSelectedOrderId(null);
    setStatusFeedback('');
  }

  return (
    <section className="grid min-w-0 gap-6" data-admin-orders-page>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            الطلبات
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
            إدارة ومتابعة طلبات العملاء
          </p>
        </div>
        <p className="w-fit rounded-md border border-noviq-border bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-secondaryText">
          إجمالي الطلبات: {orders.length}
        </p>
      </div>

      <OrdersSummary counts={summaryCounts} statuses={orderStatuses} />

      <OrdersFilters
        dateFilter={dateFilter}
        hasActiveFilters={hasActiveFilters}
        onDateFilterChange={setDateFilter}
        onReset={resetFilters}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        statuses={orderStatuses}
      />

      {visibleOrders.length > 0 ? (
        <>
          <OrdersTable orders={visibleOrders} onOpenOrder={openOrder} />
          <OrdersMobileCards orders={visibleOrders} onOpenOrder={openOrder} />
        </>
      ) : (
        <div
          className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center text-sm leading-7 text-noviq-muted"
          data-orders-empty
        >
          {emptyMessage}
        </div>
      )}

      <OrderDetailsDrawer
        feedback={statusFeedback}
        onClose={closeOrder}
        onStatusChange={updateOrderStatus}
        order={selectedOrder}
        statuses={orderStatuses}
      />
    </section>
  );
}
