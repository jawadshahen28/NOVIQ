import { RotateCcw, Search } from 'lucide-react';
import type { Category } from '../../../../types/catalog';
import type { ProductStockFilter } from '../../products/productAdminUtils';

interface InventoryFiltersProps {
  categories: Category[];
  categoryFilter: string;
  hasActiveFilters: boolean;
  searchTerm: string;
  stockFilter: ProductStockFilter;
  onCategoryFilterChange: (value: string) => void;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  onStockFilterChange: (value: ProductStockFilter) => void;
}

const stockFilterOptions: Array<{ value: ProductStockFilter; label: string }> = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'available', label: 'متوفر' },
  { value: 'low', label: 'مخزون منخفض' },
  { value: 'out', label: 'نافد' },
];

export default function InventoryFilters({
  categories,
  categoryFilter,
  hasActiveFilters,
  searchTerm,
  stockFilter,
  onCategoryFilterChange,
  onReset,
  onSearchChange,
  onStockFilterChange,
}: InventoryFiltersProps) {
  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-inventory-filters
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_220px_200px_auto] xl:items-end">
        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>البحث</span>
          <span className="relative">
            <input
              className="field pr-11"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث باسم المنتج أو الفئة"
              type="search"
              value={searchTerm}
              data-inventory-search
            />
            <Search
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-noviq-muted"
              size={18}
              strokeWidth={1.8}
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>الفئة</span>
          <select
            className="field"
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            value={categoryFilter}
            data-inventory-category-filter
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
          <span>الحالة</span>
          <select
            className="field"
            onChange={(event) => onStockFilterChange(event.target.value as ProductStockFilter)}
            value={stockFilter}
            data-inventory-stock-filter
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
            data-inventory-reset
          >
            <RotateCcw size={16} strokeWidth={1.8} />
            إعادة التعيين
          </button>
        ) : null}
      </div>
    </section>
  );
}
