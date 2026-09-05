import { useEffect, useState } from 'react';
import { getAdminDashboard } from '../services/analyticsApi';
import { formatCurrency } from '../utils/format';

interface DashboardData {
  kpis: { salesToday: number; ordersToday: number; pendingOrders: number; lowStockProducts: number; visitorsToday: number };
  recentOrders: Array<{ id: string; customerName: string; total: number; status: string }>;
  salesTrend: Array<{ label: string; value: number }>;
  topProducts: Array<{ id: string; name: string; unitsSold: number }>;
  lowStock: Array<{ id: string; name: string; stock: number }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then((value) => setData(value as DashboardData))
      .catch(() => setError('تعذر تحميل بيانات لوحة التحكم، يرجى المحاولة مرة أخرى.'));
  }, []);

  if (error) return <p className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold" role="alert">{error}</p>;
  if (!data) return <p className="rounded-md border border-dashed border-noviq-border bg-noviq-card p-6 text-center text-sm text-noviq-muted">جاري تحميل لوحة التحكم...</p>;

  const cards = [
    ['مبيعات اليوم', formatCurrency(data.kpis.salesToday)],
    ['طلبات اليوم', data.kpis.ordersToday],
    ['طلبات جديدة ومؤكدة', data.kpis.pendingOrders],
    ['مخزون منخفض', data.kpis.lowStockProducts],
    ['زوار اليوم', data.kpis.visitorsToday],
  ];

  return (
    <section className="grid min-w-0 gap-6" data-admin-dashboard>
      <div><p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p><h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">لوحة التحكم</h2><p className="mt-3 text-sm leading-7 text-noviq-secondaryText">نظرة سريعة على أداء متجر NOVIQ</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => <article className="rounded-md border border-noviq-border bg-noviq-card p-4" key={String(label)}><p className="text-sm text-noviq-secondaryText">{label}</p><p className="mt-3 text-2xl font-bold text-noviq-text">{value}</p></article>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">المبيعات آخر 7 أيام</h3><div className="mt-5 grid grid-cols-7 items-end gap-2" style={{ minHeight: 180 }}>{data.salesTrend.map((point) => <div className="grid gap-2 text-center" key={point.label}><div className="rounded-t bg-noviq-gold" style={{ height: `${Math.max(8, point.value / 100)}px` }} /><span className="text-[10px] text-noviq-muted">{point.label}</span></div>)}</div></section>
        <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">أحدث الطلبات</h3><div className="mt-4 grid gap-3">{data.recentOrders.map((order) => <div className="flex items-center justify-between gap-3 border-b border-noviq-border pb-2 text-sm" key={order.id}><span className="truncate text-noviq-secondaryText">{order.customerName} · {order.status}</span><strong className="text-noviq-gold">{formatCurrency(order.total)}</strong></div>)}</div></section>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">الأكثر مبيعاً</h3><div className="mt-4 grid gap-3">{data.topProducts.map((product) => <div className="flex items-center justify-between gap-3 border-b border-noviq-border pb-2 text-sm" key={product.id}><span className="truncate text-noviq-secondaryText">{product.name}</span><strong className="text-noviq-gold">{product.unitsSold} قطعة</strong></div>)}</div></section>
        <section className="rounded-md border border-noviq-border bg-noviq-card p-5"><h3 className="text-lg font-bold text-noviq-text">المخزون المنخفض</h3><div className="mt-4 grid gap-3">{data.lowStock.map((product) => <div className="flex items-center justify-between gap-3 border-b border-noviq-border pb-2 text-sm" key={product.id}><span className="truncate text-noviq-secondaryText">{product.name}</span><strong className="text-noviq-gold">{product.stock}</strong></div>)}</div></section>
      </div>
    </section>
  );
}
