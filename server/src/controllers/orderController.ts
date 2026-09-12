import mongoose, { Types } from 'mongoose';
import { businessDateRangeFromKey } from '../config/businessTime.js';
import { getDeliveryRegionConfig } from '../config/delivery.js';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { DEFAULT_STORE_SETTINGS } from '../config/storeSettings.js';
import { getStoreSettingsDocument } from './settingsController.js';
import type { Order, Product } from '../types/models.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeOrder } from '../utils/orderSerializer.js';
import {
  legacyCompletedStatus,
  shouldRestoreStockOnSoftDelete,
} from '../utils/metrics.js';
import { calculateOrderPricing } from '../utils/orderTotals.js';
import { escapeRegex } from '../utils/slug.js';
import { ACTIVE_ORDER_STATUSES } from '../types/models.js';
import type {
  AdminOrderListQuery,
  CreateOrderBody,
  UpdateOrderStatusBody,
} from '../validators/orderValidators.js';

const orderNotFoundMessage = 'Order not found';
const notDeletedOrderFilter = { deletedAt: null } as const;

interface NormalizedOrderItem {
  productId?: string | undefined;
  productSlug?: string | undefined;
  quantity: number;
}

function getItemKey(item: NormalizedOrderItem) {
  return item.productId ? `id:${item.productId}` : `slug:${item.productSlug}`;
}

function normalizeOrderItems(items: CreateOrderBody['items']) {
  const normalizedItems = new Map<string, NormalizedOrderItem>();

  items.forEach((item) => {
    const key = getItemKey(item);
    const current = normalizedItems.get(key);

    if (current) {
      current.quantity += item.quantity;
      return;
    }

    normalizedItems.set(key, { ...item });
  });

  return Array.from(normalizedItems.values());
}

function createProductLookup(item: NormalizedOrderItem) {
  if (item.productId) {
    return { _id: new Types.ObjectId(item.productId) };
  }

  if (!item.productSlug) {
    throw new AppError('Order item product reference is required', 400);
  }

  return { slug: item.productSlug };
}

function createOrderItem(product: Product & { _id: Types.ObjectId }, quantity: number) {
  const image = product.primaryImage || product.images[0] || '';
  const lineTotal = product.price * quantity;

  return {
    image,
    lineTotal,
    product: product._id,
    productName: product.name,
    productSlug: product.slug,
    quantity,
    unitPrice: product.price,
  };
}

function createLoosePhoneRegex(value: string) {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  return new RegExp(digits.split('').map(escapeRegex).join('\\D*'), 'i');
}

export const createOrder = asyncHandler(async (request, response) => {
  const body = request.body as CreateOrderBody;
  const settings = await getStoreSettingsDocument();
  const deliveryRegion = getDeliveryRegionConfig(body.deliveryRegion);

  if (!settings.ordersOpen) {
    const message = settings.closedMessage || DEFAULT_STORE_SETTINGS.closedMessage;
    throw new AppError(message, 409, [
      {
        code: 'orders_closed',
        message,
        path: 'ordersOpen',
      },
    ]);
  }

  const normalizedItems = normalizeOrderItems(body.items);
  const session = await mongoose.startSession();
  let createdOrder: mongoose.HydratedDocument<Order> | null = null;

  try {
    await session.withTransaction(async () => {
      const orderItems = [];

      for (const item of normalizedItems) {
        const productFilter: Record<string, unknown> = {
          ...createProductLookup(item),
          isActive: true,
        };
        const product = (await ProductModel.findOne(productFilter).session(session)) as
          | (Product & { _id: Types.ObjectId })
          | null;

        if (!product) {
          throw new AppError('One or more order products are unavailable', 400);
        }

        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 409);
        }

        orderItems.push(createOrderItem(product, item.quantity));
      }

      const pricing = calculateOrderPricing(orderItems, deliveryRegion.fee);
      const customer: Order['customer'] = {
        address: body.customer.address,
        name: body.customer.name,
        phone: body.customer.phone,
      };

      if (body.customer.notes !== undefined) {
        customer.notes = body.customer.notes;
      }

      const order = new OrderModel({
        customer,
        deliveryFee: pricing.deliveryFee,
        deliveryRegion: deliveryRegion.code,
        deliveryRegionLabel: deliveryRegion.label,
        items: orderItems,
        paymentMethod: 'cash_on_delivery',
        shipping: pricing.shipping,
        subtotal: pricing.subtotal,
        total: pricing.total,
      });

      await order.save({ session });

      for (const item of orderItems) {
        const updateResult = await ProductModel.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { session },
        );

        if (updateResult.modifiedCount !== 1) {
          throw new AppError(`Insufficient stock for ${item.productName}`, 409);
        }
      }

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  if (!createdOrder) {
    throw new AppError('Order could not be created', 500);
  }

  return sendSuccess(
    response,
    { order: serializeOrder(createdOrder) },
    'Order created successfully',
    201,
  );
});

export const listAdminOrders = asyncHandler(async (request, response) => {
  const { date, limit, page, search, status } = request.query as unknown as AdminOrderListQuery;
  const filter: Record<string, unknown> = { ...notDeletedOrderFilter };

  if (date) {
    const range = businessDateRangeFromKey(date);
    filter.createdAt = { $gte: range.start, $lt: range.end };
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    const phoneRegex = createLoosePhoneRegex(search);
    filter.$or = [
      { 'customer.name': regex },
      { 'customer.phone': regex },
      ...(phoneRegex ? [{ 'customer.phone': phoneRegex }] : []),
      { orderNumber: regex },
    ];
  }

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    OrderModel.countDocuments(filter),
  ]);

  return sendSuccess(
    response,
    {
      orders: orders.map((order) => serializeOrder(order)),
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    'Admin orders fetched successfully',
  );
});

export const getAdminOrder = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const order = await OrderModel.findOne({ _id: id, ...notDeletedOrderFilter });

  if (!order) {
    throw new AppError(orderNotFoundMessage, 404);
  }

  return sendSuccess(response, { order: serializeOrder(order) }, 'Order fetched successfully');
});

export const updateOrderStatus = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as UpdateOrderStatusBody;
  const session = await mongoose.startSession();
  let updatedOrder: mongoose.HydratedDocument<Order> | null = null;

  try {
    await session.withTransaction(async () => {
      const order = await OrderModel.findOne({ _id: id, ...notDeletedOrderFilter }).session(session);

      if (!order) {
        throw new AppError(orderNotFoundMessage, 404);
      }

      if (order.status === status) {
        updatedOrder = order;
        return;
      }

      const [newStatus, receivedStatus, preparingStatus, deliveredStatus] =
        ACTIVE_ORDER_STATUSES;

      if (order.status === deliveredStatus || order.status === legacyCompletedStatus) {
        throw new AppError('Completed orders cannot be changed', 409);
      }

      const allowedTransitions: Record<string, readonly string[]> = {
        [newStatus]: [receivedStatus],
        [receivedStatus]: [preparingStatus],
        [preparingStatus]: [deliveredStatus],
        ['\u062a\u0645 \u0627\u0644\u062a\u0623\u0643\u064a\u062f']: [receivedStatus, preparingStatus],
        ['\u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632']: [preparingStatus, deliveredStatus],
      };

      if (!allowedTransitions[order.status]?.includes(status)) {
        throw new AppError('Invalid order status transition', 409);
      }

      order.status = status;
      await order.save({ session });
      updatedOrder = order;
    });
  } finally {
    await session.endSession();
  }

  if (!updatedOrder) {
    throw new AppError('Order could not be updated', 500);
  }

  return sendSuccess(response, { order: serializeOrder(updatedOrder) }, 'Order status updated successfully');
});

export const deleteOrder = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const session = await mongoose.startSession();
  let deletedOrder: mongoose.HydratedDocument<Order> | null = null;

  try {
    await session.withTransaction(async () => {
      const order = await OrderModel.findOne({ _id: id, ...notDeletedOrderFilter }).session(session);

      if (!order) {
        throw new AppError(orderNotFoundMessage, 404);
      }

      if (shouldRestoreStockOnSoftDelete(order)) {
        for (const item of order.items) {
          await ProductModel.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }

        order.stockRestoredAt = new Date();
      }

      order.deletedAt = new Date();

      if (request.admin?.id && Types.ObjectId.isValid(request.admin.id)) {
        order.deletedBy = new Types.ObjectId(request.admin.id);
      }

      await order.save({ session });
      deletedOrder = order;
    });
  } finally {
    await session.endSession();
  }

  if (!deletedOrder) {
    throw new AppError('Order could not be deleted', 500);
  }

  return sendSuccess(response, { order: serializeOrder(deletedOrder) }, 'Order deleted successfully');
});
