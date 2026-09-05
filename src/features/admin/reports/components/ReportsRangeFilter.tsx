import { CalendarDays } from 'lucide-react';
import {
  reportRangeOptions,
  type ReportRange,
} from '../reportAdminUtils';

interface ReportsRangeFilterProps {
  range: ReportRange;
  onRangeChange: (range: ReportRange) => void;
}

export default function ReportsRangeFilter({
  range,
  onRangeChange,
}: ReportsRangeFilterProps) {
  return (
    <section
      className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-3 sm:p-4"
      data-reports-filters
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-noviq-secondaryText">
          <CalendarDays className="shrink-0 text-noviq-gold" size={18} strokeWidth={1.8} />
          <span>الفترة</span>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end" data-reports-range-filter>
          {reportRangeOptions.map((option) => {
            const isActive = option.value === range;

            return (
              <button
                aria-pressed={isActive}
                className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  isActive
                    ? 'border-noviq-gold bg-noviq-gold text-noviq-black'
                    : 'border-noviq-border text-noviq-secondaryText hover:border-noviq-gold hover:text-noviq-gold'
                }`}
                data-report-range-option={option.value}
                key={option.value}
                onClick={() => onRangeChange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
