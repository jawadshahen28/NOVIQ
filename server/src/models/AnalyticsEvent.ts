import { Schema, model } from 'mongoose';

const analyticsEventSchema = new Schema(
  {
    anonymousVisitorId: { required: true, trim: true, type: String },
    eventType: { enum: ['page_view', 'product_view', 'session_start'], required: true, type: String },
    path: { required: true, trim: true, type: String },
    productId: { trim: true, type: String },
    productSlug: { trim: true, type: String },
    referrer: { trim: true, type: String },
    sessionId: { required: true, trim: true, type: String },
    source: { trim: true, type: String },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } },
);

analyticsEventSchema.index({ timestamp: -1 });
analyticsEventSchema.index({ anonymousVisitorId: 1, timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ productId: 1, eventType: 1, timestamp: -1 });

export const AnalyticsEventModel = model('AnalyticsEvent', analyticsEventSchema);