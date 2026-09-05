import { AnalyticsEventModel } from '../models/AnalyticsEvent.js';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { businessDayStart, addBusinessDays } from '../config/businessTime.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AnalyticsTrackBody } from '../validators/analyticsValidators.js';
import { isRevenueStatus } from '../utils/metrics.js';

const objectIdPattern = /^[a-f\d]{24}$/i;

export const trackAnalyticsEvent = asyncHandler(async (request, response) => {
  const body = request.body as AnalyticsTrackBody;
  if (body.path.startsWith('/admin')) return sendSuccess(response, { tracked: false });
  await AnalyticsEventModel.create({
    anonymousVisitorId: body.anonymousVisitorId,
    eventType: body.eventType,
    path: body.path,
    sessionId: body.sessionId,
    ...(body.productId ? { productId: body.productId } : {}),
    ...(body.productSlug ? { productSlug: body.productSlug } : {}),
    ...(body.referrer ? { referrer: body.referrer } : {}),
    ...(body.source ? { source: body.source } : {}),
  });
  return sendSuccess(response, { tracked: true }, 'Analytics event tracked', 202);
});

export const getAdminAnalytics = asyncHandler(async (request, response) => {
  const end = request.query.end ? new Date(String(request.query.end)) : new Date();
  const start = request.query.start ? new Date(String(request.query.start)) : addBusinessDays(businessDayStart(end), -6);
  const events = await AnalyticsEventModel.find({ timestamp: { $gte: start, $lte: end } }).lean();
  // totalVisitors is intentionally all-time: distinct anonymous visitors across all page_view events (no date filter).
  const allVisitors = await AnalyticsEventModel.distinct('anonymousVisitorId', { eventType: 'page_view' });
  const sessions = new Set(events.filter((event) => event.eventType === 'session_start').map((event) => event.sessionId));
  const visitors = new Set(events.filter((event) => event.eventType === 'page_view').map((event) => event.anonymousVisitorId));
  const pages = new Map<string, number>();
  const productViews = new Map<string, number>();
  const productIdKeys = new Set<string>();
  const slugKeys = new Set<string>();
  const sources = new Map<string, number>();
  events.filter((event) => event.eventType === 'page_view').forEach((event) => pages.set(event.path, (pages.get(event.path) ?? 0) + 1));
  events.filter((event) => event.eventType === 'product_view').forEach((event) => {
    const productId = event.productId && objectIdPattern.test(event.productId) ? event.productId : undefined;
    const key = productId ?? event.productSlug;
    if (!key) return;
    if (productId) productIdKeys.add(productId);
    else if (event.productSlug) slugKeys.add(event.productSlug);
    productViews.set(key, (productViews.get(key) ?? 0) + 1);
  });
  events.forEach((event) => { const source = event.source ?? 'Direct'; sources.set(source, (sources.get(source) ?? 0) + 1); });
  const orders = await OrderModel.find({ createdAt: { $gte: start, $lte: end } });
  const conversionRate = sessions.size ? (orders.filter((order) => isRevenueStatus(order.status)).length / sessions.size) * 100 : 0;
  // One daily bucket per business day in the requested range; never include future days.
  const startDay = businessDayStart(start);
  const todayStart = businessDayStart();
  const endDay = businessDayStart(end) > todayStart ? todayStart : businessDayStart(end);
  const dayCount = Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)) + 1);
  const daily = Array.from({ length: dayCount }, (_, index) => {
    const day = addBusinessDays(startDay, index);
    const next = addBusinessDays(day, 1);
    return { label: day.toISOString().slice(5, 10), visitors: new Set(events.filter((event) => event.eventType === 'page_view' && event.timestamp && event.timestamp >= day && event.timestamp < next).map((event) => event.anonymousVisitorId)).size };
  });
  const [productDocsById, productDocsBySlug] = await Promise.all([
    ProductModel.find({ _id: { $in: Array.from(productIdKeys) } }).select('name slug primaryImage'),
    ProductModel.find({ slug: { $in: Array.from(slugKeys) } }).select('name slug primaryImage'),
  ]);
  const productNames = new Map<string, { name: string; image: string }>();
  productDocsById.forEach((product) => productNames.set(product.id, { name: product.name, image: product.primaryImage }));
  productDocsBySlug.forEach((product) => productNames.set(product.slug, { name: product.name, image: product.primaryImage }));
  return sendSuccess(response, { summary: { today: new Set(events.filter((event) => event.eventType === 'page_view' && event.timestamp && event.timestamp >= businessDayStart()).map((event) => event.anonymousVisitorId)).size, last7Days: visitors.size, totalVisitors: allVisitors.length, pageViews: events.filter((event) => event.eventType === 'page_view').length, conversionRate }, daily, pages: Array.from(pages, ([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8), products: Array.from(productViews, ([key, views]) => ({ slug: key, views, ...(productNames.get(key) ?? { name: 'منتج غير متاح', image: '' }) })).sort((a, b) => b.views - a.views).slice(0, 8), sources: Array.from(sources, ([source, views]) => ({ source, views })).sort((a, b) => b.views - a.views) }, 'Analytics fetched successfully');
});