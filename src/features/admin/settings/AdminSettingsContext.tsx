import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchAdminSettings, updateAdminSettings } from '../../../services/settingsApi';
import {
  defaultStoreSettings,
  normalizeStoreSettings,
  type StoreSettings,
} from '../../store/settings/storeSettingsDefaults';

export type AdminSettings = StoreSettings;

interface AdminSettingsContextValue {
  settings: AdminSettings;
  isLoading: boolean;
  loadError: string;
  reloadSettings: () => Promise<void>;
  saveSettings: (settings: AdminSettings) => Promise<AdminSettings>;
}

export const defaultAdminSettings = defaultStoreSettings;

const AdminSettingsContext = createContext<AdminSettingsContextValue | undefined>(undefined);

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings>(defaultAdminSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const reloadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const { settings: loadedSettings } = await fetchAdminSettings();
      setSettings(normalizeStoreSettings(loadedSettings));
    } catch {
      setLoadError('تعذر تحميل إعدادات المتجر من الخادم');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  const saveSettings = useCallback(async (nextSettings: AdminSettings) => {
    const { settings: savedSettings } = await updateAdminSettings(nextSettings);
    const normalizedSettings = normalizeStoreSettings(savedSettings);
    setSettings(normalizedSettings);
    return normalizedSettings;
  }, []);

  const value = useMemo<AdminSettingsContextValue>(
    () => ({
      settings,
      isLoading,
      loadError,
      reloadSettings,
      saveSettings,
    }),
    [isLoading, loadError, reloadSettings, saveSettings, settings],
  );

  return <AdminSettingsContext.Provider value={value}>{children}</AdminSettingsContext.Provider>;
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);

  if (!context) {
    throw new Error('useAdminSettings must be used inside AdminSettingsProvider');
  }

  return context;
}
