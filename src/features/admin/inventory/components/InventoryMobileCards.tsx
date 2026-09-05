import type { CategorySlug, Product } from '../../../../types/catalog';
import {
  getCategoryName,
  getStockCondition,
} from '../../products/productAdminUtils';
import ProductStockBadge from '../../products/components/ProductStockBadge';

interface InventoryMobileCardsProps {
  categoryMap: Map<CategorySlug, string>;
  products: Product[];
  onEditStock: (product: Product) => void;
}

export default function InventoryMobileCards({
  categoryMap,
  products,
  onEditStock,
}: InventoryMobileCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden" data-inventory-mobile-cards>
      {products.map((product) => (
        <article
          className="rounded-md border border-noviq-border bg-noviq-card p-4"
          key={product.id}
          data-inventory-mobile-card={product.id}
        >
          <div className="grid grid-cols-[74px_minmax(0,1fr)] gap-3">
            <img
              alt={product.name}
              className="h-[74px] w-[74px] rounded-md border border-noviq-border object-cover"
              src={product.images[0]}
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-bold leading-6 text-noviq-text">
                {product.name}
              </p>
              <p className="mt-1 text-xs font-semibold text-noviq-secondaryText">
                {getCategoryName(categoryMap, product.category)}
              </p>
              <div className="mt-3">
                <ProductStockBadge status={getStockCondition(product.stock)} />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-noviq-border pt-3">
            <div>
              <p className="text-xs text-noviq-muted">الكمية الحالية</p>
              <p className="mt-1 text-xl font-bold leading-none text-noviq-text" data-inventory-stock-count>
                {product.stock}
              </p>
            </div>
            <button
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-noviq-border px-3 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
              onClick={() => onEditStock(product)}
              type="button"
              data-inventory-stock-edit={product.id}
            >
              تعديل الكمية
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
