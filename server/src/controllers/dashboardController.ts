import { AnalyticsEventModel } from '../models/AnalyticsEvent.js';
import { CategoryModel } from '../models/Category.js';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { businessDayStart, businessDateKey, addBusinessDays } from '../config/businessTime.js';
import { getDocumentReferenceId } from '../utils/documentReference.js';
import { LOW_STOCK_THRESHOLD } from '../utils/inventory.js';
import { isRevenueStatus } from '../utils/metrics.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAdminDashboard = asyncHandler(async (_request, response) => {
  const today = businessDayStart();
  const sevenDaysAgo = addBusinessDays(today, -6);
  const [orders, products, categories, todayVisitors] = await Promise.all([
    OrderModel.find({ createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }),
    ProductModel.find().populate('category'),
    CategoryModel.find(),
    AnalyticsEventModel.distinct('anonymousVisitorId', { eventType: 'page_view', timestamp: { $gte: today } }),
  ]);
  const allRecentOrders = await OrderModel.find().sort({ createdAt: -1 }).limit(5);
  const todayOrders = orders.filter((order) => order.createdAt && order.createdAt >= today);
  const revenueOrders = orders.filter((order) => isRevenueStatus(order.status));
  const productSales = new Map<string, { name: string; image: string; unitsSold: number; revenue: number }>();
  revenueOrders.forEach((order) => order.items.forEach((item) => {
    const key = item.product.toString();
    const entry = productSales.get(key) ?? { name: item.productName, image: item.image, unitsSold: 0, revenue: 0 };
    entry.unitsSold += item.quantity;
    entry.revenue += item.lineTotal;
    productSales.set(key, entry);
  }));
  const salesTrend = Array.from({ length: 7 }, (_, index) => {
    const date = addBusinessDays(sevenDaysAgo, index);
    const key = businessDateKey(date);
    const dayOrders = orders.filter((order) => order.createdAt && businessDateKey(order.createdAt) === key && isRevenueStatus(order.status));
    return { label: key.slice(5), value: dayOrders.reduce((sum, order) => sum + order.total, 0) };
  });
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const data = {
    kpis: {
      salesToday: todayOrders.filter((order) => isRevenueStatus(order.status)).reduce((sum, order) => sum + order.total, 0),
      ordersToday: todayOrders.length,
      pendingOrders: orders.filter((order) => order.status === 'جديد' || order.status === 'تم التأكيد').length,
      lowStockProducts: products.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD).length,
      visitorsToday: todayVisitors.length,
    },
    orderMetrics: ['جديد', 'تم التأكيد', 'قيد التجهيز', 'مكتمل', 'ملغي'].map((status) => ({ status, count: orders.filter((order) => order.status === status).length })),
    recentOrders: allRecentOrders.map((order) => ({ id: order.id, customerName: order.customer.name, itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0), total: order.total, status: order.status, createdAt: order.createdAt })),
    salesTrend,
    topProducts: Array.from(productSales.entries()).sort((a, b) => b[1].unitsSold - a[1].unitsSold).slice(0, 5).map(([id, item]) => ({ id, ...item, categoryName: categoryNames.get(getDocumentReferenceId(products.find((product) => product.id === id)?.category)) ?? 'غير مصنف' })),
    lowStock: products.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD).sort((a, b) => a.stock - b.stock).slice(0, 8).map((product) => ({ id: product.id, name: product.name, image: product.primaryImage || product.images[0], stock: product.stock, categoryName: categoryNames.get(getDocumentReferenceId(product.category)) ?? 'غير مصنف' })),
  };
  return sendSuccess(response, data, 'Dashboard fetched successfully');
});
