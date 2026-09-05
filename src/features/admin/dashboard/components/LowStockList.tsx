import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardLowStockProduct } from '../dashboardData';

interface LowStockListProps {
  products: DashboardLowStockProduct[];
}

export default function LowStockList({ products }: LowStockListProps) {
  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-dashboard-low-stock
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-noviq-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-noviq-gold">المخزون</p>
          <h3 className="mt-2 text-lg font-bold text-noviq-text">المخزون المنخفض</h3>
        </div>
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-noviq-border px-3 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold sm:w-auto"
          to="/admin/inventory"
          data-dashboard-inventory-link
        >
          إدارة المخزون
          <ArrowLeft size={16} strokeWidth={1.8} />
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-md border border-dashed border-noviq-border bg-noviq-secondary p-5 text-sm leading-7 text-noviq-muted">
          لا توجد منتجات منخفضة المخزون الآن.
        </p>
      ) : (
        <div className="grid gap-3">
          {products.map((item) => {
            const stockPercent = Math.min(100, Math.max(0, (item.stock / item.threshold) * 100));

            return (
              <article
                className="rounded-md border border-noviq-border bg-noviq-secondary p-4"
                key={item.product.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-noviq-text">{item.product.name}</p>
                    <p className="mt-1 text-xs text-noviq-muted">{item.categoryName}</p>
                  </div>
                  <span className="shrink-0 rounded-sm border border-noviq-gold/50 px-2.5 py-1 text-xs font-semibold text-noviq-gold">
                    {item.warning}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-noviq-secondaryText">
                    <span>المتوفر حالياً</span>
                    <span>{item.stock} / {item.threshold}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-noviq-border">
                    <span
                      className="block h-full rounded-full bg-noviq-gold"
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
