import type { AuthenticatedAdmin } from '../types/auth.js';
import type { Admin } from '../types/models.js';

interface AdminDocumentShape extends Admin {
  _id: {
    toString(): string;
  };
  id?: string;
}

export function serializeAdmin(admin: AdminDocumentShape): AuthenticatedAdmin {
  return {
    email: admin.email,
    id: admin.id ?? admin._id.toString(),
    name: admin.name,
    role: admin.role,
  };
}
