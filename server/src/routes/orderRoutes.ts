import { Router } from 'express';
import { createOrder } from '../controllers/orderController.js';
import { checkoutRateLimiter } from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createOrderBodySchema } from '../validators/orderValidators.js';

const orderRouter = Router();

orderRouter.post('/', checkoutRateLimiter, validateRequest({ body: createOrderBodySchema }), createOrder);

export { orderRouter };
