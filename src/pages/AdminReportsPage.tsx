import { useMemo, useState } from 'react';
import { orders } from '../data/orders';
import { useAdminCatalog } from '../features/admin/catalog/AdminCatalogContext';
import CategoryPerformance from '../features/admin/reports/components/CategoryPerformance';
import OrderStatusSummary from '../features/admin/reports/components/OrderStatusSummary';
import ReportKpiGrid from '../features/admin/reports/components/ReportKpiGrid';
import ReportSummaryTable from '../features/admin/reports/components/ReportSummaryTable';
import ReportsRangeFilter from '../features/admin/reports/components/ReportsRangeFilter';
import ReportsTopProducts from '../features/admin/reports/components/ReportsTopProducts';
import SalesProfitChart from '../features/admin/reports/components/SalesProfitChart';
import {
  createReportSnapshot,
  type ReportRange,
} from '../features/admin/reports/reportAdminUtils';

export default function AdminReportsPage() {
  const { categories, products } = useAdminCatalog();
  const [range, setRange] = useState<ReportRange>('last7');
  const report = useMemo(
    () => createReportSnapshot(range, orders, products, categories),
    [categories, products, range],
  );

  return (
    <section className="grid min-w-0 gap-6" data-admin-reports-page>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            التقارير
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
            تحليل المبيعات والأرباح وأداء متجر NOVIQ
          </p>
        </div>
      </div>

      <ReportsRangeFilter range={range} onRangeChange={setRange} />

      <ReportKpiGrid kpis={report.kpis} />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <SalesProfitChart points={report.trend} />
        <OrderStatusSummary items={report.statusSummary} />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <ReportsTopProducts products={report.topProducts} />
        <CategoryPerformance categories={report.categoryPerformance} />
      </div>

      <ReportSummaryTable rows={report.periodSummaries} />
    </section>
  );
}
