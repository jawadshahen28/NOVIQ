import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Tags,
  type LucideIcon,
} from 'lucide-react';

export interface AdminNavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const adminNavigationItems: AdminNavigationItem[] = [
  { label: 'لوحة التحكم', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'الطلبات', to: '/admin/orders', icon: ReceiptText },
  { label: 'المنتجات', to: '/admin/products', icon: Package },
  { label: 'الفئات', to: '/admin/categories', icon: Tags },
  { label: 'المخزون', to: '/admin/inventory', icon: Boxes },
  { label: 'التقارير', to: '/admin/reports', icon: BarChart3 },
  { label: 'الإعدادات', to: '/admin/settings', icon: Settings },
];

export function getAdminPageTitle(pathname: string) {
  const currentItem = adminNavigationItems.find((item) => pathname.startsWith(item.to));

  return currentItem?.label ?? 'لوحة الإدارة';
}
