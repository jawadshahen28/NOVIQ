import type { SalesTrendPoint } from '../dashboardData';

interface SalesChartProps {
  points: SalesTrendPoint[];
}

const chartWidth = 720;
const chartHeight = 260;
const chartPadding = {
  top: 22,
  right: 24,
  bottom: 48,
  left: 24,
};

export default function SalesChart({ points }: SalesChartProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
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

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`)
    .join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${getX(points.length - 1)} ${baseline} L ${getX(0)} ${baseline} Z`
      : '';

  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <section
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-dashboard-sales-chart
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-noviq-gold">المبيعات</p>
          <h3 className="mt-2 text-lg font-bold text-noviq-text">المبيعات خلال آخر 7 أيام</h3>
        </div>
        <p className="text-xs leading-6 text-noviq-muted">بيانات تجريبية للواجهة فقط</p>
      </div>

      {points.length === 0 ? (
        <p className="rounded-md border border-dashed border-noviq-border bg-noviq-secondary p-5 text-sm leading-7 text-noviq-muted">
          لا توجد بيانات مبيعات كافية لعرض الرسم الآن.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-noviq-border bg-noviq-secondary p-2 sm:p-3">
          <svg
            className="block h-[220px] w-full sm:h-64"
            role="img"
            aria-label="رسم بياني لمبيعات آخر 7 أيام"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="dashboardSalesArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(198 160 74)" stopOpacity="0.24" />
                <stop offset="100%" stopColor="rgb(198 160 74)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {gridLines.map((ratio) => {
              const y = chartPadding.top + innerHeight * ratio;

              return (
                <line
                  key={ratio}
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={y}
                  y2={y}
                  stroke="rgb(41 42 39)"
                  strokeWidth="1"
                />
              );
            })}

            {areaPath ? <path d={areaPath} fill="url(#dashboardSalesArea)" /> : null}
            <path d={linePath} fill="none" stroke="rgb(198 160 74)" strokeLinecap="round" strokeWidth="4" />

            {points.map((point, index) => {
              const x = getX(index);
              const y = getY(point.value);

              return (
                <g key={point.label}>
                  <circle cx={x} cy={y} fill="rgb(8 10 9)" r="7" stroke="rgb(198 160 74)" strokeWidth="4">
                    <title>{`${point.label}: ${point.formattedValue}`}</title>
                  </circle>
                  <text
                    x={x}
                    y={chartHeight - 18}
                    fill="rgb(181 178 170)"
                    fontSize="13"
                    textAnchor="middle"
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
