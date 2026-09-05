import type { ReportProductPerformance } from '../reportAdminUtils';
import { formatCurrency } from '../../../../utils/format';

interface ReportsTopProductsProps {
  products: ReportProductPerformance[];
}

export default function ReportsTopProducts({ products }: ReportsTopProductsProps) {
  return (
    <section
      className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-report-top-products
    >
      <div className="mb-5 border-b border-noviq-border pb-4">
        <p className="text-xs font-semibold text-noviq-gold">المنتجات</p>
        <h3 className="mt-2 text-lg font-bold text-noviq-text">المنتجات الأكثر مبيعاً</h3>
      </div>

      {products.length === 0 ? (
        <p className="rounded-md border border-dashed border-noviq-border bg-noviq-secondary p-5 text-sm leading-7 text-noviq-muted">
          لا توجد منتجات مباعة في هذه الفترة.
        </p>
      ) : (
        <div className="grid gap-3">
          {products.map((item) => (
            <article
              className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-md border border-noviq-border bg-noviq-secondary p-3 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center"
              data-report-top-product-row={item.id}
              key={item.id}
            >
              <img
                alt={item.name}
                className="h-14 w-14 rounded-md border border-noviq-border object-cover sm:h-16 sm:w-16"
                src={item.image}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-noviq-text">{item.name}</p>
                <p className="mt-1 text-xs text-noviq-muted">{item.categoryName}</p>
                <p className="mt-2 text-xs font-semibold text-noviq-secondaryText">
                  {item.unitsSold} قطعة مباعة
                </p>
              </div>
              <div className="col-span-2 grid gap-1 text-sm sm:col-span-1 sm:text-left">
                <p className="font-bold text-noviq-gold">{formatCurrency(item.revenue)}</p>
                <p className="text-xs font-semibold text-noviq-secondaryText">
                  ربح {formatCurrency(item.profit)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
