import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './features/admin/auth/AdminAuthContext';
import ProtectedAdminRoute from './features/admin/auth/ProtectedAdminRoute';
import { CartProvider } from './features/cart/CartContext';
import { StoreCatalogProvider } from './features/store/catalog/StoreCatalogContext';
import AdminLayout from './layouts/AdminLayout';
import StoreLayout from './layouts/StoreLayout';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminInventoryPage from './pages/AdminInventoryPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminNotFoundPage from './pages/AdminNotFoundPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import CartPage from './pages/CartPage';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProductPage from './pages/ProductPage';

export default function App() {
  return (
    <StoreCatalogProvider>
      <CartProvider>
        <AdminAuthProvider>
          <BrowserRouter>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<HomePage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="product/:slug" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-success" element={<OrderSuccessPage />} />
            </Route>

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
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="*" element={<AdminNotFoundPage />} />
              </Route>
            </Route>

            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </CartProvider>
    </StoreCatalogProvider>
  );
}
