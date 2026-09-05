import { ProductModel } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStockState, LOW_STOCK_THRESHOLD } from '../utils/inventory.js';
import { serializeProduct } from '../utils/productSerializer.js';
import type { UpdateInventoryStockBody } from '../validators/inventoryValidators.js';

const inventoryNotFoundMessage = 'Product not found';
const inventoryConflictMessage = 'Stock changed before this update. Refresh and try again.';

function createInventoryItem(product: Parameters<typeof serializeProduct>[0]) {
  const serialized = serializeProduct(product, { includeAdminFields: true });

  return {
    active: serialized.isActive ?? serialized.isAvailable,
    category: serialized.category,
    id: serialized.id,
    image: serialized.primaryImage || serialized.images[0] || '',
    isAvailable: serialized.isAvailable,
    lowStock: serialized.stock > 0 && serialized.stock <= LOW_STOCK_THRESHOLD,
    name: serialized.name,
    outOfStock: serialized.stock === 0,
    sellingPrice: serialized.sellingPrice,
    slug: serialized.slug,
    stock: serialized.stock,
    updatedAt: serialized.updatedAt,
  };
}

export const listInventory = asyncHandler(async (_request, response) => {
  const products = await ProductModel.find().populate('category').sort({ name: 1 });
  const items = products.map(createInventoryItem);
  const summary = items.reduce(
    (result, item) => {
      result.totalUnits += item.stock;
      if (item.lowStock) result.lowStockProducts += 1;
      if (item.outOfStock) result.outOfStockProducts += 1;
      return result;
    },
    { totalUnits: 0, lowStockProducts: 0, outOfStockProducts: 0 },
  );

  return sendSuccess(response, {
    items,
    summary: {
      ...summary,
      totalProducts: items.length,
      threshold: LOW_STOCK_THRESHOLD,
    },
  }, 'Inventory fetched successfully');
});

export const updateInventoryStock = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const { expectedStock, stock } = request.body as UpdateInventoryStockBody;
  const result = await ProductModel.findOneAndUpdate(
    { _id: id, stock: expectedStock },
    { $set: { stock } },
    { returnDocument: 'after', runValidators: true },
  ).populate('category');

  if (!result) {
    const exists = await ProductModel.exists({ _id: id });
    throw new AppError(exists ? inventoryConflictMessage : inventoryNotFoundMessage, exists ? 409 : 404);
  }

  return sendSuccess(response, { item: createInventoryItem(result) }, 'Inventory updated successfully');
});