import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  listAdminCategories,
  updateCategory,
} from '../controllers/categoryController.js';
import {
  createProduct,
  deleteProduct,
  listAdminProducts,
  updateProduct,
} from '../controllers/productController.js';
import { requireAdminAuth } from '../middleware/requireAdminAuth.js';
import { uploadRateLimiter } from '../middleware/rateLimit.js';
import { uploadImageFile } from '../middleware/uploadMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { uploadImage } from '../controllers/uploadController.js';
import {
  adminCategoryListQuerySchema,
  adminProductListQuerySchema,
  createCategoryBodySchema,
  createProductBodySchema,
  resourceIdParamsSchema,
  updateCategoryBodySchema,
  updateProductBodySchema,
} from '../validators/catalogValidators.js';
import {
  getAdminOrder,
  listAdminOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import {
  adminOrderListQuerySchema,
  updateOrderStatusBodySchema,
} from '../validators/orderValidators.js';
import { listInventory, updateInventoryStock } from '../controllers/inventoryController.js';
import { getAdminDashboard } from '../controllers/dashboardController.js';
import { getAdminAnalytics } from '../controllers/analyticsController.js';
import { getAdminReportSummary } from '../controllers/reportController.js';
import { adminReportQuerySchema } from '../validators/reportValidators.js';
import { analyticsRangeSchema } from '../validators/analyticsValidators.js';
import {
  inventoryProductParamsSchema,
  updateInventoryStockBodySchema,
} from '../validators/inventoryValidators.js';

const adminRouter = Router();

adminRouter.use(requireAdminAuth);

adminRouter.get('/dashboard', getAdminDashboard);
adminRouter.get('/reports', validateRequest({ query: adminReportQuerySchema }), getAdminReportSummary);
adminRouter.get('/analytics', validateRequest({ query: analyticsRangeSchema }), getAdminAnalytics);

adminRouter.post('/uploads/image', uploadRateLimiter, uploadImageFile, uploadImage);

adminRouter.get('/categories', validateRequest({ query: adminCategoryListQuerySchema }), listAdminCategories);
adminRouter.post('/categories', validateRequest({ body: createCategoryBodySchema }), createCategory);
adminRouter.patch(
  '/categories/:id',
  validateRequest({ body: updateCategoryBodySchema, params: resourceIdParamsSchema }),
  updateCategory,
);

adminRouter.get('/inventory', listInventory);
adminRouter.patch(
  '/inventory/:id',
  validateRequest({ body: updateInventoryStockBodySchema, params: inventoryProductParamsSchema }),
  updateInventoryStock,
);
adminRouter.delete('/categories/:id', validateRequest({ params: resourceIdParamsSchema }), deleteCategory);

adminRouter.get('/products', validateRequest({ query: adminProductListQuerySchema }), listAdminProducts);
adminRouter.post('/products', validateRequest({ body: createProductBodySchema }), createProduct);
adminRouter.patch(
  '/products/:id',
  validateRequest({ body: updateProductBodySchema, params: resourceIdParamsSchema }),
  updateProduct,
);
adminRouter.delete('/products/:id', validateRequest({ params: resourceIdParamsSchema }), deleteProduct);

adminRouter.get('/orders', validateRequest({ query: adminOrderListQuerySchema }), listAdminOrders);
adminRouter.get('/orders/:id', validateRequest({ params: resourceIdParamsSchema }), getAdminOrder);
adminRouter.patch(
  '/orders/:id/status',
  validateRequest({ body: updateOrderStatusBodySchema, params: resourceIdParamsSchema }),
  updateOrderStatus,
);

export { adminRouter };
