import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { adminNavigationItems } from '../adminNavigation';

interface AdminSidebarProps {
  className?: string;
  onClose?: () => void;
  onNavigate?: () => void;
  showCloseButton?: boolean;
}

export default function AdminSidebar({
  className = '',
  onClose,
  onNavigate,
  showCloseButton = false,
}: AdminSidebarProps) {
  return (
    <aside
      className={`flex h-full flex-col border-l border-noviq-border bg-noviq-secondary text-noviq-text ${className}`}
      data-admin-sidebar
    >
      <div className="flex min-h-20 items-center justify-between gap-4 border-b border-noviq-border px-5">
        <div className="min-w-0">
          <p className="font-brand text-[27px] font-medium tracking-[0.08em] text-noviq-gold">
            NOVIQ
          </p>
          <p className="mt-1 text-xs font-semibold text-noviq-secondaryText">لوحة الإدارة</p>
        </div>

        {showCloseButton ? (
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold lg:hidden"
            onClick={onClose}
            type="button"
            aria-label="إغلاق قائمة الإدارة"
            data-admin-drawer-close
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <nav className="grid gap-1 px-3 py-5" aria-label="قائمة الإدارة" data-admin-nav>
        {adminNavigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-md border px-3.5 text-sm font-semibold transition ${
                  isActive
                    ? 'border-noviq-gold/60 bg-noviq-card text-noviq-gold'
                    : 'border-transparent text-noviq-secondaryText hover:border-noviq-border hover:bg-noviq-card hover:text-noviq-text'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-noviq-border px-5 py-5 text-xs leading-6 text-noviq-muted">
        <p className="font-semibold text-noviq-secondaryText">واجهة إدارة مؤقتة</p>
        <p>سيتم ربط المصادقة الآمنة مع الباكند لاحقاً.</p>
      </div>
    </aside>
  );
}
