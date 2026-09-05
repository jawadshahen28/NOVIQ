import { apiRequest } from './apiClient';

export interface BackendAdmin {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface AdminAuthResponse {
  admin: BackendAdmin;
}

export function loginAdmin(email: string, password: string) {
  return apiRequest<AdminAuthResponse>('/auth/login', {
    body: JSON.stringify({ email, password }),
    method: 'POST',
  });
}

export function fetchCurrentAdmin() {
  return apiRequest<AdminAuthResponse>('/auth/me');
}

export function logoutAdmin() {
  return apiRequest<{ authenticated: boolean }>('/auth/logout', {
    method: 'POST',
  });
}
