import type { OrderStatus } from '../../../../types/catalog';

export type OrderSummaryCounts = Record<'all' | OrderStatus, number>;

interface OrdersSummaryProps {
  counts: OrderSummaryCounts;
  statuses: OrderStatus[];
}

export default function OrdersSummary({ counts, statuses }: OrdersSummaryProps) {
  return (
    <div
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      data-orders-summary
    >
      <article className="rounded-md border border-noviq-border bg-noviq-card px-4 py-3">
        <p className="text-xs font-semibold text-noviq-secondaryText">كل الطلبات</p>
        <p className="mt-2 text-2xl font-bold leading-none text-noviq-text">{counts.all}</p>
      </article>

      {statuses.map((status) => (
        <article
          className="rounded-md border border-noviq-border bg-noviq-card px-4 py-3"
          key={status}
        >
          <p className="text-xs font-semibold text-noviq-secondaryText">{status}</p>
          <p className="mt-2 text-2xl font-bold leading-none text-noviq-text">{counts[status]}</p>
        </article>
      ))}
    </div>
  );
}
