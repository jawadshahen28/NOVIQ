import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiClientError } from '../../../services/apiClient';
import {
  fetchCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  type BackendAdmin,
} from '../../../services/adminAuthApi';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  roleLabel: string;
}

interface LoginResult {
  message?: string;
  success: boolean;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const invalidLoginMessage = 'بيانات تسجيل الدخول غير صحيحة';
const serverUnavailableMessage = 'تعذر الاتصال بالخادم';
const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

function mapAdmin(admin: BackendAdmin): AdminUser {
  return {
    email: admin.email,
    id: admin.id,
    name: admin.name,
    role: admin.role,
    roleLabel: 'مدير النظام',
  };
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return invalidLoginMessage;
    }

    if (error.status === 429) {
      return error.message;
    }
  }

  return serverUnavailableMessage;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchCurrentAdmin()
      .then(({ admin }) => {
        if (isMounted) {
          setUser(mapAdmin(admin));
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
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

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { admin } = await loginAdmin(email, password);
      setUser(mapAdmin(admin));
      return { success: true };
    } catch (error) {
      setUser(null);
      return {
        message: getLoginErrorMessage(error),
        success: false,
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, user],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  }

  return context;
}
