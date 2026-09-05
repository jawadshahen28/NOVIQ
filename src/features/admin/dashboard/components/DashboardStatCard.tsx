import type { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export default function DashboardStatCard({
  label,
  value,
  hint,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <article
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-dashboard-kpi-card
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-noviq-secondaryText">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold leading-tight text-noviq-text sm:text-[1.65rem]">
            {value}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-noviq-gold/60 text-noviq-gold">
          <Icon size={20} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-5 border-t border-noviq-border pt-4 text-xs leading-6 text-noviq-muted">
        {hint}
      </p>
    </article>
  );
}
