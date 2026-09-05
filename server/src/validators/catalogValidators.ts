import { z } from 'zod';
import { mongoObjectIdSchema, paginationQuerySchema, slugSchema } from './commonSchemas.js';

const imageReferenceSchema = z
  .string()
  .trim()
  .min(1, 'Image reference is required')
  .max(2_000, 'Image reference is too long')
  .refine((value) => !/\s/.test(value), 'Image reference cannot contain whitespace');

const optionalTextSchema = (max: number) => z.string().trim().max(max).optional();
const requiredTextSchema = (field: string, max: number) =>
  z.string().trim().min(1, `${field} is required`).max(max);

const nullableMoneySchema = z.union([z.coerce.number().min(0), z.null()]).optional();
const specificationsSchema = z.record(z.string().trim().min(1).max(80), z.string().trim().max(500));

export const resourceIdParamsSchema = z.object({
  id: mongoObjectIdSchema,
});

export const slugParamsSchema = z.object({
  slug: slugSchema,
});

export const adminCategoryListQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  search: optionalTextSchema(100),
});

export const createCategoryBodySchema = z.object({
  description: z.string().trim().max(1_000).default(''),
  featuredCopy: optionalTextSchema(280),
  image: imageReferenceSchema,
  isActive: z.boolean().optional(),
  name: requiredTextSchema('Category name', 120),
  slug: slugSchema,
});

export const updateCategoryBodySchema = createCategoryBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one category field is required',
);

const productFieldsSchema = z.object({
  brand: optionalTextSchema(120),
  category: slugSchema.optional(),
  categoryId: mongoObjectIdSchema.optional(),
  compareAtPrice: nullableMoneySchema,
  costPrice: z.coerce.number().min(0).optional(),
  description: requiredTextSchema('Product description', 4_000).optional(),
  images: z.array(imageReferenceSchema).min(1).max(12).optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  name: requiredTextSchema('Product name', 160).optional(),
  price: z.coerce.number().min(0.01).optional(),
  primaryImage: imageReferenceSchema.optional(),
  sellingPrice: z.coerce.number().min(0.01).optional(),
  shortDescription: optionalTextSchema(280),
  slug: slugSchema.optional(),
  specifications: specificationsSchema.optional(),
  stock: z.coerce.number().int().min(0).optional(),
});

export const createProductBodySchema = productFieldsSchema
  .extend({
    costPrice: z.coerce.number().min(0),
    description: requiredTextSchema('Product description', 4_000),
    images: z.array(imageReferenceSchema).min(1).max(12),
    name: requiredTextSchema('Product name', 160),
    stock: z.coerce.number().int().min(0),
  })
  .refine((value) => value.category || value.categoryId, {
    message: 'Product category is required',
    path: ['category'],
  })
  .refine((value) => value.price || value.sellingPrice, {
    message: 'Product price is required',
    path: ['price'],
  });

export const updateProductBodySchema = productFieldsSchema.refine(
  (value) => Object.keys(value).length > 0,
  'At least one product field is required',
);

export const updateProductStockBodySchema = z.object({
  stock: z.coerce.number().int().min(0),
});

export const publicProductListQuerySchema = z.object({
  category: slugSchema.optional(),
  search: optionalTextSchema(100),
});

export const adminProductListQuerySchema = paginationQuerySchema.extend({
  category: slugSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: optionalTextSchema(100),
  stock: z.enum(['all', 'available', 'low', 'out']).default('all'),
});

export type AdminCategoryListQuery = z.infer<typeof adminCategoryListQuerySchema>;
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;
export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type PublicProductListQuery = z.infer<typeof publicProductListQuerySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type UpdateProductStockBody = z.infer<typeof updateProductStockBodySchema>;
