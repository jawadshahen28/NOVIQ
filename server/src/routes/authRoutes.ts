import { Router } from 'express';
import { getCurrentAdmin, login, logout } from '../controllers/authController.js';
import { loginRateLimiter } from '../middleware/rateLimit.js';
import { requireAdminAuth } from '../middleware/requireAdminAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginBodySchema } from '../validators/authValidators.js';

const authRouter = Router();

authRouter.post('/login', loginRateLimiter, validateRequest({ body: loginBodySchema }), login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAdminAuth, getCurrentAdmin);

export { authRouter };
