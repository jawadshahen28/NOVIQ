import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminCatalogProvider } from '../features/admin/catalog/AdminCatalogContext';
import AdminSidebar from '../features/admin/components/AdminSidebar';
import AdminTopbar from '../features/admin/components/AdminTopbar';
import { AdminSettingsProvider } from '../features/admin/settings/AdminSettingsContext';

export default function AdminLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-noviq-black text-noviq-text" dir="rtl" data-admin-shell>
      <AdminSidebar className="fixed inset-y-0 right-0 z-40 hidden w-64 lg:flex" />

      <div className="min-w-0 lg:pr-64">
        <AdminTopbar onMenuOpen={() => setIsSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:min-h-[calc(100vh-80px)] lg:px-8 lg:py-8">
          <AdminSettingsProvider>
            <AdminCatalogProvider>
              <Outlet />
            </AdminCatalogProvider>
          </AdminSettingsProvider>
        </main>
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" data-admin-drawer>
          <button
            className="absolute inset-0 h-full w-full bg-black/70"
            onClick={() => setIsSidebarOpen(false)}
            type="button"
            aria-label="إغلاق قائمة الإدارة"
            data-admin-drawer-overlay
          />
          <div className="absolute inset-y-0 right-0 w-[min(280px,calc(100vw-32px))] transition-transform duration-200">
            <AdminSidebar
              showCloseButton
              onClose={() => setIsSidebarOpen(false)}
              onNavigate={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
