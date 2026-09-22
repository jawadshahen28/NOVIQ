import { RotateCcw, Search } from 'lucide-react';
import type { Category } from '../../../../types/catalog';
import {
  productDepartmentOptions,
  type ProductDepartmentFilter,
  type ProductStockFilter,
} from '../productAdminUtils';

interface ProductsFiltersProps {
  categories: Category[];
  categoryFilter: string;
  departmentFilter: ProductDepartmentFilter;
  hasActiveFilters: boolean;
  searchTerm: string;
  stockFilter: ProductStockFilter;
  onCategoryFilterChange: (value: string) => void;
  onDepartmentFilterChange: (value: ProductDepartmentFilter) => void;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  onStockFilterChange: (value: ProductStockFilter) => void;
}

const stockFilterOptions: Array<{ value: ProductStockFilter; label: string }> = [
  { value: 'all', label: 'جميع حالات المخزون' },
  { value: 'available', label: 'متوفر' },
  { value: 'low', label: 'مخزون منخفض' },
  { value: 'out', label: 'نافد' },
];

export default function ProductsFilters({
  categories,
  categoryFilter,
  departmentFilter,
  hasActiveFilters,
  searchTerm,
  stockFilter,
  onCategoryFilterChange,
  onDepartmentFilterChange,
  onReset,
  onSearchChange,
  onStockFilterChange,
}: ProductsFiltersProps) {
  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-products-filters
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_180px_220px_220px_auto] xl:items-end">
        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>البحث</span>
          <span className="relative">
            <input
              className="field pr-11"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث باسم المنتج أو الفئة"
              type="search"
              value={searchTerm}
              data-products-search
            />
            <Search
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-noviq-muted"
              size={18}
              strokeWidth={1.8}
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>{'\u0627\u0644\u0642\u0633\u0645'}</span>
          <select
            className="field"
            onChange={(event) =>
              onDepartmentFilterChange(event.target.value as ProductDepartmentFilter)
            }
            value={departmentFilter}
            data-products-department-filter
          >
            <option value="all">
              {'\u062c\u0645\u064a\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0645'}
            </option>
            {productDepartmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="unset">{'\u063a\u064a\u0631 \u0645\u062d\u062f\u062f'}</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>الفئة</span>
          <select
            className="field"
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            value={categoryFilter}
            data-products-category-filter
          >
            <option value="all">جميع الفئات</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>المخزون</span>
          <select
            className="field"
            onChange={(event) => onStockFilterChange(event.target.value as ProductStockFilter)}
            value={stockFilter}
            data-products-stock-filter
          >
            {stockFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-noviq-secondaryText transition hover:text-noviq-gold"
            onClick={onReset}
            type="button"
            data-products-reset
          >
            <RotateCcw size={16} strokeWidth={1.8} />
            إعادة التعيين
          </button>
        ) : null}
      </div>
    </section>
  );
}
