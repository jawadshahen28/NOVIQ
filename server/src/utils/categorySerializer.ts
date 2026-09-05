import type { HydratedDocument } from 'mongoose';
import type { Category } from '../types/models.js';

export interface SerializedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredCopy: string;
  image: string;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

function toIsoDate(value: Date | undefined) {
  return value instanceof Date ? value.toISOString() : undefined;
}

export function serializeCategory(
  category: HydratedDocument<Category>,
  options: { includeAdminFields?: boolean; productCount?: number } = {},
): SerializedCategory {
  const serialized: SerializedCategory = {
    description: category.description,
    featuredCopy: category.featuredCopy ?? '',
    id: category.id,
    image: category.image,
    name: category.name,
    slug: category.slug,
  };

  if (options.includeAdminFields) {
    serialized.isActive = category.isActive;

    const createdAt = toIsoDate(category.createdAt);
    const updatedAt = toIsoDate(category.updatedAt);

    if (createdAt) {
      serialized.createdAt = createdAt;
    }

    if (updatedAt) {
      serialized.updatedAt = updatedAt;
    }
  }

  if (typeof options.productCount === 'number') {
    serialized.productCount = options.productCount;
  }

  return serialized;
}
