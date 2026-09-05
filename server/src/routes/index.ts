import { Router } from 'express';
import { adminRouter } from './adminRoutes.js';
import { authRouter } from './authRoutes.js';
import { healthRouter } from './healthRoutes.js';
import { orderRouter } from './orderRoutes.js';
import { storefrontRouter } from './storefrontRoutes.js';

const apiRouter = Router();

apiRouter.use('/admin', adminRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/storefront', storefrontRouter);
apiRouter.use('/', storefrontRouter);

export { apiRouter };
