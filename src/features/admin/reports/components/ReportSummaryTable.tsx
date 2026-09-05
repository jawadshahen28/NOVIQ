import type { ReportPeriodSummary } from '../reportAdminUtils';
import { formatCurrency } from '../../../../utils/format';

interface ReportSummaryTableProps {
  rows: ReportPeriodSummary[];
}

export default function ReportSummaryTable({ rows }: ReportSummaryTableProps) {
  return (
    <section
      className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-report-summary-table
    >
      <div className="mb-5 border-b border-noviq-border pb-4">
        <p className="text-xs font-semibold text-noviq-gold">التفاصيل</p>
        <h3 className="mt-2 text-lg font-bold text-noviq-text">ملخص الفترة</h3>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <table className="min-w-[620px] w-full border-collapse text-right">
          <thead className="bg-noviq-secondary text-xs font-semibold text-noviq-secondaryText">
            <tr>
              <th className="border-b border-noviq-border px-4 py-3">الفترة / التاريخ</th>
              <th className="border-b border-noviq-border px-4 py-3">عدد الطلبات</th>
              <th className="border-b border-noviq-border px-4 py-3">المبيعات</th>
              <th className="border-b border-noviq-border px-4 py-3">الربح</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-noviq-border">
            {rows.map((row) => (
              <tr data-report-summary-row={row.id} key={row.id}>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-noviq-text">
                  {row.label}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-noviq-secondaryText">
                  {row.orderCount}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-noviq-gold">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-noviq-secondaryText">
                  {formatCurrency(row.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
