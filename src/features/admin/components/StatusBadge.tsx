import type { OrderStatus } from '../../../types/catalog';

const statusClasses: Record<OrderStatus, string> = {
  جديد: 'border-noviq-gold/60 bg-noviq-gold/10 text-noviq-gold',
  'تم التأكيد': 'border-emerald-500/45 bg-emerald-500/10 text-emerald-200',
  'قيد التجهيز': 'border-amber-500/45 bg-amber-500/10 text-amber-200',
  مكتمل: 'border-green-500/45 bg-green-500/10 text-green-200',
  ملغي: 'border-red-500/40 bg-red-500/10 text-red-200',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex min-h-8 shrink-0 items-center justify-center rounded-sm border px-3 text-xs font-semibold ${statusClasses[status]}`}
      data-admin-order-status={status}
    >
      {status}
    </span>
  );
}
