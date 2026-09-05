import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  PackageCheck,
  PackageX,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import DashboardStatCard from '../features/admin/dashboard/components/DashboardStatCard';
import LowStockList from '../features/admin/dashboard/components/LowStockList';
import OrderMetricCard from '../features/admin/dashboard/components/OrderMetricCard';
import RecentOrders from '../features/admin/dashboard/components/RecentOrders';
import SalesChart from '../features/admin/dashboard/components/SalesChart';
import TopProducts from '../features/admin/dashboard/components/TopProducts';
import {
  dashboardKpis,
  lowStockProducts,
  orderMetrics,
  recentOrders,
  salesTrend,
  topSellingProducts,
} from '../features/admin/dashboard/dashboardData';

const kpiIcons = [Banknote, WalletCards, TrendingUp, CheckCircle2];
const metricIcons = [ReceiptText, ClipboardList, Clock3, PackageCheck, PackageX];

const arabicToday = new Intl.DateTimeFormat('ar-IL', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date());

export default function AdminDashboardPage() {
  return (
    <section className="grid min-w-0 gap-6" data-admin-dashboard>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            لوحة التحكم
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
            نظرة سريعة على أداء متجر NOVIQ
          </p>
        </div>

        <div
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-noviq-border bg-noviq-card px-4 text-sm font-semibold text-noviq-secondaryText sm:w-fit"
          data-dashboard-date
        >
          <CalendarDays size={18} strokeWidth={1.8} />
          <span>{arabicToday}</span>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-dashboard-kpi-grid>
        {dashboardKpis.map((kpi, index) => (
          <DashboardStatCard
            hint={kpi.hint}
            icon={kpiIcons[index]}
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
          />
        ))}
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5" data-dashboard-order-metrics>
        {orderMetrics.map((metric, index) => (
          <OrderMetricCard
            hint={metric.hint}
            icon={metricIcons[index]}
            key={metric.id}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <SalesChart points={salesTrend} />
        <RecentOrders orders={recentOrders} />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <TopProducts products={topSellingProducts} />
        <LowStockList products={lowStockProducts} />
      </div>
    </section>
  );
}
