import type { LucideIcon } from 'lucide-react';

interface OrderMetricCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export default function OrderMetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: OrderMetricCardProps) {
  return (
    <article
      className="flex min-h-32 flex-col justify-between rounded-md border border-noviq-border bg-noviq-secondary p-4"
      data-dashboard-order-metric-card
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-secondaryText">{label}</p>
          <p className="mt-2 text-2xl font-bold leading-none text-noviq-text">{value}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-border text-noviq-gold">
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-4 text-xs leading-6 text-noviq-muted">{hint}</p>
    </article>
  );
}
