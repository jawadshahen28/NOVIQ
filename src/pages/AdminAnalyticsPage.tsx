import { useEffect, useState } from 'react';
import { getAdminAnalytics } from '../services/analyticsApi';

interface AnalyticsData {
  summary: { today: number; last7Days: number; totalVisitors: number; pageViews: number; conversionRate: number };
  daily: Array<{ label: string; visitors: number }>;
  pages: Array<{ path: string; views: number }>;
  products: Array<{ slug: string; name: string; image: string; views: number }>;
  sources: Array<{ source: string; views: number }>;
}

const labels: Record<string, string> = { '/': 'الرئيسية', '/cart': 'السلة', '/checkout': 'الدفع' };
function pageLabel(path: string) { return labels[path] ?? (path.startsWith('/product/') ? 'صفحة المنتج' : path.startsWith('/category/') ? 'صفحة الفئة' : path); }

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { getAdminAnalytics().then((value) => setData(value as AnalyticsData)).catch(() => setError('تعذر تحميل بيانات التحليلات، يرجى المحاولة مرة أخرى.')); }, []);
  if (error) return <p className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold" role="alert">{error}</p>;
  if (!data) return <p className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center text-sm text-noviq-muted">جاري تحميل التحليلات...</p>;
  const cards = [['زوار اليوم', data.summary.today], ['الزوار آخر 7 أيام', data.summary.last7Days], ['إجمالي الزوار', data.summary.totalVisitors], ['مشاهدات الصفحات', data.summary.pageViews], ['معدل التحويل', `${data.summary.conversionRate.toFixed(1)}%`]];
  return <section className="grid min-w-0 gap-6" data-admin-analytics-page>
    <div><p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p><h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">الزوار والتحليلات</h2><p className="mt-3 text-sm leading-7 text-noviq-secondaryText">قياس الزيارات والمشاهدة والتحويلات من المتجر</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value]) => <article className="rounded-md border border-noviq-border bg-noviq-card p-4" key={String(label)}><p className="text-sm text-noviq-secondaryText">{label}</p><p className="mt-3 text-2xl font-bold text-noviq-text">{value}</p></article>)}</div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">الزوار آخر 7 أيام</h3><div className="mt-5 grid grid-cols-7 items-end gap-2" style={{ minHeight: 180 }}>{data.daily.map((point) => <div className="grid gap-2 text-center" key={point.label}><div className="rounded-t bg-noviq-gold" style={{ height: `${Math.max(8, point.visitors * 18)}px` }} title={`${point.visitors} زائر`} /><span className="text-[10px] text-noviq-muted">{point.label}</span></div>)}</div></section>
      <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">مصادر الزيارات</h3><div className="mt-4 grid gap-3">{data.sources.length ? data.sources.map((source) => <div className="flex justify-between border-b border-noviq-border pb-2 text-sm" key={source.source}><span className="text-noviq-secondaryText">{source.source}</span><strong className="text-noviq-gold">{source.views}</strong></div>) : <p className="text-sm text-noviq-muted">لا توجد بيانات كافية بعد.</p>}</div></section>
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">أكثر الصفحات مشاهدة</h3><div className="mt-4 grid gap-3">{data.pages.map((page) => <div className="flex justify-between border-b border-noviq-border pb-2 text-sm" key={page.path}><span className="text-noviq-secondaryText">{pageLabel(page.path)}</span><strong className="text-noviq-gold">{page.views}</strong></div>)}</div></section>
      <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">أكثر المنتجات مشاهدة</h3><div className="mt-4 grid gap-3">{data.products.map((product) => <div className="flex items-center justify-between gap-3 border-b border-noviq-border pb-2 text-sm" key={product.slug}><span className="truncate text-noviq-secondaryText">{product.name}</span><strong className="text-noviq-gold">{product.views}</strong></div>)}</div></section>
    </div>
  </section>;
}
