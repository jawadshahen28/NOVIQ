import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardRecentOrder } from '../dashboardData';
import { formatCurrency, formatDate } from '../../../../utils/format';
import StatusBadge from '../../components/StatusBadge';

interface RecentOrdersProps {
  orders: DashboardRecentOrder[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-dashboard-recent-orders
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-noviq-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-noviq-gold">الطلبات</p>
          <h3 className="mt-2 text-lg font-bold text-noviq-text">أحدث الطلبات</h3>
        </div>
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-noviq-border px-3 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold sm:w-auto"
          to="/admin/orders"
          data-dashboard-orders-link
        >
          عرض جميع الطلبات
          <ArrowLeft size={16} strokeWidth={1.8} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-md border border-dashed border-noviq-border bg-noviq-secondary p-5 text-sm leading-7 text-noviq-muted">
          لا توجد طلبات حديثة للعرض الآن.
        </p>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <article
              className="grid gap-3 rounded-md border border-noviq-border bg-noviq-secondary p-4 md:grid-cols-[minmax(0,1.2fr)_auto] md:items-center"
              key={order.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-noviq-text">{order.id}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-2 text-sm font-semibold text-noviq-secondaryText">{order.customerName}</p>
                <p className="mt-1 text-xs leading-6 text-noviq-muted">
                  {order.itemCount} منتج · {formatDate(order.createdAt)}
                </p>
              </div>
              <p className="text-base font-bold text-noviq-gold">{formatCurrency(order.total)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
