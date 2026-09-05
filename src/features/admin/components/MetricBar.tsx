interface MetricBarProps {
  label: string;
  value: string;
  percent: number;
}

export default function MetricBar({ label, value, percent }: MetricBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-noviq-text">{label}</span>
        <span className="text-noviq-secondaryText">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-noviq-border">
        <div
          className="h-full rounded-sm bg-noviq-gold"
          style={{ width: `${Math.max(4, Math.min(percent, 100))}%` }}
        />
      </div>
    </div>
  );
}
