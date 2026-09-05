import { Schema, Types, model } from 'mongoose';
import { createOrderNumberFromObjectId } from '../utils/orderNumber.js';
import { ORDER_STATUSES, PAYMENT_METHODS, type Order } from '../types/models.js';

const customerSchema = new Schema(
  {
    address: {
      required: true,
      trim: true,
      type: String,
    },
    name: {
      required: true,
      trim: true,
      type: String,
    },
    notes: {
      default: '',
      trim: true,
      type: String,
    },
    phone: {
      required: true,
      trim: true,
      type: String,
    },
    stockRestoredAt: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const orderItemSchema = new Schema(
  {
    image: {
      default: '',
      trim: true,
      type: String,
    },
    lineTotal: {
      min: [0, 'Line total must be greater than or equal to 0'],
      required: true,
      type: Number,
    },
    product: {
      ref: 'Product',
      required: true,
      type: Schema.Types.ObjectId,
    },
    productName: {
      required: true,
      trim: true,
      type: String,
    },
    productSlug: {
      trim: true,
      type: String,
    },
    quantity: {
      min: [1, 'Quantity must be greater than 0'],
      required: true,
      type: Number,
      validate: {
        message: 'Quantity must be a whole number',
        validator(value: number) {
          return Number.isInteger(value);
        },
      },
    },
    unitPrice: {
      min: [0, 'Unit price must be greater than or equal to 0'],
      required: true,
      type: Number,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new Schema<Order>(
  {
    customer: {
      required: true,
      type: customerSchema,
    },
    items: {
      required: true,
      type: [orderItemSchema],
      validate: {
        message: 'At least one order item is required',
        validator(items: Order['items']) {
          return items.length > 0;
        },
      },
    },
    orderNumber: {
      trim: true,
      type: String,
    },
    paymentMethod: {
      default: 'cash_on_delivery',
      enum: PAYMENT_METHODS,
      required: true,
      type: String,
    },
    shipping: {
      default: 0,
      min: [0, 'Shipping must be greater than or equal to 0'],
      required: true,
      type: Number,
    },
    status: {
      default: ORDER_STATUSES[0],
      enum: ORDER_STATUSES,
      required: true,
      type: String,
    },
    subtotal: {
      min: [0, 'Subtotal must be greater than or equal to 0'],
      required: true,
      type: Number,
    },
    total: {
      min: [0, 'Total must be greater than or equal to 0'],
      required: true,
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.pre('validate', function setOrderNumber() {
  if (!this.orderNumber && this._id instanceof Types.ObjectId) {
    this.orderNumber = createOrderNumberFromObjectId(this._id);
  }
});

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1, createdAt: -1 });

export const OrderModel = model<Order>('Order', orderSchema);
