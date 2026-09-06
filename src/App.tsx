import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AdminAuthProvider } from './features/admin/auth/AdminAuthContext';
import ProtectedAdminRoute from './features/admin/auth/ProtectedAdminRoute';
import { CartProvider } from './features/cart/CartContext';
import { StoreCatalogProvider } from './features/store/catalog/StoreCatalogContext';
import { StoreSettingsProvider } from './features/store/settings/StoreSettingsContext';
import StoreLayout from './layouts/StoreLayout';
import HomePage from './pages/HomePage';
import { trackStorefrontRoute } from './services/analyticsApi';

const CartPage = lazy(() => import('./pages/CartPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminInventoryPage = lazy(() => import('./pages/AdminInventoryPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminNotFoundPage = lazy(() => import('./pages/AdminNotFoundPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));

function StorefrontAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    const route = `${location.pathname}${location.search}`;
    let idleId: number | undefined;
    const timeoutId = globalThis.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => trackStorefrontRoute(route), { timeout: 2500 });
      } else {
        trackStorefrontRoute(route);
      }
    }, 1800);

    return () => {
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }

      globalThis.clearTimeout(timeoutId);
    };
  }, [location.pathname, location.search]);

  return null;
}

function RouteLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-noviq-black">
      <div className="h-8 w-8 rounded-full border-2 border-noviq-border border-t-noviq-gold animate-spin" />
    </main>
  );
}

function StorefrontRouteProviders() {
  return (
    <StoreSettingsProvider>
      <StoreCatalogProvider>
        <CartProvider>
          <Outlet />
        </CartProvider>
      </StoreCatalogProvider>
    </StoreSettingsProvider>
  );
}

function AdminRouteProviders() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StorefrontAnalyticsTracker />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route element={<StorefrontRouteProviders />}>
            <Route element={<StoreLayout />}>
              <Route index element={<HomePage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="product/:slug" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
            </Route>
          </Route>

          <Route element={<AdminRouteProviders />}>
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route element={<ProtectedAdminRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="*" element={<AdminNotFoundPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
