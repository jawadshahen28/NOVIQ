import MetricBar from '../../components/MetricBar';
import StatusBadge from '../../components/StatusBadge';
import type { ReportStatusItem } from '../reportAdminUtils';

interface OrderStatusSummaryProps {
  items: ReportStatusItem[];
}

export default function OrderStatusSummary({ items }: OrderStatusSummaryProps) {
  return (
    <section
      className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-report-status-summary
    >
      <div className="mb-5 border-b border-noviq-border pb-4">
        <p className="text-xs font-semibold text-noviq-gold">الطلبات</p>
        <h3 className="mt-2 text-lg font-bold text-noviq-text">ملخص حالات الطلبات</h3>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div className="grid gap-3" data-report-status-row={item.status} key={item.status}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={item.status} />
              <span className="text-sm font-bold text-noviq-text" data-report-status-count>
                {item.count}
              </span>
            </div>
            <MetricBar label={item.status} percent={item.percent} value={`${item.percent}%`} />
          </div>
        ))}
      </div>
    </section>
  );
}
