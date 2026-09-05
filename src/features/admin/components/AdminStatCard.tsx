import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export default function AdminStatCard({ label, value, hint, icon: Icon }: AdminStatCardProps) {
  return (
    <div className="rounded-md border border-noviq-border bg-noviq-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-noviq-secondaryText">{label}</p>
          <p className="mt-2 text-2xl font-bold text-noviq-text">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
          <Icon size={20} />
        </div>
      </div>
      <p className="border-t border-noviq-border pt-4 text-xs text-noviq-muted">{hint}</p>
    </div>
  );
}
