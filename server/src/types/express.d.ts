import type { AuthenticatedAdmin } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

export {};
