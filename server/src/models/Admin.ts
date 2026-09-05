import { Schema, model } from 'mongoose';
import { ADMIN_ROLES, type Admin } from '../types/models.js';

const adminSchema = new Schema<Admin>(
  {
    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
    },
    isActive: {
      default: true,
      required: true,
      type: Boolean,
    },
    lastLoginAt: {
      type: Date,
    },
    name: {
      required: true,
      trim: true,
      type: String,
    },
    passwordHash: {
      required: true,
      select: false,
      type: String,
    },
    role: {
      default: 'admin',
      enum: ADMIN_ROLES,
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

adminSchema.index({ email: 1 }, { unique: true });

export const AdminModel = model<Admin>('Admin', adminSchema);
