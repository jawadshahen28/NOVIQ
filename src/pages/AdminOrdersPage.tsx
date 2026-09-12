import { useEffect, useMemo, useState } from 'react';
import OrderDetailsDrawer from '../features/admin/orders/components/OrderDetailsDrawer';
import OrdersFilters, {
  type OrderStatusFilter,
} from '../features/admin/orders/components/OrdersFilters';
import OrdersMobileCards from '../features/admin/orders/components/OrdersMobileCards';
import OrdersSummary, {
  type OrderSummaryCounts,
} from '../features/admin/orders/components/OrdersSummary';
import OrdersTable from '../features/admin/orders/components/OrdersTable';
import { ApiClientError } from '../services/apiClient';
import {
  deleteAdminOrder,
  listAdminOrders,
  updateAdminOrderStatus,
} from '../services/orderApi';
import {
  activeOrderStatuses,
  type ActiveOrderStatus,
  type AdminOrder,
} from '../types/catalog';
import { formatBusinessDateLabel, getBusinessDateInputValue } from '../utils/businessDate';

const orderStatuses = [...activeOrderStatuses];

function createSummaryCounts(orders: AdminOrder[]): OrderSummaryCounts {
  const counts = orderStatuses.reduce(
    (result, status) => ({ ...result, [status]: 0 }),
    { all: orders.length } as OrderSummaryCounts,
  );

  orders.forEach((order) => {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
  });

  return counts;
}

function filterOrders(orders: AdminOrder[], statusFilter: OrderStatusFilter) {
  return orders
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
}

export default function AdminOrdersPage() {
  const todayDate = useMemo(() => getBusinessDateInputValue(), []);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState('');

  const summaryCounts = useMemo(() => createSummaryCounts(orders), [orders]);
  const visibleOrders = useMemo(
    () => filterOrders(orders, statusFilter),
    [orders, statusFilter],
  );
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );
  const selectedDateLabel = useMemo(
    () => formatBusinessDateLabel(selectedDate),
    [selectedDate],
  );
  const hasActiveFilters =
    Boolean(searchTerm.trim()) || statusFilter !== 'all' || selectedDate !== todayDate;
  const emptyMessage = orders.length === 0
    ? 'لا توجد طلبات في التاريخ المحدد'
    : 'لا توجد طلبات مطابقة';

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    listAdminOrders({
      date: selectedDate,
      search: searchTerm,
    })
      .then(({ orders: fetchedOrders }) => {
        if (isMounted) {
          setOrders(fetchedOrders);
          setLoadError('');
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadError('تعذر تحميل الطلبات، يرجى المحاولة مرة أخرى.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchTerm, selectedDate]);

  useEffect(() => {
    if (selectedOrderId && !selectedOrder) {
      setSelectedOrderId(null);
    }
  }, [selectedOrder, selectedOrderId]);

  function resetFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedDate(todayDate);
  }

  function updateSelectedDate(value: string) {
    setSelectedDate(value || todayDate);
  }

  async function updateOrderStatus(orderId: string, status: ActiveOrderStatus) {
    try {
      const { order } = await updateAdminOrderStatus(orderId, status);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) => (currentOrder.id === orderId ? order : currentOrder)),
      );
      setStatusFeedback('تم تحديث حالة الطلب');
    } catch (error) {
      setStatusFeedback(
        error instanceof ApiClientError && error.status === 409
          ? 'لا يمكن تحديث حالة الطلب بهذا الانتقال.'
          : 'تعذر تحديث حالة الطلب، يرجى المحاولة مرة أخرى.',
      );
    }
  }

  async function deleteOrder(orderId: string) {
    try {
      await deleteAdminOrder(orderId);
      setOrders((currentOrders) => currentOrders.filter((order) => order.id !== orderId));
      closeOrder();
    } catch {
      setStatusFeedback('تعذر حذف الطلب، يرجى المحاولة مرة أخرى.');
    }
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
            إدارة ومتابعة طلبات اليوم المحدد حسب توقيت NOVIQ.
          </p>
        </div>
        <p className="w-fit rounded-md border border-noviq-border bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-secondaryText">
          إجمالي طلبات {selectedDateLabel}: {orders.length}
        </p>
      </div>

      <OrdersSummary counts={summaryCounts} statuses={orderStatuses} />

      <OrdersFilters
        hasActiveFilters={hasActiveFilters}
        onDateChange={updateSelectedDate}
        onReset={resetFilters}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        selectedDate={selectedDate}
        selectedDateLabel={selectedDateLabel}
        statusFilter={statusFilter}
        statuses={orderStatuses}
      />

      {loadError ? (
        <div
          className="rounded-md border border-noviq-gold/50 bg-noviq-secondary p-6 text-center text-sm leading-7 text-noviq-gold"
          role="alert"
          data-orders-error
        >
          {loadError}
        </div>
      ) : isLoading ? (
        <div className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center text-sm leading-7 text-noviq-muted">
          جاري تحميل الطلبات...
        </div>
      ) : visibleOrders.length > 0 ? (
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
        onDelete={deleteOrder}
        onStatusChange={updateOrderStatus}
        order={selectedOrder}
        statuses={orderStatuses}
      />
    </section>
  );
}
