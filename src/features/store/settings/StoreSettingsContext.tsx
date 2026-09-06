import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchPublicSettings } from '../../../services/settingsApi';
import {
  defaultStoreSettings,
  normalizeStoreSettings,
  type StoreSettings,
} from './storeSettingsDefaults';

interface StoreSettingsContextValue {
  settings: StoreSettings;
  isLoading: boolean;
  loadError: string;
}

const StoreSettingsContext = createContext<StoreSettingsContextValue | undefined>(undefined);

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetchPublicSettings()
      .then(({ settings: loadedSettings }) => {
        if (isMounted) {
          setSettings(normalizeStoreSettings(loadedSettings));
          setLoadError('');
        }
      })
      .catch(() => {
        if (isMounted) {
          setSettings(defaultStoreSettings);
          setLoadError('تعذر تحميل إعدادات المتجر');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<StoreSettingsContextValue>(
    () => ({
      settings,
      isLoading,
      loadError,
    }),
    [isLoading, loadError, settings],
  );

  return <StoreSettingsContext.Provider value={value}>{children}</StoreSettingsContext.Provider>;
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);

  if (!context) {
    throw new Error('useStoreSettings must be used inside StoreSettingsProvider');
  }

  return context;
}
