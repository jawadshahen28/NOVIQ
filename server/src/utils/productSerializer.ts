import type { HydratedDocument, Types } from 'mongoose';
import type { Product } from '../types/models.js';

interface CategoryReference {
  id: string;
  isActive?: boolean;
  name: string;
  slug: string;
}

export interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  shortDescription: string;
  description: string;
  price: number;
  sellingPrice: number;
  compareAtPrice: number | null;
  costPrice?: number;
  discountPercent: number;
  images: string[];
  primaryImage: string;
  stock: number;
  isAvailable: boolean;
  isActive?: boolean;
  specifications: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

function toIsoDate(value: Date | undefined) {
  return value instanceof Date ? value.toISOString() : undefined;
}

function getCategoryReference(value: unknown): CategoryReference | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as {
    _id?: { toString(): string };
    id?: unknown;
    isActive?: unknown;
    name?: unknown;
    slug?: unknown;
  };

  if (typeof candidate.slug !== 'string' || typeof candidate.name !== 'string') {
    return null;
  }

  const id =
    typeof candidate.id === 'string'
      ? candidate.id
      : typeof candidate._id?.toString === 'function'
        ? candidate._id.toString()
        : '';

  const reference: CategoryReference = {
    id,
    name: candidate.name,
    slug: candidate.slug,
  };

  if (typeof candidate.isActive === 'boolean') {
    reference.isActive = candidate.isActive;
  }

  return reference;
}

function getSpecifications(specifications: Product['specifications']) {
  if (specifications instanceof Map) {
    return Object.fromEntries(specifications);
  }

  return {};
}

function getDiscountPercent(sellingPrice: number, compareAtPrice: number | null) {
  if (!compareAtPrice || compareAtPrice <= sellingPrice) {
    return 0;
  }

  return Math.round(((compareAtPrice - sellingPrice) / compareAtPrice) * 100);
}

export function serializeProduct(
  product: HydratedDocument<Product>,
  options: { includeAdminFields?: boolean } = {},
): SerializedProduct {
  const category = getCategoryReference(product.get('category'));
  const categoryId = category?.id || (product.category as Types.ObjectId).toString();
  const sellingPrice = product.price;
  const compareAtPrice = product.compareAtPrice ?? null;
  const displayPrice = compareAtPrice && compareAtPrice > sellingPrice ? compareAtPrice : sellingPrice;
  const serialized: SerializedProduct = {
    brand: product.brand ?? '',
    category: category?.slug ?? categoryId,
    compareAtPrice,
    description: product.description,
    discountPercent: getDiscountPercent(sellingPrice, compareAtPrice),
    id: product.id,
    images: [...product.images],
    isAvailable: product.isActive && product.stock > 0,
    name: product.name,
    price: displayPrice,
    primaryImage: product.primaryImage,
    sellingPrice,
    shortDescription: product.shortDescription ?? '',
    slug: product.slug,
    specifications: getSpecifications(product.specifications),
    stock: product.stock,
  };

  if (categoryId) {
    serialized.categoryId = categoryId;
  }

  if (category?.name) {
    serialized.categoryName = category.name;
  }

  if (options.includeAdminFields) {
    serialized.costPrice = product.costPrice;
    serialized.isActive = product.isActive;

    const createdAt = toIsoDate(product.createdAt);
    const updatedAt = toIsoDate(product.updatedAt);

    if (createdAt) {
      serialized.createdAt = createdAt;
    }

    if (updatedAt) {
      serialized.updatedAt = updatedAt;
    }
  }

  return serialized;
}
