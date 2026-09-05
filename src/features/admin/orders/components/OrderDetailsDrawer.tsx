import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AdminOrder, OrderStatus } from '../../../../types/catalog';
import { formatCurrency, formatDate } from '../../../../utils/format';
import StatusBadge from '../../components/StatusBadge';

interface OrderDetailsDrawerProps {
  order: AdminOrder | null;
  statuses: OrderStatus[];
  feedback: string;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export default function OrderDetailsDrawer({
  order,
  statuses,
  feedback,
  onClose,
  onStatusChange,
}: OrderDetailsDrawerProps) {
  const [pendingCancelStatus, setPendingCancelStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (!order) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (pendingCancelStatus) {
          setPendingCancelStatus(null);
          return;
        }

        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, order, pendingCancelStatus]);

  useEffect(() => {
    setPendingCancelStatus(null);
  }, [order?.id]);

  const itemCount = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [order],
  );

  if (!order) {
    return null;
  }

  const activeOrder = order;

  function handleStatusChange(status: OrderStatus) {
    if (status === activeOrder.status) {
      return;
    }

    if (status === 'ملغي') {
      setPendingCancelStatus(status);
      return;
    }

    onStatusChange(activeOrder.id, status);
  }

  function confirmCancellation() {
    if (!pendingCancelStatus) {
      return;
    }

    onStatusChange(activeOrder.id, pendingCancelStatus);
    setPendingCancelStatus(null);
  }

  return (
    <div className="fixed inset-0 z-50" data-order-details-drawer>
      <button
        className="absolute inset-0 h-full w-full bg-black/70"
        onClick={onClose}
        type="button"
        aria-label="إغلاق تفاصيل الطلب"
        data-order-details-overlay
      />

      <aside
        className="absolute inset-y-0 left-0 flex w-full flex-col border-r border-noviq-border bg-noviq-black shadow-2xl sm:max-w-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-noviq-border px-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-noviq-gold">تفاصيل الطلب</p>
            <h3 id="order-details-title" className="mt-1 text-xl font-bold text-noviq-text">
              {order.orderNumber}
            </h3>
          </div>
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={onClose}
            type="button"
            aria-label="إغلاق تفاصيل الطلب"
            data-order-details-close
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5" data-order-details-scroll>
          <div className="grid gap-5">
            <section className="rounded-md border border-noviq-border bg-noviq-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-noviq-muted">تاريخ الطلب</p>
                  <p className="mt-1 text-sm font-semibold text-noviq-secondaryText">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <label className="grid gap-2 font-semibold text-noviq-secondaryText">
                  <span>تحديث الحالة</span>
                  <select
                    className="field"
                    onChange={(event) => handleStatusChange(event.target.value as OrderStatus)}
                    value={order.status}
                    data-order-status-select
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                {feedback ? (
                  <p
                    className="rounded-md border border-noviq-gold/40 bg-noviq-secondary px-3 py-2 text-xs font-semibold text-noviq-gold"
                    role="status"
                    data-order-status-feedback
                  >
                    {feedback}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-md border border-noviq-border bg-noviq-card p-4" data-order-customer-details>
              <h4 className="text-base font-bold text-noviq-text">بيانات العميل</h4>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="grid gap-1">
                  <dt className="text-xs font-semibold text-noviq-muted">الاسم</dt>
                  <dd className="text-noviq-secondaryText">{order.customerName}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-xs font-semibold text-noviq-muted">رقم الهاتف</dt>
                  <dd>
                    <a
                      className="text-noviq-secondaryText transition hover:text-noviq-gold"
                      href={phoneHref(order.phone)}
                      dir="ltr"
                    >
                      {order.phone}
                    </a>
                  </dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-xs font-semibold text-noviq-muted">العنوان</dt>
                  <dd className="leading-7 text-noviq-secondaryText">{order.address}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-xs font-semibold text-noviq-muted">الملاحظات</dt>
                  <dd className="leading-7 text-noviq-secondaryText">
                    {order.notes?.trim() ? order.notes : 'لا توجد ملاحظات'}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-md border border-noviq-border bg-noviq-card p-4" data-order-items-details>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-base font-bold text-noviq-text">تفاصيل الطلب</h4>
                <p className="text-xs font-semibold text-noviq-secondaryText">{itemCount} منتج</p>
              </div>

              <div className="mt-4 grid gap-3">
                {order.items.map((item) => (
                  <article
                    className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border-b border-noviq-border pb-3 last:border-b-0 last:pb-0"
                    key={item.productId}
                    data-order-detail-item
                  >
                    <img
                      alt={item.name}
                      className="h-14 w-14 rounded-md border border-noviq-border object-cover"
                      src={item.image}
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold leading-6 text-noviq-text">
                        {item.name}
                      </p>
                      <div className="mt-1 grid gap-1 text-xs text-noviq-muted sm:grid-cols-3">
                        <span>الكمية: {item.quantity}</span>
                        <span>{formatCurrency(item.unitPrice)}</span>
                        <span className="font-semibold text-noviq-secondaryText">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-noviq-border bg-noviq-card p-4">
              <dl className="grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
                  <dt>المجموع الفرعي</dt>
                  <dd>{formatCurrency(order.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
                  <dt>طريقة الدفع</dt>
                  <dd>{order.paymentMethod}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-noviq-border pt-4 text-base font-bold text-noviq-text">
                  <dt>الإجمالي</dt>
                  <dd className="text-noviq-gold">{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </aside>

      {pendingCancelStatus ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد إلغاء الطلب"
          data-cancel-order-dialog
        >
          <div className="w-full max-w-sm rounded-md border border-noviq-border bg-noviq-card p-5">
            <p className="text-base font-bold text-noviq-text">
              هل أنت متأكد من إلغاء هذا الطلب؟
            </p>
            <p className="mt-2 text-sm leading-7 text-noviq-secondaryText">
              سيبقى الطلب ظاهرًا في السجل بحالة ملغي.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-500/50 bg-red-500/10 px-4 text-sm font-semibold text-red-200 transition hover:border-red-400"
                onClick={confirmCancellation}
                type="button"
                data-cancel-order-confirm
              >
                إلغاء الطلب
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-border px-4 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                onClick={() => setPendingCancelStatus(null)}
                type="button"
                data-cancel-order-back
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
