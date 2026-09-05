import type { AdminRole } from './models.js';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AdminTokenPayload {
  adminId: string;
}
