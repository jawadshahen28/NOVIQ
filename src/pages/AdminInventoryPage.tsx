import { useMemo, useState } from 'react';
import { useAdminCatalog } from '../features/admin/catalog/AdminCatalogContext';
import InventoryFilters from '../features/admin/inventory/components/InventoryFilters';
import InventoryMobileCards from '../features/admin/inventory/components/InventoryMobileCards';
import InventorySummary from '../features/admin/inventory/components/InventorySummary';
import InventoryTable from '../features/admin/inventory/components/InventoryTable';
import StockEditorDialog from '../features/admin/inventory/components/StockEditorDialog';
import {
  createCategoryNameMap,
  getCategoryName,
  getStockCondition,
  matchesStockFilter,
  type ProductStockFilter,
} from '../features/admin/products/productAdminUtils';
import type { CategorySlug, Product } from '../types/catalog';

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getInventorySearchText(product: Product, categoryMap: Map<CategorySlug, string>) {
  return normalizeSearchValue(
    [
      product.name,
      product.category,
      getCategoryName(categoryMap, product.category),
      product.shortDescription,
    ].join(' '),
  );
}

function filterProducts(
  products: Product[],
  searchTerm: string,
  categoryFilter: string,
  stockFilter: ProductStockFilter,
  categoryMap: Map<CategorySlug, string>,
) {
  const normalizedSearch = normalizeSearchValue(searchTerm);

  return products.filter((product) => {
    const matchesSearch =
      !normalizedSearch || getInventorySearchText(product, categoryMap).includes(normalizedSearch);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = matchesStockFilter(product, stockFilter);

    return matchesSearch && matchesCategory && matchesStock;
  });
}

function createInventorySummary(products: Product[]) {
  return products.reduce(
    (summary, product) => {
      const stockCondition = getStockCondition(product.stock);

      summary.totalUnits += product.stock;

      if (stockCondition === 'available') {
        summary.availableProducts += 1;
      }

      if (stockCondition === 'low') {
        summary.lowStockProducts += 1;
      }

      if (stockCondition === 'out') {
        summary.outOfStockProducts += 1;
      }

      return summary;
    },
    {
      totalUnits: 0,
      availableProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
    },
  );
}

export default function AdminInventoryPage() {
  const { categories, products, updateProductStock } = useAdminCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<ProductStockFilter>('all');
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [lastUpdatedById, setLastUpdatedById] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');

  const categoryMap = useMemo(() => createCategoryNameMap(categories), [categories]);
  const summary = useMemo(() => createInventorySummary(products), [products]);
  const visibleProducts = useMemo(
    () => filterProducts(products, searchTerm, categoryFilter, stockFilter, categoryMap),
    [categoryFilter, categoryMap, products, searchTerm, stockFilter],
  );
  const hasActiveFilters =
    Boolean(searchTerm.trim()) || categoryFilter !== 'all' || stockFilter !== 'all';
  const emptyMessage =
    products.length === 0 ? 'لا توجد منتجات حالياً' : 'لا توجد منتجات مطابقة';

  function resetFilters() {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
  }

  function saveStock(productId: string, stock: number) {
    updateProductStock(productId, stock);
    setLastUpdatedById((current) => ({ ...current, [productId]: new Date().toISOString() }));
    setFeedback('تم تحديث المخزون');
    setEditingStockProduct(null);
  }

  return (
    <section className="grid min-w-0 gap-6" data-admin-inventory-page>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            المخزون
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
            متابعة وإدارة مخزون منتجات NOVIQ
          </p>
        </div>
      </div>

      {feedback ? (
        <p
          className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold"
          role="status"
          data-inventory-feedback
        >
          {feedback}
        </p>
      ) : null}

      <InventorySummary
        availableProducts={summary.availableProducts}
        lowStockProducts={summary.lowStockProducts}
        outOfStockProducts={summary.outOfStockProducts}
        totalUnits={summary.totalUnits}
      />

      <InventoryFilters
        categories={categories}
        categoryFilter={categoryFilter}
        hasActiveFilters={hasActiveFilters}
        onCategoryFilterChange={setCategoryFilter}
        onReset={resetFilters}
        onSearchChange={setSearchTerm}
        onStockFilterChange={setStockFilter}
        searchTerm={searchTerm}
        stockFilter={stockFilter}
      />

      {visibleProducts.length > 0 ? (
        <>
          <InventoryTable
            categoryMap={categoryMap}
            lastUpdatedById={lastUpdatedById}
            onEditStock={(product) => {
              setEditingStockProduct(product);
              setFeedback('');
            }}
            products={visibleProducts}
          />
          <InventoryMobileCards
            categoryMap={categoryMap}
            onEditStock={(product) => {
              setEditingStockProduct(product);
              setFeedback('');
            }}
            products={visibleProducts}
          />
        </>
      ) : (
        <div
          className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center text-sm leading-7 text-noviq-muted"
          data-inventory-empty
        >
          {emptyMessage}
        </div>
      )}

      <StockEditorDialog
        onClose={() => setEditingStockProduct(null)}
        onSave={saveStock}
        product={editingStockProduct}
      />
    </section>
  );
}
