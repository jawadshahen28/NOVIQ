import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function ProtectedAdminRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-noviq-black px-4 text-noviq-text"
        dir="rtl"
        data-admin-auth-loading
      >
        <p className="text-sm font-semibold text-noviq-secondaryText">
          جاري التحقق من تسجيل الدخول...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
