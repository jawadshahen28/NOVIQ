import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AdminAuthProvider } from './features/admin/auth/AdminAuthContext';
import ProtectedAdminRoute from './features/admin/auth/ProtectedAdminRoute';
import { CartProvider } from './features/cart/CartContext';
import { StoreCatalogProvider } from './features/store/catalog/StoreCatalogContext';
import { StoreSettingsProvider } from './features/store/settings/StoreSettingsContext';
import StoreLayout from './layouts/StoreLayout';
import CartPage from './pages/CartPage';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProductPage from './pages/ProductPage';
import { trackStorefrontRoute } from './services/analyticsApi';

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
    trackStorefrontRoute(`${location.pathname}${location.search}`);
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
