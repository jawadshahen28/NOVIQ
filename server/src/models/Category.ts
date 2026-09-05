import { Schema, model } from 'mongoose';
import type { Category } from '../types/models.js';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categorySchema = new Schema<Category>(
  {
    description: {
      default: '',
      trim: true,
      type: String,
    },
    featuredCopy: {
      trim: true,
      type: String,
    },
    image: {
      default: '',
      trim: true,
      type: String,
    },
    isActive: {
      default: true,
      required: true,
      type: Boolean,
    },
    name: {
      required: true,
      trim: true,
      type: String,
    },
    slug: {
      lowercase: true,
      match: [slugPattern, 'Slug must use lowercase letters, numbers, and hyphens'],
      required: true,
      trim: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });

export const CategoryModel = model<Category>('Category', categorySchema);
