import { LogOut, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAdminPageTitle } from '../adminNavigation';
import { useAdminAuth } from '../auth/AdminAuthContext';

interface AdminTopbarProps {
  onMenuOpen: () => void;
}

export default function AdminTopbar({ onMenuOpen }: AdminTopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAdminAuth();
  const pageTitle = getAdminPageTitle(location.pathname);

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-noviq-border bg-noviq-black" data-admin-topbar>
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:min-h-20 lg:px-8">
        <button
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold lg:hidden"
          onClick={onMenuOpen}
          type="button"
          aria-label="فتح قائمة الإدارة"
          data-admin-menu-open
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-noviq-gold sm:text-xs">NOVIQ ADMIN</p>
          <h1 className="mt-1 truncate font-heading text-lg font-bold text-noviq-text sm:text-xl lg:text-2xl">
            {pageTitle}
          </h1>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden min-w-0 text-left sm:block" dir="ltr" data-admin-identity>
            <p className="text-xs font-semibold text-noviq-text" dir="rtl">
              {user?.roleLabel ?? 'مدير النظام'}
            </p>
            {user?.email ? (
              <p className="mt-0.5 max-w-[150px] truncate text-xs text-noviq-muted lg:max-w-[220px]">
                {user.email}
              </p>
            ) : null}
          </div>

          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-noviq-border px-3 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={handleLogout}
            type="button"
            aria-label="تسجيل الخروج"
            data-admin-logout
          >
            <LogOut size={17} />
            <span className="hidden min-[390px]:inline">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}
