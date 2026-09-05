import { CategoryModel } from '../models/Category.js';
import { ProductModel } from '../models/Product.js';
import type { Category } from '../types/models.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeCategory } from '../utils/categorySerializer.js';
import { escapeRegex } from '../utils/slug.js';
import type {
  AdminCategoryListQuery,
  CreateCategoryBody,
  UpdateCategoryBody,
} from '../validators/catalogValidators.js';

const categoryNotFoundMessage = 'Category not found';

async function getProductCountsByCategory() {
  const counts = await ProductModel.aggregate<{ _id: unknown; count: number }>([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(counts.map((item) => [String(item._id), item.count]));
}

export const listPublicCategories = asyncHandler(async (_request, response) => {
  const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 });

  return sendSuccess(
    response,
    { categories: categories.map((category) => serializeCategory(category)) },
    'Categories fetched successfully',
  );
});

export const getPublicCategory = asyncHandler(async (request, response) => {
  const { slug } = request.params as { slug: string };
  const category = await CategoryModel.findOne({ isActive: true, slug });

  if (!category) {
    throw new AppError(categoryNotFoundMessage, 404);
  }

  return sendSuccess(
    response,
    { category: serializeCategory(category) },
    'Category fetched successfully',
  );
});

export const listAdminCategories = asyncHandler(async (request, response) => {
  const { isActive, search } = request.query as AdminCategoryListQuery;
  const filter: Record<string, unknown> = {};

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: regex }, { slug: regex }];
  }

  const [categories, productCounts] = await Promise.all([
    CategoryModel.find(filter).sort({ createdAt: -1, name: 1 }),
    getProductCountsByCategory(),
  ]);

  return sendSuccess(
    response,
    {
      categories: categories.map((category) =>
        serializeCategory(category, {
          includeAdminFields: true,
          productCount: productCounts.get(category.id) ?? 0,
        }),
      ),
    },
    'Admin categories fetched successfully',
  );
});

export const createCategory = asyncHandler(async (request, response) => {
  const body = request.body as CreateCategoryBody;
  const categoryInput: Partial<Category> = {
    description: body.description,
    image: body.image,
    isActive: body.isActive ?? true,
    name: body.name,
    slug: body.slug,
  };

  if (body.featuredCopy !== undefined) {
    categoryInput.featuredCopy = body.featuredCopy;
  }

  const category = await CategoryModel.create(categoryInput);

  return sendSuccess(
    response,
    { category: serializeCategory(category, { includeAdminFields: true, productCount: 0 }) },
    'Category created successfully',
    201,
  );
});

export const updateCategory = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const body = request.body as UpdateCategoryBody;
  const category = await CategoryModel.findById(id);

  if (!category) {
    throw new AppError(categoryNotFoundMessage, 404);
  }

  if (body.slug && body.slug !== category.slug) {
    const linkedProductCount = await ProductModel.countDocuments({ category: category._id });

    if (linkedProductCount > 0) {
      throw new AppError('Cannot change a category slug while products are linked to it', 409);
    }
  }

  if (body.description !== undefined) {
    category.description = body.description;
  }

  if (body.featuredCopy !== undefined) {
    category.featuredCopy = body.featuredCopy;
  }

  if (body.image !== undefined) {
    category.image = body.image;
  }

  if (body.isActive !== undefined) {
    category.isActive = body.isActive;
  }

  if (body.name !== undefined) {
    category.name = body.name;
  }

  if (body.slug !== undefined) {
    category.slug = body.slug;
  }

  await category.save();

  const productCount = await ProductModel.countDocuments({ category: category._id });

  return sendSuccess(
    response,
    {
      category: serializeCategory(category, {
        includeAdminFields: true,
        productCount,
      }),
    },
    'Category updated successfully',
  );
});

export const deleteCategory = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const category = await CategoryModel.findById(id);

  if (!category) {
    throw new AppError(categoryNotFoundMessage, 404);
  }

  const linkedProductCount = await ProductModel.countDocuments({ category: category._id });

  if (linkedProductCount > 0) {
    throw new AppError('Cannot delete a category while products are linked to it', 409);
  }

  await category.deleteOne();

  return sendSuccess(response, { categoryId: id, deleted: true }, 'Category deleted successfully');
});
