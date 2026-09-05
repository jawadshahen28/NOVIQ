import { Schema, model } from 'mongoose';
import type { Product } from '../types/models.js';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const productSchema = new Schema<Product>(
  {
    brand: {
      trim: true,
      type: String,
    },
    category: {
      ref: 'Category',
      required: true,
      type: Schema.Types.ObjectId,
    },
    compareAtPrice: {
      min: [0, 'Compare-at price must be greater than or equal to 0'],
      type: Number,
      validate: {
        message: 'Compare-at price must be greater than or equal to price',
        validator(this: Product, value?: number) {
          return value === undefined || value >= this.price;
        },
      },
    },
    costPrice: {
      min: [0, 'Cost price must be greater than or equal to 0'],
      required: true,
      type: Number,
    },
    description: {
      required: true,
      trim: true,
      type: String,
    },
    images: {
      required: true,
      type: [
        {
          trim: true,
          type: String,
        },
      ],
      validate: {
        message: 'At least one product image is required',
        validator(images: string[]) {
          return images.length > 0;
        },
      },
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
    price: {
      min: [0.01, 'Price must be greater than 0'],
      required: true,
      type: Number,
    },
    primaryImage: {
      required: true,
      trim: true,
      type: String,
    },
    shortDescription: {
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
    specifications: {
      default: {},
      of: String,
      type: Map,
    },
    stock: {
      min: [0, 'Stock must be greater than or equal to 0'],
      required: true,
      type: Number,
      validate: {
        message: 'Stock must be a whole number',
        validator(value: number) {
          return Number.isInteger(value);
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

productSchema.pre('validate', function setPrimaryImage() {
  if (!this.primaryImage && this.images.length > 0) {
    const [firstImage] = this.images;

    if (firstImage) {
      this.primaryImage = firstImage;
    }
  }
});

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1, isActive: 1 });

export const ProductModel = model<Product>('Product', productSchema);
