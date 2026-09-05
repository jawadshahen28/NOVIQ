import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import heroImage from '../../../assets/noviq-reference-hero.png';

export interface AdminSettings {
  storeName: string;
  storeDescription: string;
  whatsappNumber: string;
  storePhone: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  ordersOpen: boolean;
  closedMessage: string;
}

interface AdminSettingsContextValue {
  settings: AdminSettings;
  saveSettings: (settings: AdminSettings) => void;
}

const ADMIN_SETTINGS_STORAGE_KEY = 'noviq-admin-dev-settings-v1';

export const defaultAdminSettings: AdminSettings = {
  storeName: 'NOVIQ',
  storeDescription: 'متجر ساعات مختارة تجمع بين الأناقة والجودة والتفاصيل الراقية.',
  whatsappNumber: '',
  storePhone: '',
  heroTitle: 'ساعة تليق بحضورك.',
  heroDescription:
    'اكتشف مجموعة مختارة من الساعات التي تجمع بين الأناقة، الجودة والتفاصيل التي تصنع الفرق.',
  heroImage,
  ordersOpen: true,
  closedMessage: 'المتجر مغلق حالياً، يرجى المحاولة لاحقاً.',
};

const AdminSettingsContext = createContext<AdminSettingsContextValue | undefined>(undefined);

function normalizeStoredSettings(value: unknown): AdminSettings | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<AdminSettings>;

  return {
    ...defaultAdminSettings,
    storeName:
      typeof candidate.storeName === 'string' ? candidate.storeName : defaultAdminSettings.storeName,
    storeDescription:
      typeof candidate.storeDescription === 'string'
        ? candidate.storeDescription
        : defaultAdminSettings.storeDescription,
    whatsappNumber:
      typeof candidate.whatsappNumber === 'string'
        ? candidate.whatsappNumber
        : defaultAdminSettings.whatsappNumber,
    storePhone:
      typeof candidate.storePhone === 'string' ? candidate.storePhone : defaultAdminSettings.storePhone,
    heroTitle:
      typeof candidate.heroTitle === 'string' ? candidate.heroTitle : defaultAdminSettings.heroTitle,
    heroDescription:
      typeof candidate.heroDescription === 'string'
        ? candidate.heroDescription
        : defaultAdminSettings.heroDescription,
    heroImage:
      typeof candidate.heroImage === 'string' ? candidate.heroImage : defaultAdminSettings.heroImage,
    ordersOpen:
      typeof candidate.ordersOpen === 'boolean'
        ? candidate.ordersOpen
        : defaultAdminSettings.ordersOpen,
    closedMessage:
      typeof candidate.closedMessage === 'string'
        ? candidate.closedMessage
        : defaultAdminSettings.closedMessage,
  };
}

function loadStoredSettings() {
  if (typeof window === 'undefined') {
    return defaultAdminSettings;
  }

  const rawSettings = window.localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);

  if (!rawSettings) {
    return defaultAdminSettings;
  }

  try {
    return normalizeStoredSettings(JSON.parse(rawSettings)) ?? defaultAdminSettings;
  } catch {
    return defaultAdminSettings;
  }
}

function storeSettings(settings: AdminSettings) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings>(() => loadStoredSettings());

  const saveSettings = useCallback((nextSettings: AdminSettings) => {
    setSettings(nextSettings);
    storeSettings(nextSettings);
  }, []);

  const value = useMemo<AdminSettingsContextValue>(
    () => ({
      settings,
      saveSettings,
    }),
    [saveSettings, settings],
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
