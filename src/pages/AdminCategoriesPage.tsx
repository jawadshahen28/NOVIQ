import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAdminCatalog } from '../features/admin/catalog/AdminCatalogContext';
import CategoriesFilters from '../features/admin/categories/components/CategoriesFilters';
import CategoriesMobileCards from '../features/admin/categories/components/CategoriesMobileCards';
import CategoriesSummary from '../features/admin/categories/components/CategoriesSummary';
import CategoriesTable from '../features/admin/categories/components/CategoriesTable';
import CategoryFormDrawer from '../features/admin/categories/components/CategoryFormDrawer';
import DeleteCategoryDialog from '../features/admin/categories/components/DeleteCategoryDialog';
import {
  createCategoryFromForm,
  type CategoryFormValues,
} from '../features/admin/categories/categoryAdminUtils';
import type { Category } from '../types/catalog';

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function filterCategories(categories: Category[], searchTerm: string) {
  const normalizedSearch = normalizeSearchValue(searchTerm);

  if (!normalizedSearch) {
    return categories;
  }

  return categories.filter((category) =>
    normalizeSearchValue(`${category.name} ${category.slug}`).includes(normalizedSearch),
  );
}

export default function AdminCategoriesPage() {
  const {
    addCategory,
    categories,
    deleteCategory,
    getCategoryProductCount,
    products,
    updateCategory,
  } = useAdminCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState<Category | null>(null);
  const [feedback, setFeedback] = useState('');

  const visibleCategories = useMemo(
    () => filterCategories(categories, searchTerm),
    [categories, searchTerm],
  );
  const linkedProducts = useMemo(
    () => products.filter((product) => categories.some((category) => category.slug === product.category)).length,
    [categories, products],
  );
  const pendingDeleteProductCount = pendingDeleteCategory
    ? getCategoryProductCount(pendingDeleteCategory.slug)
    : 0;
  const editingProductCount = editingCategory
    ? getCategoryProductCount(editingCategory.slug)
    : 0;
  const hasActiveFilters = Boolean(searchTerm.trim());
  const emptyMessage =
    categories.length === 0 ? 'لا توجد فئات حالياً' : 'لا توجد فئات مطابقة';

  function resetFilters() {
    setSearchTerm('');
  }

  function openAddForm() {
    setEditingCategory(null);
    setIsFormOpen(true);
    setFeedback('');
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setIsFormOpen(true);
    setFeedback('');
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingCategory(null);
  }

  async function saveCategory(values: CategoryFormValues, existingCategory?: Category) {
    const savedCategory = createCategoryFromForm(values, existingCategory);

    try {
      if (existingCategory) {
        await updateCategory(existingCategory.id, savedCategory);
      } else {
        await addCategory(savedCategory);
      }

      setFeedback('تم حفظ الفئة بنجاح');
      closeForm();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'تعذر حفظ الفئة');
    }
  }

  async function confirmDeleteCategory(categoryId: string) {
    try {
      await deleteCategory(categoryId);
      setPendingDeleteCategory(null);
      setFeedback('تم حذف الفئة بنجاح');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'تعذر حذف الفئة');
    }
  }

  return (
    <section className="grid min-w-0 gap-6" data-admin-categories-page>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            الفئات
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
            إدارة فئات منتجات NOVIQ
          </p>
        </div>
        <Button icon={<Plus size={18} strokeWidth={1.8} />} onClick={openAddForm} data-categories-add>
          إضافة فئة
        </Button>
      </div>

      {feedback ? (
        <p
          className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold"
          role="status"
          data-categories-feedback
        >
          {feedback}
        </p>
      ) : null}

      <CategoriesSummary
        active={categories.length}
        linkedProducts={linkedProducts}
        total={categories.length}
      />

      <CategoriesFilters
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        onSearchChange={setSearchTerm}
        searchTerm={searchTerm}
      />

      {visibleCategories.length > 0 ? (
        <>
          <CategoriesTable
            categories={visibleCategories}
            getProductCount={getCategoryProductCount}
            onDeleteCategory={setPendingDeleteCategory}
            onEditCategory={openEditForm}
          />
          <CategoriesMobileCards
            categories={visibleCategories}
            getProductCount={getCategoryProductCount}
            onDeleteCategory={setPendingDeleteCategory}
            onEditCategory={openEditForm}
          />
        </>
      ) : (
        <div
          className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center"
          data-categories-empty
        >
          <p className="text-sm leading-7 text-noviq-muted">{emptyMessage}</p>
          {categories.length === 0 ? (
            <Button className="mt-5" icon={<Plus size={18} />} onClick={openAddForm} data-categories-empty-add>
              إضافة فئة
            </Button>
          ) : null}
        </div>
      )}

      <CategoryFormDrawer
        categories={categories}
        category={editingCategory}
        isOpen={isFormOpen}
        isSlugLocked={editingProductCount > 0}
        onClose={closeForm}
        onSave={saveCategory}
      />

      <DeleteCategoryDialog
        category={pendingDeleteCategory}
        onCancel={() => setPendingDeleteCategory(null)}
        onConfirm={confirmDeleteCategory}
        productCount={pendingDeleteProductCount}
      />
    </section>
  );
}
