import type { AdminOrder } from '../../../../types/catalog';
import { formatCurrency, formatDate } from '../../../../utils/format';
import StatusBadge from '../../components/StatusBadge';

interface OrdersTableProps {
  orders: AdminOrder[];
  onOpenOrder: (orderId: string) => void;
}

function getItemsCount(order: AdminOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export default function OrdersTable({ orders, onOpenOrder }: OrdersTableProps) {
  return (
    <div
      className="hidden overflow-hidden rounded-md border border-noviq-border bg-noviq-card lg:block"
      data-orders-table
    >
      <div className="overflow-x-auto">
        <table className="min-w-[930px] w-full border-collapse text-right">
          <thead className="bg-noviq-secondary text-xs font-semibold text-noviq-secondaryText">
            <tr>
              <th className="border-b border-noviq-border px-4 py-3">رقم الطلب</th>
              <th className="border-b border-noviq-border px-4 py-3">العميل</th>
              <th className="border-b border-noviq-border px-4 py-3">الهاتف</th>
              <th className="border-b border-noviq-border px-4 py-3">عدد المنتجات</th>
              <th className="border-b border-noviq-border px-4 py-3">الإجمالي</th>
              <th className="border-b border-noviq-border px-4 py-3">الحالة</th>
              <th className="border-b border-noviq-border px-4 py-3">التاريخ</th>
              <th className="border-b border-noviq-border px-4 py-3">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-noviq-border">
            {orders.map((order) => (
              <tr
                className="transition hover:bg-noviq-secondary"
                key={order.id}
                data-order-table-row={order.orderNumber}
              >
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-noviq-text">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-noviq-secondaryText">
                  {order.customerName}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-noviq-muted" dir="ltr">
                  {order.phone}
                </td>
                <td className="px-4 py-4 text-sm text-noviq-secondaryText">
                  {getItemsCount(order)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-noviq-gold">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-noviq-muted">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-md border border-noviq-border px-3 text-xs font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                    onClick={() => onOpenOrder(order.id)}
                    type="button"
                    data-order-details-open={order.orderNumber}
                  >
                    عرض التفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
