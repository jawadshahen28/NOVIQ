import MetricBar from '../../components/MetricBar';
import type { ReportCategoryPerformance } from '../reportAdminUtils';
import { formatCurrency } from '../../../../utils/format';

interface CategoryPerformanceProps {
  categories: ReportCategoryPerformance[];
}

export default function CategoryPerformance({ categories }: CategoryPerformanceProps) {
  return (
    <section
      className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-report-category-performance
    >
      <div className="mb-5 border-b border-noviq-border pb-4">
        <p className="text-xs font-semibold text-noviq-gold">الفئات</p>
        <h3 className="mt-2 text-lg font-bold text-noviq-text">أداء الفئات</h3>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div className="grid gap-2" data-report-category-row={category.id} key={category.id}>
            <MetricBar
              label={category.name}
              percent={category.percent}
              value={formatCurrency(category.revenue)}
            />
            <p className="text-xs font-semibold text-noviq-muted">{category.unitsSold} قطعة مباعة</p>
          </div>
        ))}
      </div>
    </section>
  );
}
