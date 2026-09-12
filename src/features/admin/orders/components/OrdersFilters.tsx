import { CalendarDays, RotateCcw, Search } from 'lucide-react';
import type { ActiveOrderStatus } from '../../../../types/catalog';

export type OrderStatusFilter = 'all' | ActiveOrderStatus;

interface OrdersFiltersProps {
  searchTerm: string;
  statusFilter: OrderStatusFilter;
  selectedDate: string;
  selectedDateLabel: string;
  statuses: ActiveOrderStatus[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: OrderStatusFilter) => void;
  onDateChange: (value: string) => void;
  onReset: () => void;
}

export default function OrdersFilters({
  searchTerm,
  statusFilter,
  selectedDate,
  selectedDateLabel,
  statuses,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onDateChange,
  onReset,
}: OrdersFiltersProps) {
  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-orders-filters
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_220px_220px_auto] xl:items-end">
        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>البحث</span>
          <span className="relative">
            <input
              className="field pr-11"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف"
              type="search"
              value={searchTerm}
              data-orders-search
            />
            <Search
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-noviq-muted"
              size={18}
              strokeWidth={1.8}
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>الحالة</span>
          <select
            className="field"
            onChange={(event) => onStatusFilterChange(event.target.value as OrderStatusFilter)}
            value={statusFilter}
            data-orders-status-filter
          >
            <option value="all">جميع الحالات</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>التاريخ</span>
          <span className="relative">
            <input
              className="field pr-11"
              onChange={(event) => onDateChange(event.target.value)}
              required
              type="date"
              value={selectedDate}
              data-orders-date-filter
            />
            <CalendarDays
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-noviq-muted"
              size={18}
              strokeWidth={1.8}
            />
          </span>
          <span className="text-xs font-medium text-noviq-muted">{selectedDateLabel}</span>
        </label>

        {hasActiveFilters ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-transparent px-3 text-sm font-semibold text-noviq-secondaryText transition hover:text-noviq-gold"
            onClick={onReset}
            type="button"
            data-orders-reset
          >
            <RotateCcw size={16} strokeWidth={1.8} />
            إعادة التعيين
          </button>
        ) : null}
      </div>
    </section>
  );
}
