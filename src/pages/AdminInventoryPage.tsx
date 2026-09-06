import { useEffect, useMemo, useState } from 'react';
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
import {
  applyInventoryItem,
  listInventory,
  updateInventoryStock,
  type InventorySummaryData,
} from '../services/inventoryApi';

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

export default function AdminInventoryPage() {
  const { categories, products } = useAdminCatalog();
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>(products);
  const [summary, setSummary] = useState<InventorySummaryData>({
    lowStockProducts: 0,
    outOfStockProducts: 0,
    threshold: 3,
    totalProducts: 0,
    totalUnits: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<ProductStockFilter>('all');
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [lastUpdatedById, setLastUpdatedById] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');

  const categoryMap = useMemo(() => createCategoryNameMap(categories), [categories]);
  const visibleProducts = useMemo(
    () => filterProducts(inventoryProducts, searchTerm, categoryFilter, stockFilter, categoryMap),
    [categoryFilter, categoryMap, inventoryProducts, searchTerm, stockFilter],
  );
  const hasActiveFilters =
    Boolean(searchTerm.trim()) || categoryFilter !== 'all' || stockFilter !== 'all';
  const emptyMessage =
    inventoryProducts.length === 0 ? 'لا توجد منتجات حالياً' : 'لا توجد منتجات مطابقة';

  useEffect(() => {
    let isMounted = true;

    listInventory()
      .then(({ items, summary: inventorySummary }) => {
        if (!isMounted) return;
        setInventoryProducts(
          items.map((item) =>
            applyInventoryItem(
              products.find((candidate) => candidate.id === item.id),
              item,
            ),
          ),
        );
        setSummary(inventorySummary);
        setLoadError('');
      })
      .catch(() => {
        if (isMounted) setLoadError('تعذر تحميل بيانات المخزون، يرجى المحاولة مرة أخرى.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [products]);

  function resetFilters() {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
  }

  async function saveStock(productId: string, stock: number) {
    const product = inventoryProducts.find((item) => item.id === productId);
    if (!product) return;

    try {
      const { item } = await updateInventoryStock(productId, stock, product.stock);
      setInventoryProducts((current) =>
        current.map((currentProduct) => (currentProduct.id === productId
          ? applyInventoryItem(currentProduct, item)
          : currentProduct)),
      );
      setSummary((current) => ({
        ...current,
        totalUnits: current.totalUnits - product.stock + item.stock,
      }));
      setLastUpdatedById((current) => ({ ...current, [productId]: item.updatedAt ?? new Date().toISOString() }));
      setFeedback('تم تحديث المخزون');
      setEditingStockProduct(null);
    } catch {
      setFeedback('تعذر تحديث المخزون، ربما تغيرت الكمية. حدّث الصفحة وحاول مرة أخرى.');
    }
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

      {loadError ? (
        <p className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold" role="alert">
          {loadError}
        </p>
      ) : null}

      <InventorySummary
        availableProducts={summary.totalProducts - summary.lowStockProducts - summary.outOfStockProducts}
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

      {isLoading ? (
        <div className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center text-sm leading-7 text-noviq-muted">
          جاري تحميل المخزون...
        </div>
      ) : visibleProducts.length > 0 ? (
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
