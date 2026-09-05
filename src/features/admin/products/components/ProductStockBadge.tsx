import type { ProductStockStatus } from '../productAdminUtils';
import { getStockStatusLabel } from '../productAdminUtils';

const stockStatusClasses: Record<ProductStockStatus, string> = {
  available: 'border-emerald-500/45 bg-emerald-500/10 text-emerald-200',
  low: 'border-amber-500/45 bg-amber-500/10 text-amber-200',
  out: 'border-red-500/40 bg-red-500/10 text-red-200',
  hidden: 'border-noviq-border bg-noviq-secondary text-noviq-muted',
};

export default function ProductStockBadge({ status }: { status: ProductStockStatus }) {
  return (
    <span
      className={`inline-flex min-h-8 shrink-0 items-center justify-center rounded-sm border px-3 text-xs font-semibold ${stockStatusClasses[status]}`}
      data-admin-product-stock-status={status}
    >
      {getStockStatusLabel(status)}
    </span>
  );
}
