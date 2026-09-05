import {
  Banknote,
  ReceiptText,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import type { ReportKpi } from '../reportAdminUtils';

interface ReportKpiGridProps {
  kpis: ReportKpi[];
}

const kpiIcons: Record<string, LucideIcon> = {
  sales: Banknote,
  profit: WalletCards,
  orders: ReceiptText,
  average: TrendingUp,
};

export default function ReportKpiGrid({ kpis }: ReportKpiGridProps) {
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4" data-report-kpi-grid>
      {kpis.map((kpi) => {
        const Icon = kpiIcons[kpi.id] ?? TrendingUp;

        return (
          <article
            className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-4"
            data-report-kpi-card={kpi.id}
            key={kpi.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-noviq-secondaryText">{kpi.label}</p>
                <p className="mt-2 truncate text-2xl font-bold text-noviq-text" data-report-kpi-value>
                  {kpi.value}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
                <Icon size={19} strokeWidth={1.8} />
              </div>
            </div>
            <p className="mt-4 border-t border-noviq-border pt-3 text-xs leading-6 text-noviq-muted">
              {kpi.hint}
            </p>
          </article>
        );
      })}
    </div>
  );
}
