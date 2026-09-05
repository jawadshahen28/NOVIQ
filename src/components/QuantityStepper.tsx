import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export default function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
}: QuantityStepperProps) {
  return (
    <div className="inline-grid grid-cols-[44px_52px_44px] overflow-hidden rounded-md border border-noviq-border bg-noviq-secondary">
      <button
        aria-label="زيادة الكمية"
        className="flex h-11 items-center justify-center text-noviq-secondaryText transition hover:bg-noviq-card hover:text-noviq-gold disabled:text-noviq-muted"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        type="button"
      >
        <Plus size={16} />
      </button>
      <span className="flex h-11 items-center justify-center border-x border-noviq-border text-sm font-semibold text-noviq-text">
        {value}
      </span>
      <button
        aria-label="تقليل الكمية"
        className="flex h-11 items-center justify-center text-noviq-secondaryText transition hover:bg-noviq-card hover:text-noviq-gold disabled:text-noviq-muted"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        type="button"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}
