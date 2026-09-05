import type { ReportTrendPoint } from '../reportAdminUtils';

interface SalesProfitChartProps {
  points: ReportTrendPoint[];
}

const chartWidth = 760;
const chartHeight = 270;
const chartPadding = {
  top: 24,
  right: 28,
  bottom: 48,
  left: 28,
};

export default function SalesProfitChart({ points }: SalesProfitChartProps) {
  const maxValue = Math.max(
    ...points.flatMap((point) => [point.revenue, point.profit]),
    1,
  );
  const baseline = chartHeight - chartPadding.bottom;
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  function getX(index: number) {
    if (points.length <= 1) {
      return chartPadding.left + innerWidth / 2;
    }

    return chartPadding.left + (innerWidth / (points.length - 1)) * index;
  }

  function getY(value: number) {
    return chartPadding.top + innerHeight - (value / maxValue) * innerHeight;
  }

  function createLinePath(key: 'revenue' | 'profit') {
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point[key])}`)
      .join(' ');
  }

  const revenuePath = createLinePath('revenue');
  const profitPath = createLinePath('profit');
  const areaPath =
    points.length > 0
      ? `${revenuePath} L ${getX(points.length - 1)} ${baseline} L ${getX(0)} ${baseline} Z`
      : '';
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <section
      className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-reports-sales-profit-chart
    >
      <div className="mb-5 flex flex-col gap-3 border-b border-noviq-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-noviq-gold">المبيعات</p>
          <h3 className="mt-2 text-lg font-bold text-noviq-text">أداء المبيعات</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-noviq-secondaryText">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-sm bg-noviq-gold" />
            المبيعات
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-sm bg-noviq-darkGold" />
            الأرباح
          </span>
        </div>
      </div>

      {points.length === 0 ? (
        <p className="rounded-md border border-dashed border-noviq-border bg-noviq-secondary p-5 text-sm leading-7 text-noviq-muted">
          لا توجد بيانات مبيعات كافية لهذه الفترة.
        </p>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-md border border-noviq-border bg-noviq-secondary p-2 sm:p-3">
          <svg
            aria-label="رسم بياني للمبيعات والأرباح"
            className="block h-[220px] w-full sm:h-64"
            preserveAspectRatio="none"
            role="img"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <defs>
              <linearGradient id="reportsSalesArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(198 160 74)" stopOpacity="0.24" />
                <stop offset="100%" stopColor="rgb(198 160 74)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {gridLines.map((ratio) => {
              const y = chartPadding.top + innerHeight * ratio;

              return (
                <line
                  key={ratio}
                  stroke="rgb(41 42 39)"
                  strokeWidth="1"
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={y}
                  y2={y}
                />
              );
            })}

            {areaPath ? <path d={areaPath} fill="url(#reportsSalesArea)" /> : null}
            <path d={revenuePath} fill="none" stroke="rgb(198 160 74)" strokeLinecap="round" strokeWidth="4" />
            <path d={profitPath} fill="none" stroke="rgb(128 101 45)" strokeLinecap="round" strokeWidth="3" />

            {points.map((point, index) => {
              const x = getX(index);
              const revenueY = getY(point.revenue);
              const profitY = getY(point.profit);

              return (
                <g key={point.id}>
                  <circle cx={x} cy={revenueY} fill="rgb(8 10 9)" r="6" stroke="rgb(198 160 74)" strokeWidth="3">
                    <title>{`${point.label}: ${point.formattedRevenue}`}</title>
                  </circle>
                  <circle cx={x} cy={profitY} fill="rgb(8 10 9)" r="5" stroke="rgb(128 101 45)" strokeWidth="3">
                    <title>{`${point.label}: ${point.formattedProfit}`}</title>
                  </circle>
                  <text
                    fill="rgb(181 178 170)"
                    fontSize="12"
                    textAnchor="middle"
                    x={x}
                    y={chartHeight - 18}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
