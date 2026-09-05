import type { Types } from 'mongoose';
import { CategoryModel } from '../models/Category.js';
import { ProductModel } from '../models/Product.js';
import type { Product } from '../types/models.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeProduct } from '../utils/productSerializer.js';
import { createSlug, escapeRegex } from '../utils/slug.js';
import type {
  AdminProductListQuery,
  CreateProductBody,
  PublicProductListQuery,
  UpdateProductBody,
  UpdateProductStockBody,
} from '../validators/catalogValidators.js';

const productNotFoundMessage = 'Product not found';

function normalizeImages(images: string[], primaryImage?: string) {
  const uniqueImages = images.filter((image, index, allImages) => allImages.indexOf(image) === index);

  if (!primaryImage || !uniqueImages.includes(primaryImage)) {
    return uniqueImages;
  }

  return [primaryImage, ...uniqueImages.filter((image) => image !== primaryImage)];
}

function getProductPrice(body: Pick<CreateProductBody | UpdateProductBody, 'price' | 'sellingPrice'>) {
  return body.sellingPrice ?? body.price;
}

function assertValidCompareAtPrice(sellingPrice: number, compareAtPrice: number | null | undefined) {
  if (compareAtPrice !== null && compareAtPrice !== undefined && compareAtPrice < sellingPrice) {
    throw new AppError('Compare-at price must be greater than or equal to price', 400, [
      {
        code: 'too_small',
        message: 'Compare-at price must be greater than or equal to price',
        path: 'compareAtPrice',
      },
    ]);
  }
}

async function findCategoryForProduct(body: {
  category?: string | undefined;
  categoryId?: string | undefined;
}): Promise<Types.ObjectId | undefined> {
  if (body.categoryId) {
    const category = await CategoryModel.findById(body.categoryId);

    if (!category) {
      throw new AppError('Product category not found', 400, [
        {
          code: 'not_found',
          message: 'Product category not found',
          path: 'categoryId',
        },
      ]);
    }

    return category._id as Types.ObjectId;
  }

  if (body.category) {
    const category = await CategoryModel.findOne({ slug: body.category });

    if (!category) {
      throw new AppError('Product category not found', 400, [
        {
          code: 'not_found',
          message: 'Product category not found',
          path: 'category',
        },
      ]);
    }

    return category._id as Types.ObjectId;
  }

  return undefined;
}

function addSearchFilter(filter: Record<string, unknown>, search?: string) {
  if (!search) {
    return;
  }

  const regex = new RegExp(escapeRegex(search), 'i');
  filter.$or = [
    { brand: regex },
    { description: regex },
    { name: regex },
    { shortDescription: regex },
    { slug: regex },
  ];
}

function addStockFilter(filter: Record<string, unknown>, stock: AdminProductListQuery['stock']) {
  if (stock === 'available') {
    filter.stock = { $gt: 3 };
  }

  if (stock === 'low') {
    filter.stock = { $gt: 0, $lte: 3 };
  }

  if (stock === 'out') {
    filter.stock = 0;
  }
}

export const listPublicProducts = asyncHandler(async (request, response) => {
  const { category, search } = request.query as PublicProductListQuery;
  const filter: Record<string, unknown> = {
    isActive: true,
  };

  if (category) {
    const activeCategory = await CategoryModel.findOne({ isActive: true, slug: category });

    if (!activeCategory) {
      return sendSuccess(response, { products: [] }, 'Products fetched successfully');
    }

    filter.category = activeCategory._id;
  }

  addSearchFilter(filter, search);

  const products = await ProductModel.find(filter).populate('category').sort({ createdAt: -1, name: 1 });
  const publicProducts = products
    .filter((product) => {
      const populatedCategory = product.get('category') as { isActive?: unknown } | undefined;
      return populatedCategory?.isActive !== false;
    })
    .map((product) => serializeProduct(product));

  return sendSuccess(response, { products: publicProducts }, 'Products fetched successfully');
});

export const getPublicProduct = asyncHandler(async (request, response) => {
  const { slug } = request.params as { slug: string };
  const product = await ProductModel.findOne({ isActive: true, slug }).populate('category');

  if (!product) {
    throw new AppError(productNotFoundMessage, 404);
  }

  const populatedCategory = product.get('category') as { isActive?: unknown } | undefined;

  if (populatedCategory?.isActive === false) {
    throw new AppError(productNotFoundMessage, 404);
  }

  return sendSuccess(
    response,
    { product: serializeProduct(product) },
    'Product fetched successfully',
  );
});

export const listAdminProducts = asyncHandler(async (request, response) => {
  const { category, isActive, limit, page, search, stock } =
    request.query as unknown as AdminProductListQuery;
  const filter: Record<string, unknown> = {};

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  if (category) {
    const selectedCategory = await CategoryModel.findOne({ slug: category });

    if (!selectedCategory) {
      return sendSuccess(
        response,
        {
          pagination: { limit, page, total: 0, totalPages: 0 },
          products: [],
        },
        'Admin products fetched successfully',
      );
    }

    filter.category = selectedCategory._id;
  }

  addSearchFilter(filter, search);
  addStockFilter(filter, stock);

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .populate('category')
      .sort({ createdAt: -1, name: 1 })
      .skip(skip)
      .limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  return sendSuccess(
    response,
    {
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
      products: products.map((product) => serializeProduct(product, { includeAdminFields: true })),
    },
    'Admin products fetched successfully',
  );
});

export const createProduct = asyncHandler(async (request, response) => {
  const body = request.body as CreateProductBody;
  const categoryId = await findCategoryForProduct(body);
  const sellingPrice = getProductPrice(body);

  if (!sellingPrice || !categoryId) {
    throw new AppError('Product category and price are required', 400);
  }

  assertValidCompareAtPrice(sellingPrice, body.compareAtPrice);

  const images = normalizeImages(body.images, body.primaryImage);
  const primaryImage = images[0];

  if (!primaryImage) {
    throw new AppError('At least one product image is required', 400);
  }

  const productInput: Partial<Product> = {
    category: categoryId,
    costPrice: body.costPrice,
    description: body.description,
    images,
    isActive: body.isActive ?? body.isAvailable ?? true,
    name: body.name,
    price: sellingPrice,
    primaryImage,
    shortDescription: body.shortDescription ?? body.description.slice(0, 140),
    slug: body.slug ?? createSlug(body.name, 'product'),
    specifications: new Map(Object.entries(body.specifications ?? {})),
    stock: body.stock,
  };

  if (body.brand !== undefined) {
    productInput.brand = body.brand;
  }

  if (body.compareAtPrice !== null && body.compareAtPrice !== undefined) {
    productInput.compareAtPrice = body.compareAtPrice;
  }

  const product = await ProductModel.create(productInput);

  await product.populate('category');

  return sendSuccess(
    response,
    { product: serializeProduct(product, { includeAdminFields: true }) },
    'Product created successfully',
    201,
  );
});

export const updateProduct = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const body = request.body as UpdateProductBody;
  const product = await ProductModel.findById(id);

  if (!product) {
    throw new AppError(productNotFoundMessage, 404);
  }

  const categoryId = await findCategoryForProduct(body);

  if (categoryId) {
    product.category = categoryId;
  }

  const nextSellingPrice = getProductPrice(body) ?? product.price;
  const nextCompareAtPrice =
    body.compareAtPrice !== undefined ? body.compareAtPrice : product.compareAtPrice;

  assertValidCompareAtPrice(nextSellingPrice, nextCompareAtPrice);

  if (body.brand !== undefined) {
    product.brand = body.brand;
  }

  if (body.costPrice !== undefined) {
    product.costPrice = body.costPrice;
  }

  if (body.description !== undefined) {
    product.description = body.description;
  }

  if (body.images !== undefined) {
    const images = normalizeImages(body.images, body.primaryImage);
    product.images = images;
    product.primaryImage = images[0] ?? product.primaryImage;
  } else if (body.primaryImage !== undefined) {
    product.primaryImage = body.primaryImage;
  }

  if (body.isActive !== undefined) {
    product.isActive = body.isActive;
  } else if (body.isAvailable !== undefined) {
    product.isActive = body.isAvailable;
  }

  if (body.name !== undefined) {
    product.name = body.name;
  }

  if (body.price !== undefined || body.sellingPrice !== undefined) {
    product.price = nextSellingPrice;
  }

  if (body.compareAtPrice !== undefined) {
    product.set('compareAtPrice', body.compareAtPrice ?? undefined);
  }

  if (body.shortDescription !== undefined) {
    product.shortDescription = body.shortDescription;
  }

  if (body.slug !== undefined) {
    product.slug = body.slug;
  }

  if (body.specifications !== undefined) {
    product.specifications = new Map(Object.entries(body.specifications));
  }

  if (body.stock !== undefined) {
    product.stock = body.stock;
  }

  await product.save();
  await product.populate('category');

  return sendSuccess(
    response,
    { product: serializeProduct(product, { includeAdminFields: true }) },
    'Product updated successfully',
  );
});

export const updateProductStock = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const { stock } = request.body as UpdateProductStockBody;
  const product = await ProductModel.findById(id);

  if (!product) {
    throw new AppError(productNotFoundMessage, 404);
  }

  product.stock = stock;
  await product.save();
  await product.populate('category');

  return sendSuccess(
    response,
    { product: serializeProduct(product, { includeAdminFields: true }) },
    'Product stock updated successfully',
  );
});

export const deleteProduct = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const product = await ProductModel.findById(id);

  if (!product) {
    throw new AppError(productNotFoundMessage, 404);
  }

  await product.deleteOne();

  return sendSuccess(response, { deleted: true, productId: id }, 'Product deleted successfully');
});
