import mongoose, { Types } from 'mongoose';
import { OrderModel } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { DEFAULT_STORE_SETTINGS } from '../config/storeSettings.js';
import { getStoreSettingsDocument } from './settingsController.js';
import type { Order, Product } from '../types/models.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeOrder } from '../utils/orderSerializer.js';
import { escapeRegex } from '../utils/slug.js';
import { ORDER_STATUSES } from '../types/models.js';
import type {
  AdminOrderListQuery,
  CreateOrderBody,
  UpdateOrderStatusBody,
} from '../validators/orderValidators.js';

const orderNotFoundMessage = 'Order not found';

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

export const createOrder = asyncHandler(async (request, response) => {
  const body = request.body as CreateOrderBody;
  const settings = await getStoreSettingsDocument();

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

      const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const shipping = 0;
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
        items: orderItems,
        paymentMethod: 'cash_on_delivery',
        shipping,
        subtotal,
        total: subtotal + shipping,
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
  const { limit, page, search, status } = request.query as unknown as AdminOrderListQuery;
  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { 'customer.name': regex },
      { 'customer.phone': regex },
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
  const order = await OrderModel.findById(id);

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
      const order = await OrderModel.findById(id).session(session);

      if (!order) {
        throw new AppError(orderNotFoundMessage, 404);
      }

      if (order.status === status) {
        updatedOrder = order;
        return;
      }

      const [newStatus, confirmedStatus, preparingStatus, completedStatus, cancelledStatus] =
        ORDER_STATUSES;

      if (order.status === cancelledStatus) {
        throw new AppError('Cancelled orders cannot be reopened', 409);
      }

      if (order.status === completedStatus) {
        throw new AppError('Completed orders cannot be changed', 409);
      }

      const allowedTransitions: Record<string, readonly string[]> = {
        [newStatus]: [confirmedStatus, cancelledStatus],
        [confirmedStatus]: [preparingStatus, cancelledStatus],
        [preparingStatus]: [completedStatus, cancelledStatus],
      };

      if (!allowedTransitions[order.status]?.includes(status)) {
        throw new AppError('Invalid order status transition', 409);
      }

      if (status === cancelledStatus) {
        for (const item of order.items) {
          await ProductModel.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }

        order.stockRestoredAt = new Date();
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
