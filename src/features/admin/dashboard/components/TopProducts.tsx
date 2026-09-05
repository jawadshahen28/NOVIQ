import type { DashboardProductSale } from '../dashboardData';
import { formatCurrency } from '../../../../utils/format';

interface TopProductsProps {
  products: DashboardProductSale[];
}

export default function TopProducts({ products }: TopProductsProps) {
  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-dashboard-top-products
    >
      <div className="mb-5 border-b border-noviq-border pb-4">
        <p className="text-xs font-semibold text-noviq-gold">المنتجات</p>
        <h3 className="mt-2 text-lg font-bold text-noviq-text">الأكثر مبيعاً</h3>
      </div>

      {products.length === 0 ? (
        <p className="rounded-md border border-dashed border-noviq-border bg-noviq-secondary p-5 text-sm leading-7 text-noviq-muted">
          لا توجد مبيعات منتجات كافية للعرض الآن.
        </p>
      ) : (
        <div className="grid gap-3">
          {products.map((item) => (
            <article
              className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-md border border-noviq-border bg-noviq-secondary p-3 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center"
              key={item.product.id}
            >
              <img
                alt={item.product.name}
                className="h-14 w-14 rounded-md border border-noviq-border object-cover sm:h-16 sm:w-16"
                src={item.product.images[0]}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-noviq-text">{item.product.name}</p>
                <p className="mt-1 text-xs text-noviq-muted">{item.categoryName}</p>
                <p className="mt-2 text-xs font-semibold text-noviq-secondaryText">
                  {item.unitsSold} قطعة مباعة
                </p>
              </div>
              <p className="col-span-2 text-sm font-bold text-noviq-gold sm:col-span-1">
                {formatCurrency(item.revenue)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
