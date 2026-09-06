import { apiRequest } from './apiClient';
import type { StoreSettings } from '../features/store/settings/storeSettingsDefaults';

interface StoreSettingsResponse {
  settings: StoreSettings;
}

export function fetchAdminSettings() {
  return apiRequest<StoreSettingsResponse>('/admin/settings');
}

export function updateAdminSettings(settings: StoreSettings) {
  return apiRequest<StoreSettingsResponse>('/admin/settings', {
    body: JSON.stringify(settings),
    method: 'PATCH',
  });
}

export function fetchPublicSettings() {
  return apiRequest<StoreSettingsResponse>('/settings');
}
