import type { AdminOrder } from '../../../../types/catalog';
import { formatCurrency, formatDate } from '../../../../utils/format';
import StatusBadge from '../../components/StatusBadge';

interface OrdersMobileCardsProps {
  orders: AdminOrder[];
  onOpenOrder: (orderId: string) => void;
}

function getItemsCount(order: AdminOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export default function OrdersMobileCards({ orders, onOpenOrder }: OrdersMobileCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden" data-orders-mobile-cards>
      {orders.map((order) => (
        <article
          className="rounded-md border border-noviq-border bg-noviq-card p-4"
          key={order.id}
          data-order-mobile-card={order.orderNumber}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-noviq-text">{order.orderNumber}</p>
              <p className="mt-2 text-sm font-semibold text-noviq-secondaryText">
                {order.customerName}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-noviq-muted">
            <div>
              <p className="text-noviq-secondaryText">الإجمالي</p>
              <p className="mt-1 text-sm font-bold text-noviq-gold">{formatCurrency(order.total)}</p>
            </div>
            <div>
              <p className="text-noviq-secondaryText">المنتجات</p>
              <p className="mt-1 text-sm font-semibold text-noviq-text">{getItemsCount(order)}</p>
            </div>
            <div>
              <p className="text-noviq-secondaryText">التاريخ</p>
              <p className="mt-1 text-noviq-muted">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-noviq-secondaryText">الهاتف</p>
              <p className="mt-1 text-noviq-muted" dir="ltr">
                {order.phone}
              </p>
            </div>
          </div>

          <button
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-noviq-border px-3 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={() => onOpenOrder(order.id)}
            type="button"
            data-order-details-open={order.orderNumber}
          >
            عرض التفاصيل
          </button>
        </article>
      ))}
    </div>
  );
}
