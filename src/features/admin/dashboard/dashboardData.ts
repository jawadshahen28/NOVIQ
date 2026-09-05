import { categories } from '../../../data/categories';
import { orders } from '../../../data/orders';
import { products } from '../../../data/products';
import type { AdminOrder, Product } from '../../../types/catalog';
import { formatCurrency, getDiscountedPrice } from '../../../utils/format';

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface DashboardOrderMetric {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface SalesTrendPoint {
  label: string;
  value: number;
  formattedValue: string;
}

export interface DashboardRecentOrder {
  id: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: AdminOrder['status'];
  createdAt: string;
}

export interface DashboardProductSale {
  product: Product;
  categoryName: string;
  unitsSold: number;
  revenue: number;
}

export interface DashboardLowStockProduct {
  product: Product;
  categoryName: string;
  stock: number;
  threshold: number;
  warning: string;
}

const categoryNameBySlug = new Map(categories.map((category) => [category.slug, category.name]));

const topSellingProductInputs = [
  { productId: 'prd-curren-001', unitsSold: 19 },
  { productId: 'prd-boss-001', unitsSold: 16 },
  { productId: 'prd-boss-002', unitsSold: 14 },
  { productId: 'prd-rolex-001', unitsSold: 3 },
  { productId: 'prd-rolex-003', unitsSold: 2 },
];

function getProductById(productId: string) {
  const product = products.find((item) => item.id === productId);

  if (!product) {
    throw new Error(`Missing dashboard product: ${productId}`);
  }

  return product;
}

function getCategoryName(product: Product) {
  return categoryNameBySlug.get(product.category) ?? product.category;
}

export const dashboardKpis: DashboardKpi[] = [
  {
    id: 'today-sales',
    label: 'مبيعات اليوم',
    value: formatCurrency(6450),
    hint: 'من 4 طلبات مكتملة أو مؤكدة',
  },
  {
    id: 'month-sales',
    label: 'مبيعات الشهر',
    value: formatCurrency(48620),
    hint: 'إجمالي سبتمبر حتى الآن',
  },
  {
    id: 'year-sales',
    label: 'مبيعات السنة',
    value: formatCurrency(318400),
    hint: 'مبيعات 2026 التجريبية',
  },
  {
    id: 'net-profit',
    label: 'صافي الربح',
    value: formatCurrency(71280),
    hint: 'بعد تكلفة المنتجات التقديرية',
  },
];

export const orderMetrics: DashboardOrderMetric[] = [
  {
    id: 'today-orders',
    label: 'طلبات اليوم',
    value: '4',
    hint: 'طلبات جديدة ومؤكدة',
  },
  {
    id: 'new-orders',
    label: 'الطلبات الجديدة',
    value: '6',
    hint: 'بانتظار المراجعة',
  },
  {
    id: 'processing-orders',
    label: 'قيد التجهيز',
    value: '5',
    hint: 'قيد التحضير للشحن',
  },
  {
    id: 'completed-orders',
    label: 'الطلبات المكتملة',
    value: '42',
    hint: 'خلال هذا الشهر',
  },
  {
    id: 'canceled-orders',
    label: 'الطلبات الملغاة',
    value: '2',
    hint: 'نسبة إلغاء منخفضة',
  },
];

export const salesTrend: SalesTrendPoint[] = [
  { label: 'الجمعة', value: 3200, formattedValue: formatCurrency(3200) },
  { label: 'السبت', value: 4800, formattedValue: formatCurrency(4800) },
  { label: 'الأحد', value: 2600, formattedValue: formatCurrency(2600) },
  { label: 'الاثنين', value: 7200, formattedValue: formatCurrency(7200) },
  { label: 'الثلاثاء', value: 5400, formattedValue: formatCurrency(5400) },
  { label: 'الأربعاء', value: 3900, formattedValue: formatCurrency(3900) },
  { label: 'الخميس', value: 6450, formattedValue: formatCurrency(6450) },
];

export const recentOrders: DashboardRecentOrder[] = orders.slice(0, 5).map((order) => ({
  id: order.id,
  customerName: order.customerName,
  itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  total: order.total,
  status: order.status,
  createdAt: order.createdAt,
}));

export const topSellingProducts: DashboardProductSale[] = topSellingProductInputs.map((item) => {
  const product = getProductById(item.productId);

  return {
    product,
    categoryName: getCategoryName(product),
    unitsSold: item.unitsSold,
    revenue: getDiscountedPrice(product) * item.unitsSold,
  };
});

export const lowStockProducts: DashboardLowStockProduct[] = products
  .filter((product) => product.stock <= 4)
  .sort((first, second) => first.stock - second.stock)
  .map((product) => ({
    product,
    categoryName: getCategoryName(product),
    stock: product.stock,
    threshold: 5,
    warning:
      product.stock <= 0
        ? 'نفدت الكمية'
        : product.stock <= 2
          ? 'تنبيه عاجل'
          : 'قريب من النفاد',
  }));
