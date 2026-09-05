import { Router } from 'express';
import { getPublicCategory, listPublicCategories } from '../controllers/categoryController.js';
import { getPublicProduct, listPublicProducts } from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  publicProductListQuerySchema,
  slugParamsSchema,
} from '../validators/catalogValidators.js';

const storefrontRouter = Router();

storefrontRouter.get('/categories', listPublicCategories);
storefrontRouter.get('/categories/:slug', validateRequest({ params: slugParamsSchema }), getPublicCategory);
storefrontRouter.get(
  '/products',
  validateRequest({ query: publicProductListQuerySchema }),
  listPublicProducts,
);
storefrontRouter.get('/products/:slug', validateRequest({ params: slugParamsSchema }), getPublicProduct);

export { storefrontRouter };
