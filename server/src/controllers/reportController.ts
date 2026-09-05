import { CategoryModel } from '../models/Category.js';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { ORDER_STATUSES, type Order } from '../types/models.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AdminReportQuery } from '../validators/reportValidators.js';

function getRangeStart(range: AdminReportQuery['range']) {
  if (range === 'all') {
    return null;
  }

  const days = Number(range.replace('d', ''));
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return start;
}

function isRevenueOrder(order: Order) {
  return order.status !== '\u0645\u0644\u063a\u064a';
}

function getStatusSummary(orders: Order[]) {
  const total = Math.max(orders.length, 1);

  return ORDER_STATUSES.map((status) => {
    const count = orders.filter((order) => order.status === status).length;

    return {
      count,
      percentage: Math.round((count / total) * 100),
      status,
    };
  });
}

export const getAdminReportSummary = asyncHandler(async (request, response) => {
  const { range } = request.query as AdminReportQuery;
  const rangeStart = getRangeStart(range);
  const orderFilter = rangeStart ? { createdAt: { $gte: rangeStart } } : {};
  const [orders, products, categories] = await Promise.all([
    OrderModel.find(orderFilter),
    ProductModel.find({}).populate('category'),
    CategoryModel.find({}),
  ]);
  const productMap = new Map(products.map((product) => [product.id, product]));
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const revenueOrders = orders.filter(isRevenueOrder);
  const revenue = revenueOrders.reduce((sum, order) => sum + order.total, 0);
  const profit = revenueOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((itemSum, item) => {
        const product = productMap.get(item.product.toString());
        const costPrice = product?.costPrice ?? 0;
        return itemSum + Math.max(item.unitPrice - costPrice, 0) * item.quantity;
      }, 0),
    0,
  );
  const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= 3).length;
  const outOfStockProducts = products.filter((product) => product.stock === 0).length;
  const productSales = new Map<
    string,
    {
      id: string;
      name: string;
      quantity: number;
      revenue: number;
    }
  >();
  const categorySales = new Map<
    string,
    {
      id: string;
      name: string;
      quantity: number;
      revenue: number;
    }
  >();

  revenueOrders.forEach((order) => {
    order.items.forEach((item) => {
      const productId = item.product.toString();
      const product = productMap.get(productId);
      const productEntry = productSales.get(productId) ?? {
        id: productId,
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };

      productEntry.quantity += item.quantity;
      productEntry.revenue += item.lineTotal;
      productSales.set(productId, productEntry);

      if (product) {
        const categoryId = product.category.toString();
        const category = categoryMap.get(categoryId);
        const categoryEntry = categorySales.get(categoryId) ?? {
          id: categoryId,
          name: category?.name ?? categoryId,
          quantity: 0,
          revenue: 0,
        };

        categoryEntry.quantity += item.quantity;
        categoryEntry.revenue += item.lineTotal;
        categorySales.set(categoryId, categoryEntry);
      }
    });
  });

  return sendSuccess(
    response,
    {
      report: {
        categoryPerformance: Array.from(categorySales.values()).sort((a, b) => b.revenue - a.revenue),
        generatedAt: new Date().toISOString(),
        orderStatus: getStatusSummary(orders),
        range,
        topProducts: Array.from(productSales.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
        totals: {
          activeProducts: products.filter((product) => product.isActive).length,
          averageOrderValue: revenueOrders.length > 0 ? Math.round(revenue / revenueOrders.length) : 0,
          lowStockProducts,
          orders: orders.length,
          outOfStockProducts,
          profit,
          revenue,
        },
      },
    },
    'Admin report fetched successfully',
  );
});
