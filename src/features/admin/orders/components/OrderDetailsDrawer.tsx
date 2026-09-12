import { ExternalLink, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { resolveDeliveryRegionOption } from '../../../../config/delivery';
import type { ActiveOrderStatus, AdminOrder, OrderStatus } from '../../../../types/catalog';
import { createPalestinianWhatsAppHref } from '../../../../utils/contactLinks';
import { formatCurrency, formatDate } from '../../../../utils/format';
import StatusBadge from '../../components/StatusBadge';

interface OrderDetailsDrawerProps {
  order: AdminOrder | null;
  statuses: ActiveOrderStatus[];
  feedback: string;
  onClose: () => void;
  onDelete: (orderId: string) => void;
  onStatusChange: (orderId: string, status: ActiveOrderStatus) => void;
}

const unspecifiedText = 'غير محدد';
const legacyConfirmedStatus: OrderStatus = 'تم التأكيد';
const legacyPreparingStatus: OrderStatus = 'قيد التجهيز';

function getDeliveryRegionLabel(order: AdminOrder) {
  return (
    order.deliveryRegionLabel?.trim() ||
    resolveDeliveryRegionOption(order.deliveryRegion)?.label ||
    unspecifiedText
  );
}

function getDeliveryFeeLabel(order: AdminOrder) {
  return formatCurrency(order.deliveryFee ?? order.shipping ?? 0);
}

function getOrderSubtotal(order: AdminOrder) {
  return order.subtotal ?? order.items.reduce((sum, item) => sum + item.lineTotal, 0);
}

function isActiveStatus(status: OrderStatus, statuses: ActiveOrderStatus[]): status is ActiveOrderStatus {
  return statuses.some((candidate) => candidate === status);
}

export default function OrderDetailsDrawer({
  order,
  statuses,
  feedback,
  onClose,
  onDelete,
  onStatusChange,
}: OrderDetailsDrawerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!order) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isDeleteDialogOpen) {
          setIsDeleteDialogOpen(false);
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
  }, [isDeleteDialogOpen, onClose, order]);

  useEffect(() => {
    setIsDeleteDialogOpen(false);
  }, [order?.id]);

  const itemCount = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [order],
  );

  if (!order) {
    return null;
  }

  const activeOrder = order;
  const subtotal = getOrderSubtotal(order);
  const deliveryRegionLabel = getDeliveryRegionLabel(order);
  const deliveryFeeLabel = getDeliveryFeeLabel(order);
  const customerWhatsAppHref = createPalestinianWhatsAppHref(order.phone);
  const statusOptions = isActiveStatus(order.status, statuses)
    ? statuses
    : [order.status, ...statuses];
  const canUpdateStatus =
    isActiveStatus(order.status, statuses.slice(0, -1)) ||
    order.status === legacyConfirmedStatus ||
    order.status === legacyPreparingStatus;

  function handleStatusChange(status: OrderStatus) {
    if (status === activeOrder.status || !isActiveStatus(status, statuses)) {
      return;
    }

    onStatusChange(activeOrder.id, status);
  }

  function confirmDelete() {
    onDelete(activeOrder.id);
    setIsDeleteDialogOpen(false);
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
                    disabled={!canUpdateStatus}
                    onChange={(event) => handleStatusChange(event.target.value as OrderStatus)}
                    value={order.status}
                    data-order-status-select
                  >
                    {statusOptions.map((status) => (
                      <option
                        disabled={!isActiveStatus(status, statuses)}
                        key={status}
                        value={status}
                      >
                        {isActiveStatus(status, statuses) ? status : `${status} - حالة قديمة`}
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
                    {customerWhatsAppHref ? (
                      <a
                        className="inline-flex items-center gap-1.5 text-noviq-secondaryText transition hover:text-noviq-gold"
                        data-order-customer-whatsapp-link
                        dir="ltr"
                        href={customerWhatsAppHref}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span>{order.phone}</span>
                        <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-noviq-secondaryText" dir="ltr">
                        {order.phone}
                      </span>
                    )}
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
                  <dt>منطقة التوصيل</dt>
                  <dd className="text-left">{deliveryRegionLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
                  <dt>رسوم التوصيل</dt>
                  <dd>{deliveryFeeLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
                  <dt>المجموع الفرعي</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
                  <dt>طريقة الدفع</dt>
                  <dd>{order.paymentMethod}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-noviq-border pt-4 text-base font-bold text-noviq-text">
                  <dt>الإجمالي النهائي</dt>
                  <dd className="text-noviq-gold">{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </section>

            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-4 text-sm font-semibold text-red-200 transition hover:border-red-400"
              onClick={() => setIsDeleteDialogOpen(true)}
              type="button"
              data-delete-order
            >
              <Trash2 size={16} strokeWidth={1.8} />
              حذف الطلب
            </button>
          </div>
        </div>
      </aside>

      {isDeleteDialogOpen ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/65 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد حذف الطلب"
          data-delete-order-dialog
        >
          <div className="w-full max-w-sm rounded-md border border-noviq-border bg-noviq-card p-5">
            <p className="text-base font-bold text-noviq-text">
              هل أنت متأكد من حذف هذا الطلب؟
            </p>
            <p className="mt-2 text-sm leading-7 text-noviq-secondaryText">
              سيتم إخفاء الطلب من القوائم والتقارير دون حذفه نهائيا من قاعدة البيانات.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-500/50 bg-red-500/10 px-4 text-sm font-semibold text-red-200 transition hover:border-red-400"
                onClick={confirmDelete}
                type="button"
                data-delete-order-confirm
              >
                حذف الطلب
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-border px-4 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                onClick={() => setIsDeleteDialogOpen(false)}
                type="button"
                data-delete-order-back
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
