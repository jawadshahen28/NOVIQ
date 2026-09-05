import { orderStatuses } from '../../../data/orders';
import type { AdminOrder, Category, OrderStatus, Product } from '../../../types/catalog';
import { formatCurrency } from '../../../utils/format';

export type ReportRange = 'today' | 'last7' | 'month' | 'year';

export interface ReportRangeOption {
  value: ReportRange;
  label: string;
}

export interface ReportKpi {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface ReportTrendPoint {
  id: string;
  label: string;
  revenue: number;
  profit: number;
  formattedRevenue: string;
  formattedProfit: string;
  orderCount: number;
}

export interface ReportStatusItem {
  status: OrderStatus;
  count: number;
  percent: number;
}

export interface ReportProductPerformance {
  id: string;
  name: string;
  image: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  profit: number;
}

export interface ReportCategoryPerformance {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  percent: number;
}

export interface ReportPeriodSummary {
  id: string;
  label: string;
  orderCount: number;
  revenue: number;
  profit: number;
}

export interface ReportSnapshot {
  kpis: ReportKpi[];
  trend: ReportTrendPoint[];
  statusSummary: ReportStatusItem[];
  topProducts: ReportProductPerformance[];
  categoryPerformance: ReportCategoryPerformance[];
  periodSummaries: ReportPeriodSummary[];
}

interface DateWindow {
  start: Date;
  end: Date;
}

interface TrendBucket extends DateWindow {
  id: string;
  label: string;
}

export const reportRangeOptions: ReportRangeOption[] = [
  { value: 'today', label: 'اليوم' },
  { value: 'last7', label: 'آخر 7 أيام' },
  { value: 'month', label: 'هذا الشهر' },
  { value: 'year', label: 'هذا العام' },
];

const canceledStatus = orderStatuses[4];
const dayInMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getAnchorDate(orders: AdminOrder[]) {
  const latestOrderTime = Math.max(...orders.map((order) => new Date(order.createdAt).getTime()));

  return new Date(Number.isFinite(latestOrderTime) ? latestOrderTime : Date.now());
}

function getRangeWindow(range: ReportRange, anchorDate: Date): DateWindow {
  const anchorDay = startOfDay(anchorDate);

  if (range === 'today') {
    return {
      start: anchorDay,
      end: endOfDay(anchorDate),
    };
  }

  if (range === 'last7') {
    return {
      start: startOfDay(new Date(anchorDay.getTime() - dayInMs * 6)),
      end: endOfDay(anchorDate),
    };
  }

  if (range === 'month') {
    return {
      start: new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1),
      end: endOfDay(anchorDate),
    };
  }

  return {
    start: new Date(anchorDate.getFullYear(), 0, 1),
    end: endOfDay(anchorDate),
  };
}

function getShortDayLabel(date: Date) {
  return new Intl.DateTimeFormat('ar-IL', { weekday: 'short' }).format(date);
}

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('ar-IL', { month: 'short' }).format(date);
}

function createTodayBuckets(anchorDate: Date): TrendBucket[] {
  return [0, 6, 12, 18].map((hour) => ({
    id: `hour-${hour}`,
    label: `${String(hour).padStart(2, '0')}:00`,
    start: new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate(), hour),
    end: new Date(
      anchorDate.getFullYear(),
      anchorDate.getMonth(),
      anchorDate.getDate(),
      Math.min(hour + 5, 23),
      59,
      59,
      999,
    ),
  }));
}

function createDailyBuckets(window: DateWindow, range: ReportRange): TrendBucket[] {
  const buckets: TrendBucket[] = [];
  let current = startOfDay(window.start);

  while (current <= window.end) {
    const bucketStart = startOfDay(current);
    const label =
      range === 'month'
        ? new Intl.DateTimeFormat('ar-IL', { day: '2-digit', month: 'short' }).format(bucketStart)
        : getShortDayLabel(bucketStart);

    buckets.push({
      id: bucketStart.toISOString(),
      label,
      start: bucketStart,
      end: endOfDay(bucketStart),
    });
    current = new Date(bucketStart.getTime() + dayInMs);
  }

  return buckets;
}

function createYearBuckets(anchorDate: Date): TrendBucket[] {
  return Array.from({ length: anchorDate.getMonth() + 1 }, (_, monthIndex) => {
    const start = new Date(anchorDate.getFullYear(), monthIndex, 1);
    const end = new Date(anchorDate.getFullYear(), monthIndex + 1, 0, 23, 59, 59, 999);

    return {
      id: `month-${monthIndex}`,
      label: getMonthLabel(start),
      start,
      end,
    };
  });
}

function createTrendBuckets(range: ReportRange, window: DateWindow, anchorDate: Date) {
  if (range === 'today') {
    return createTodayBuckets(anchorDate);
  }

  if (range === 'year') {
    return createYearBuckets(anchorDate);
  }

  return createDailyBuckets(window, range);
}

function isInWindow(order: AdminOrder, window: DateWindow) {
  const createdAt = new Date(order.createdAt);

  return createdAt >= window.start && createdAt <= window.end;
}

function isRevenueOrder(order: AdminOrder) {
  return order.status !== canceledStatus;
}

function getProductCost(productById: Map<string, Product>, productId: string) {
  return productById.get(productId)?.costPrice ?? 0;
}

function getOrderProfit(order: AdminOrder, productById: Map<string, Product>) {
  if (!isRevenueOrder(order)) {
    return 0;
  }

  return order.items.reduce(
    (sum, item) => sum + (item.unitPrice - getProductCost(productById, item.productId)) * item.quantity,
    0,
  );
}

function getOrderRevenue(order: AdminOrder) {
  return isRevenueOrder(order) ? order.total : 0;
}

function getOrdersForBucket(orders: AdminOrder[], bucket: TrendBucket) {
  return orders.filter((order) => isInWindow(order, bucket));
}

function createCategoryNameMap(categories: Category[]) {
  return new Map(categories.map((category) => [category.slug, category.name]));
}

function getCategoryName(categoryBySlug: Map<string, string>, product?: Product) {
  if (!product) {
    return 'غير مصنف';
  }

  return categoryBySlug.get(product.category) ?? product.category;
}

function createTopProducts(
  orders: AdminOrder[],
  products: Product[],
  categories: Category[],
): ReportProductPerformance[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const categoryBySlug = createCategoryNameMap(categories);
  const productPerformance = new Map<string, ReportProductPerformance>();

  orders.filter(isRevenueOrder).forEach((order) => {
    order.items.forEach((item) => {
      const product = productById.get(item.productId);
      const current = productPerformance.get(item.productId) ?? {
        id: item.productId,
        name: product?.name ?? item.name,
        image: product?.images[0] ?? item.image,
        categoryName: getCategoryName(categoryBySlug, product),
        unitsSold: 0,
        revenue: 0,
        profit: 0,
      };

      current.unitsSold += item.quantity;
      current.revenue += item.lineTotal;
      current.profit += (item.unitPrice - getProductCost(productById, item.productId)) * item.quantity;
      productPerformance.set(item.productId, current);
    });
  });

  return Array.from(productPerformance.values())
    .sort((first, second) => second.unitsSold - first.unitsSold || second.revenue - first.revenue)
    .slice(0, 5);
}

function createCategoryPerformance(
  orders: AdminOrder[],
  products: Product[],
  categories: Category[],
): ReportCategoryPerformance[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const categoryPerformance = new Map(
    categories.map((category) => [
      category.slug,
      {
        id: category.slug,
        name: category.name,
        unitsSold: 0,
        revenue: 0,
        percent: 0,
      },
    ]),
  );

  orders.filter(isRevenueOrder).forEach((order) => {
    order.items.forEach((item) => {
      const product = productById.get(item.productId);
      const categorySlug = product?.category ?? 'uncategorized';
      const current = categoryPerformance.get(categorySlug) ?? {
        id: categorySlug,
        name: product?.category ?? 'غير مصنف',
        unitsSold: 0,
        revenue: 0,
        percent: 0,
      };

      current.unitsSold += item.quantity;
      current.revenue += item.lineTotal;
      categoryPerformance.set(categorySlug, current);
    });
  });

  const rows = Array.from(categoryPerformance.values()).sort(
    (first, second) => second.revenue - first.revenue || second.unitsSold - first.unitsSold,
  );
  const maxRevenue = Math.max(...rows.map((item) => item.revenue), 1);

  return rows.map((item) => ({
    ...item,
    percent: Math.round((item.revenue / maxRevenue) * 100),
  }));
}

function createStatusSummary(orders: AdminOrder[]): ReportStatusItem[] {
  const countsByStatus = new Map<OrderStatus, number>(orderStatuses.map((status) => [status, 0]));

  orders.forEach((order) => {
    countsByStatus.set(order.status, (countsByStatus.get(order.status) ?? 0) + 1);
  });

  const totalOrders = Math.max(orders.length, 1);

  return orderStatuses.map((status) => ({
    status,
    count: countsByStatus.get(status) ?? 0,
    percent: Math.round(((countsByStatus.get(status) ?? 0) / totalOrders) * 100),
  }));
}

export function createReportSnapshot(
  range: ReportRange,
  orders: AdminOrder[],
  products: Product[],
  categories: Category[],
): ReportSnapshot {
  const productById = new Map(products.map((product) => [product.id, product]));
  const anchorDate = getAnchorDate(orders);
  const window = getRangeWindow(range, anchorDate);
  const periodOrders = orders.filter((order) => isInWindow(order, window));
  const revenueOrders = periodOrders.filter(isRevenueOrder);
  const totalSales = revenueOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
  const totalProfit = periodOrders.reduce((sum, order) => sum + getOrderProfit(order, productById), 0);
  const averageOrderValue = revenueOrders.length > 0 ? totalSales / revenueOrders.length : 0;
  const buckets = createTrendBuckets(range, window, anchorDate);
  const trend = buckets.map((bucket) => {
    const bucketOrders = getOrdersForBucket(periodOrders, bucket);
    const revenue = bucketOrders.reduce((sum, order) => sum + getOrderRevenue(order), 0);
    const profit = bucketOrders.reduce((sum, order) => sum + getOrderProfit(order, productById), 0);

    return {
      id: bucket.id,
      label: bucket.label,
      revenue,
      profit,
      formattedRevenue: formatCurrency(revenue),
      formattedProfit: formatCurrency(profit),
      orderCount: bucketOrders.length,
    };
  });

  return {
    kpis: [
      {
        id: 'sales',
        label: 'إجمالي المبيعات',
        value: formatCurrency(totalSales),
        hint: `${revenueOrders.length} طلب محتسب في الإيراد`,
      },
      {
        id: 'profit',
        label: 'صافي الربح',
        value: formatCurrency(totalProfit),
        hint: 'بعد تكلفة المنتجات التقديرية',
      },
      {
        id: 'orders',
        label: 'عدد الطلبات',
        value: String(periodOrders.length),
        hint: 'يشمل جميع حالات الطلبات',
      },
      {
        id: 'average',
        label: 'متوسط قيمة الطلب',
        value: formatCurrency(averageOrderValue),
        hint: 'للطلبات غير الملغاة',
      },
    ],
    trend,
    statusSummary: createStatusSummary(periodOrders),
    topProducts: createTopProducts(periodOrders, products, categories),
    categoryPerformance: createCategoryPerformance(periodOrders, products, categories),
    periodSummaries: trend.map((point) => ({
      id: point.id,
      label: point.label,
      orderCount: point.orderCount,
      revenue: point.revenue,
      profit: point.profit,
    })),
  };
}
