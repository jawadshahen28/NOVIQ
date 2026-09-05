import type { CategorySlug, Product } from '../../../../types/catalog';
import { formatDate } from '../../../../utils/format';
import {
  getCategoryName,
  getStockCondition,
} from '../../products/productAdminUtils';
import ProductStockBadge from '../../products/components/ProductStockBadge';

interface InventoryTableProps {
  categoryMap: Map<CategorySlug, string>;
  lastUpdatedById: Record<string, string>;
  products: Product[];
  onEditStock: (product: Product) => void;
}

export default function InventoryTable({
  categoryMap,
  lastUpdatedById,
  products,
  onEditStock,
}: InventoryTableProps) {
  return (
    <div
      className="hidden overflow-hidden rounded-md border border-noviq-border bg-noviq-card lg:block"
      data-inventory-table
    >
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse text-right">
          <thead className="bg-noviq-secondary text-xs font-semibold text-noviq-secondaryText">
            <tr>
              <th className="border-b border-noviq-border px-4 py-3">الصورة</th>
              <th className="border-b border-noviq-border px-4 py-3">المنتج</th>
              <th className="border-b border-noviq-border px-4 py-3">الفئة</th>
              <th className="border-b border-noviq-border px-4 py-3">الكمية الحالية</th>
              <th className="border-b border-noviq-border px-4 py-3">حالة المخزون</th>
              <th className="border-b border-noviq-border px-4 py-3">آخر تعديل</th>
              <th className="border-b border-noviq-border px-4 py-3">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-noviq-border">
            {products.map((product) => (
              <tr
                className="transition hover:bg-noviq-secondary"
                key={product.id}
                data-inventory-table-row={product.id}
              >
                <td className="px-4 py-4">
                  <img
                    alt={product.name}
                    className="h-14 w-14 rounded-md border border-noviq-border object-cover"
                    src={product.images[0]}
                  />
                </td>
                <td className="max-w-[340px] px-4 py-4">
                  <p className="line-clamp-2 font-semibold leading-6 text-noviq-text">
                    {product.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-noviq-muted">{product.slug}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-noviq-secondaryText">
                  {getCategoryName(categoryMap, product.category)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-noviq-text" data-inventory-stock-count>
                  {product.stock}
                </td>
                <td className="px-4 py-4">
                  <ProductStockBadge status={getStockCondition(product.stock)} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-noviq-muted">
                  {lastUpdatedById[product.id] ? formatDate(lastUpdatedById[product.id]) : 'لم يتم التعديل'}
                </td>
                <td className="px-4 py-4">
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-md border border-noviq-border px-3 text-xs font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                    onClick={() => onEditStock(product)}
                    type="button"
                    data-inventory-stock-edit={product.id}
                  >
                    تعديل الكمية
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
