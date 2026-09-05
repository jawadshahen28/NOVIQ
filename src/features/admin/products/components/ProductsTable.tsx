import type { CategorySlug, Product } from '../../../../types/catalog';
import { formatCurrency } from '../../../../utils/format';
import {
  getCategoryName,
  getProductCompareAtPrice,
  getProductSellingPrice,
  getStockStatus,
} from '../productAdminUtils';
import ProductStockBadge from './ProductStockBadge';

interface ProductsTableProps {
  categoryMap: Map<CategorySlug, string>;
  products: Product[];
  onDeleteProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

export default function ProductsTable({
  categoryMap,
  products,
  onDeleteProduct,
  onEditProduct,
}: ProductsTableProps) {
  return (
    <div
      className="hidden overflow-hidden rounded-md border border-noviq-border bg-noviq-card lg:block"
      data-products-table
    >
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full border-collapse text-right">
          <thead className="bg-noviq-secondary text-xs font-semibold text-noviq-secondaryText">
            <tr>
              <th className="border-b border-noviq-border px-4 py-3">الصورة</th>
              <th className="border-b border-noviq-border px-4 py-3">المنتج</th>
              <th className="border-b border-noviq-border px-4 py-3">الفئة</th>
              <th className="border-b border-noviq-border px-4 py-3">سعر البيع</th>
              <th className="border-b border-noviq-border px-4 py-3">الخصم</th>
              <th className="border-b border-noviq-border px-4 py-3">تكلفة الشراء</th>
              <th className="border-b border-noviq-border px-4 py-3">المخزون</th>
              <th className="border-b border-noviq-border px-4 py-3">الحالة</th>
              <th className="border-b border-noviq-border px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-noviq-border">
            {products.map((product) => {
              const sellingPrice = getProductSellingPrice(product);
              const compareAtPrice = getProductCompareAtPrice(product);
              const stockStatus = getStockStatus(product);

              return (
                <tr
                  className="transition hover:bg-noviq-secondary"
                  key={product.id}
                  data-product-table-row={product.id}
                >
                  <td className="px-4 py-4">
                    <img
                      alt={product.name}
                      className="h-14 w-14 rounded-md border border-noviq-border object-cover"
                      src={product.images[0]}
                    />
                  </td>
                  <td className="max-w-[280px] px-4 py-4">
                    <p className="line-clamp-2 font-semibold leading-6 text-noviq-text">
                      {product.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-noviq-muted">{product.slug}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-noviq-secondaryText">
                    {getCategoryName(categoryMap, product.category)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="text-sm font-bold text-noviq-gold">
                      {formatCurrency(sellingPrice)}
                    </p>
                    {compareAtPrice ? (
                      <p className="mt-1 text-xs text-noviq-muted line-through">
                        {formatCurrency(compareAtPrice)}
                      </p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-noviq-secondaryText">
                    {product.discountPercent > 0 ? `${product.discountPercent}%` : 'بدون خصم'}
                  </td>
                  <td
                    className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-noviq-secondaryText"
                    data-admin-cost-price
                  >
                    {formatCurrency(product.costPrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-noviq-secondaryText">
                    {product.stock}
                  </td>
                  <td className="px-4 py-4">
                    <ProductStockBadge status={stockStatus} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex min-h-9 items-center justify-center rounded-md border border-noviq-border px-3 text-xs font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                        onClick={() => onEditProduct(product)}
                        type="button"
                        data-product-edit={product.id}
                      >
                        تعديل
                      </button>
                      <button
                        className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-500/35 px-3 text-xs font-semibold text-red-200 transition hover:border-red-400"
                        onClick={() => onDeleteProduct(product)}
                        type="button"
                        data-product-delete={product.id}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
