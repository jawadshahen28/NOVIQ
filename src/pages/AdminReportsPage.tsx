import { useEffect, useState } from 'react';
import { getAdminReports } from '../services/analyticsApi';
import { formatCurrency } from '../utils/format';

type Report = {
  totals: { revenue: number; orders: number; averageOrderValue: number; profit: number };
  orderStatus: Array<{ status: string; count: number }>;
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>;
};

export default function AdminReportsPage() {
  const [range, setRange] = useState('30d');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setReport(null);
    getAdminReports(range)
      .then((value) => setReport((value as { report: Report }).report))
      .catch(() => setError('تعذر تحميل التقرير، يرجى المحاولة مرة أخرى.'));
  }, [range]);

  if (error) return <p className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold" role="alert">{error}</p>;
  if (!report) return <p className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center text-sm text-noviq-muted">جاري تحميل التقرير...</p>;

  const cards = [
    ['إجمالي المبيعات', formatCurrency(report.totals.revenue)],
    ['إجمالي الطلبات', report.totals.orders],
    ['متوسط الطلب', formatCurrency(report.totals.averageOrderValue)],
    ['الربح التقديري', formatCurrency(report.totals.profit)],
  ];

  return (
    <section className="grid min-w-0 gap-6" data-admin-reports-page>
      <div><p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p><h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">التقارير</h2><p className="mt-3 text-sm leading-7 text-noviq-secondaryText">تقارير المبيعات والطلبات من MongoDB</p></div>
      <label className="grid max-w-xs gap-2 text-sm font-semibold text-noviq-secondaryText"><span>الفترة</span><select className="field" value={range} onChange={(event) => setRange(event.target.value)}><option value="7d">آخر 7 أيام</option><option value="30d">آخر 30 يوماً</option><option value="90d">آخر 90 يوماً</option><option value="all">كل الفترة</option></select></label>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article className="rounded-md border border-noviq-border bg-noviq-card p-4" key={String(label)}><p className="text-sm text-noviq-secondaryText">{label}</p><p className="mt-3 text-2xl font-bold text-noviq-text">{value}</p></article>)}</div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">حالات الطلبات</h3><div className="mt-4 grid gap-3">{report.orderStatus.map((item) => <div className="flex justify-between border-b border-noviq-border pb-2 text-sm" key={item.status}><span className="text-noviq-secondaryText">{item.status}</span><strong className="text-noviq-gold">{item.count}</strong></div>)}</div></section>
        <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">الأكثر مبيعاً</h3><div className="mt-4 grid gap-3">{report.topProducts.map((item) => <div className="flex justify-between gap-3 border-b border-noviq-border pb-2 text-sm" key={item.id}><span className="truncate text-noviq-secondaryText">{item.name}</span><strong className="text-noviq-gold">{item.quantity} · {formatCurrency(item.revenue)}</strong></div>)}</div></section>
      </div>
    </section>
  );
}
