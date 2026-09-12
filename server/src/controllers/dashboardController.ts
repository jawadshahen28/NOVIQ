import { AnalyticsEventModel } from '../models/AnalyticsEvent.js';
import { CategoryModel } from '../models/Category.js';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { addBusinessDays, businessDateKey, businessDayStart } from '../config/businessTime.js';
import { getDocumentReferenceId } from '../utils/documentReference.js';
import { LOW_STOCK_THRESHOLD } from '../utils/inventory.js';
import { isActivePendingStatus, isRevenueStatus } from '../utils/metrics.js';
import { getOrderSubtotal, getOrderTotal } from '../utils/orderTotals.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ACTIVE_ORDER_STATUSES } from '../types/models.js';

export const getAdminDashboard = asyncHandler(async (_request, response) => {
  const today = businessDayStart();
  const tomorrow = addBusinessDays(today, 1);
  const sevenDaysAgo = addBusinessDays(today, -6);
  const [orders, products, categories, todayVisitors] = await Promise.all([
    OrderModel.find({ deletedAt: null, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 }),
    ProductModel.find().populate('category'),
    CategoryModel.find(),
    AnalyticsEventModel.distinct('anonymousVisitorId', {
      eventType: 'page_view',
      timestamp: { $gte: today, $lt: tomorrow },
    }),
  ]);
  const allRecentOrders = await OrderModel.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(5);
  const todayOrders = orders.filter(
    (order) => order.createdAt && order.createdAt >= today && order.createdAt < tomorrow,
  );
  const revenueOrders = orders.filter((order) => isRevenueStatus(order.status));
  const productSales = new Map<string, { name: string; image: string; unitsSold: number; revenue: number }>();

  revenueOrders.forEach((order) => order.items.forEach((item) => {
    const key = item.product.toString();
    const entry = productSales.get(key) ?? {
      image: item.image,
      name: item.productName,
      revenue: 0,
      unitsSold: 0,
    };
    entry.unitsSold += item.quantity;
    entry.revenue += item.lineTotal;
    productSales.set(key, entry);
  }));

  const salesTrend = Array.from({ length: 7 }, (_, index) => {
    const date = addBusinessDays(sevenDaysAgo, index);
    const nextDate = addBusinessDays(date, 1);
    const key = businessDateKey(date);
    const dayOrders = orders.filter(
      (order) =>
        order.createdAt &&
        order.createdAt >= date &&
        order.createdAt < nextDate &&
        isRevenueStatus(order.status),
    );

    return {
      label: key.slice(5),
      value: dayOrders.reduce((sum, order) => sum + getOrderSubtotal(order), 0),
    };
  });
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const data = {
    kpis: {
      lowStockProducts: products.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD).length,
      ordersToday: todayOrders.length,
      pendingOrders: orders.filter((order) => isActivePendingStatus(order.status)).length,
      salesToday: todayOrders
        .filter((order) => isRevenueStatus(order.status))
        .reduce((sum, order) => sum + getOrderSubtotal(order), 0),
      visitorsToday: todayVisitors.length,
    },
    lowStock: products
      .filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8)
      .map((product) => ({
        categoryName: categoryNames.get(getDocumentReferenceId(product.category)) ?? 'غير مصنف',
        id: product.id,
        image: product.primaryImage || product.images[0],
        name: product.name,
        stock: product.stock,
      })),
    orderMetrics: ACTIVE_ORDER_STATUSES.map((status) => ({
      count: orders.filter((order) => order.status === status).length,
      status,
    })),
    recentOrders: allRecentOrders.map((order) => ({
      createdAt: order.createdAt,
      customerName: order.customer.name,
      id: order.id,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      status: order.status,
      total: getOrderTotal(order),
    })),
    salesTrend,
    topProducts: Array.from(productSales.entries())
      .sort((a, b) => b[1].unitsSold - a[1].unitsSold)
      .slice(0, 5)
      .map(([id, item]) => ({
        categoryName: categoryNames.get(getDocumentReferenceId(products.find((product) => product.id === id)?.category)) ?? 'غير مصنف',
        id,
        ...item,
      })),
  };

  return sendSuccess(response, data, 'Dashboard fetched successfully');
});
