import { Router } from 'express';
import { trackAnalyticsEvent } from '../controllers/analyticsController.js';
import { analyticsRateLimiter } from '../middleware/rateLimit.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { analyticsTrackSchema } from '../validators/analyticsValidators.js';

const analyticsRouter = Router();
analyticsRouter.post('/track', analyticsRateLimiter, validateRequest({ body: analyticsTrackSchema }), trackAnalyticsEvent);
export { analyticsRouter };