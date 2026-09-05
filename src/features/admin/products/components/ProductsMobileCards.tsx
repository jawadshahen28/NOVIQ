import type { CategorySlug, Product } from '../../../../types/catalog';
import { formatCurrency } from '../../../../utils/format';
import {
  getCategoryName,
  getProductCompareAtPrice,
  getProductSellingPrice,
  getStockStatus,
} from '../productAdminUtils';
import ProductStockBadge from './ProductStockBadge';

interface ProductsMobileCardsProps {
  categoryMap: Map<CategorySlug, string>;
  products: Product[];
  onDeleteProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

export default function ProductsMobileCards({
  categoryMap,
  products,
  onDeleteProduct,
  onEditProduct,
}: ProductsMobileCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden" data-products-mobile-cards>
      {products.map((product) => {
        const sellingPrice = getProductSellingPrice(product);
        const compareAtPrice = getProductCompareAtPrice(product);

        return (
          <article
            className="rounded-md border border-noviq-border bg-noviq-card p-4"
            key={product.id}
            data-product-mobile-card={product.id}
          >
            <div className="grid grid-cols-[74px_minmax(0,1fr)] gap-3">
              <img
                alt={product.name}
                className="h-[74px] w-[74px] rounded-md border border-noviq-border object-cover"
                src={product.images[0]}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-bold leading-6 text-noviq-text">
                    {product.name}
                  </p>
                  <ProductStockBadge status={getStockStatus(product)} />
                </div>
                <p className="mt-1 text-xs font-semibold text-noviq-secondaryText">
                  {getCategoryName(categoryMap, product.category)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-noviq-muted">سعر البيع</p>
                <p className="mt-1 text-sm font-bold text-noviq-gold">
                  {formatCurrency(sellingPrice)}
                </p>
                {compareAtPrice ? (
                  <p className="mt-1 text-[11px] text-noviq-muted line-through">
                    {formatCurrency(compareAtPrice)}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-noviq-muted">المخزون</p>
                <p className="mt-1 text-sm font-semibold text-noviq-text">{product.stock}</p>
              </div>
              <div data-admin-cost-price>
                <p className="text-noviq-muted">تكلفة الشراء</p>
                <p className="mt-1 text-sm font-semibold text-noviq-secondaryText">
                  {formatCurrency(product.costPrice)}
                </p>
              </div>
              <div>
                <p className="text-noviq-muted">الخصم</p>
                <p className="mt-1 text-sm font-semibold text-noviq-secondaryText">
                  {product.discountPercent > 0 ? `${product.discountPercent}%` : 'بدون خصم'}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-noviq-border px-3 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                onClick={() => onEditProduct(product)}
                type="button"
                data-product-edit={product.id}
              >
                تعديل
              </button>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-red-500/35 px-3 text-sm font-semibold text-red-200 transition hover:border-red-400"
                onClick={() => onDeleteProduct(product)}
                type="button"
                data-product-delete={product.id}
              >
                حذف
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
