import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAdminCatalog } from '../features/admin/catalog/AdminCatalogContext';
import DeleteProductDialog from '../features/admin/products/components/DeleteProductDialog';
import ProductFormDrawer from '../features/admin/products/components/ProductFormDrawer';
import ProductsFilters from '../features/admin/products/components/ProductsFilters';
import ProductsMobileCards from '../features/admin/products/components/ProductsMobileCards';
import ProductsSummary from '../features/admin/products/components/ProductsSummary';
import ProductsTable from '../features/admin/products/components/ProductsTable';
import {
  createCategoryNameMap,
  createProductFromForm,
  getCategoryName,
  getStockStatus,
  matchesStockFilter,
  type ProductFormValues,
  type ProductStockFilter,
} from '../features/admin/products/productAdminUtils';
import type { CategorySlug, Product } from '../types/catalog';

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getProductSearchText(product: Product, categoryMap: Map<CategorySlug, string>) {
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
      !normalizedSearch || getProductSearchText(product, categoryMap).includes(normalizedSearch);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = matchesStockFilter(product, stockFilter);

    return matchesSearch && matchesCategory && matchesStock;
  });
}

function createSummary(products: Product[]) {
  return products.reduce(
    (summary, product) => {
      const stockStatus = getStockStatus(product);

      if (stockStatus === 'available') {
        summary.available += 1;
      }

      if (stockStatus === 'low') {
        summary.lowStock += 1;
      }

      if (stockStatus === 'out') {
        summary.outOfStock += 1;
      }

      return summary;
    },
    {
      total: products.length,
      available: 0,
      lowStock: 0,
      outOfStock: 0,
    },
  );
}

export default function AdminProductsPage() {
  const { addProduct, categories, deleteProduct, products, updateProduct } = useAdminCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<ProductStockFilter>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState('');

  const categoryMap = useMemo(() => createCategoryNameMap(categories), [categories]);
  const summary = useMemo(() => createSummary(products), [products]);
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

  function openAddForm() {
    setEditingProduct(null);
    setIsFormOpen(true);
    setFeedback('');
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setIsFormOpen(true);
    setFeedback('');
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  async function saveProduct(values: ProductFormValues, existingProduct?: Product) {
    const savedProduct = createProductFromForm(values, existingProduct);

    try {
      if (existingProduct) {
        await updateProduct(existingProduct.id, savedProduct);
      } else {
        await addProduct(savedProduct);
      }

      setFeedback('تم حفظ المنتج بنجاح');
      closeForm();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'تعذر حفظ المنتج');
    }
  }

  async function confirmDeleteProduct(productId: string) {
    try {
      await deleteProduct(productId);
      setPendingDeleteProduct(null);
      setFeedback('تم حذف المنتج بنجاح');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'تعذر حذف المنتج');
    }
  }

  return (
    <section className="grid min-w-0 gap-6" data-admin-products-page>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            المنتجات
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
            إدارة ساعات ومنتجات NOVIQ
          </p>
        </div>
        <Button icon={<Plus size={18} strokeWidth={1.8} />} onClick={openAddForm} data-products-add>
          إضافة منتج
        </Button>
      </div>

      {feedback ? (
        <p
          className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold"
          role="status"
          data-products-feedback
        >
          {feedback}
        </p>
      ) : null}

      <ProductsSummary
        available={summary.available}
        lowStock={summary.lowStock}
        outOfStock={summary.outOfStock}
        total={summary.total}
      />

      <ProductsFilters
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
          <ProductsTable
            categoryMap={categoryMap}
            onDeleteProduct={setPendingDeleteProduct}
            onEditProduct={openEditForm}
            products={visibleProducts}
          />
          <ProductsMobileCards
            categoryMap={categoryMap}
            onDeleteProduct={setPendingDeleteProduct}
            onEditProduct={openEditForm}
            products={visibleProducts}
          />
        </>
      ) : (
        <div
          className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center"
          data-products-empty
        >
          <p className="text-sm leading-7 text-noviq-muted">{emptyMessage}</p>
          {products.length === 0 ? (
            <Button className="mt-5" icon={<Plus size={18} />} onClick={openAddForm} data-products-empty-add>
              إضافة منتج
            </Button>
          ) : null}
        </div>
      )}

      <ProductFormDrawer
        categories={categories}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={saveProduct}
        product={editingProduct}
      />

      <DeleteProductDialog
        onCancel={() => setPendingDeleteProduct(null)}
        onConfirm={confirmDeleteProduct}
        product={pendingDeleteProduct}
      />
    </section>
  );
}
