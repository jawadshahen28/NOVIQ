import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { CategoryModel } from '../models/Category.js';
import { ProductModel } from '../models/Product.js';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Types } from 'mongoose';

async function loadApprovedCatalog() {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const [categoryModule, productModule] = await Promise.all([
    import(pathToFileURL(path.join(projectRoot, 'src/data/categories.ts')).href),
    import(pathToFileURL(path.join(projectRoot, 'src/data/products.ts')).href),
  ]);

  return {
    categories: categoryModule.categories as Array<{
      description: string;
      featuredCopy: string;
      image: string;
      name: string;
      slug: string;
    }>,
    products: productModule.products as Array<{
      category: string;
      costPrice: number;
      description: string;
      discountPercent: number;
      images: string[];
      isAvailable: boolean;
      name: string;
      price: number;
      shortDescription: string;
      slug: string;
      specifications: Record<string, string>;
      stock: number;
    }>,
  };
}

async function seedCatalog() {
  await connectDatabase();
  const { categories, products } = await loadApprovedCatalog();

  const categoryIds = new Map<string, Types.ObjectId>();

  for (const category of categories) {
    const savedCategory = await CategoryModel.findOneAndUpdate(
      { slug: category.slug },
      {
        $set: {
          description: category.description,
          featuredCopy: category.featuredCopy,
          image: category.image,
          isActive: true,
          name: category.name,
          slug: category.slug,
        },
      },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    categoryIds.set(category.slug, savedCategory._id as Types.ObjectId);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.category);

    if (!categoryId) {
      throw new Error(`Missing category for product ${product.slug}`);
    }

    const sellingPrice = Math.round(product.price * (1 - product.discountPercent / 100));
    const compareAtPrice = product.discountPercent > 0 ? product.price : undefined;

    const savedProduct =
      (await ProductModel.findOne({ slug: product.slug })) ?? new ProductModel({ slug: product.slug });

    savedProduct.category = categoryId;
    savedProduct.costPrice = product.costPrice;
    savedProduct.description = product.description;
    savedProduct.images = product.images;
    savedProduct.isActive = product.isAvailable;
    savedProduct.name = product.name;
    savedProduct.price = sellingPrice;
    savedProduct.primaryImage = product.images[0] ?? '';
    savedProduct.shortDescription = product.shortDescription;
    savedProduct.specifications = new Map(Object.entries(product.specifications));
    savedProduct.stock = product.stock;
    savedProduct.set('compareAtPrice', compareAtPrice);
    await savedProduct.save();
  }

  console.info(`[seed] catalog synchronized: ${categories.length} categories, ${products.length} products`);
}

try {
  await seedCatalog();
} finally {
  await disconnectDatabase();
}
