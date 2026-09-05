import { RotateCcw, Search } from 'lucide-react';

interface CategoriesFiltersProps {
  hasActiveFilters: boolean;
  searchTerm: string;
  onReset: () => void;
  onSearchChange: (value: string) => void;
}

export default function CategoriesFilters({
  hasActiveFilters,
  searchTerm,
  onReset,
  onSearchChange,
}: CategoriesFiltersProps) {
  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-categories-filters
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(260px,1fr)_auto] sm:items-end">
        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>البحث</span>
          <span className="relative">
            <input
              className="field pr-11"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث باسم الفئة"
              type="search"
              value={searchTerm}
              data-categories-search
            />
            <Search
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-noviq-muted"
              size={18}
              strokeWidth={1.8}
            />
          </span>
        </label>

        {hasActiveFilters ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-noviq-secondaryText transition hover:text-noviq-gold"
            onClick={onReset}
            type="button"
            data-categories-reset
          >
            <RotateCcw size={16} strokeWidth={1.8} />
            إعادة التعيين
          </button>
        ) : null}
      </div>
    </section>
  );
}
