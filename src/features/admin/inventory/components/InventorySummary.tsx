interface InventorySummaryProps {
  totalUnits: number;
  availableProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

const summaryItems = [
  { key: 'totalUnits', label: 'إجمالي الوحدات في المخزون' },
  { key: 'availableProducts', label: 'المنتجات المتوفرة' },
  { key: 'lowStockProducts', label: 'المخزون المنخفض' },
  { key: 'outOfStockProducts', label: 'المنتجات النافدة' },
] as const;

export default function InventorySummary({
  totalUnits,
  availableProducts,
  lowStockProducts,
  outOfStockProducts,
}: InventorySummaryProps) {
  const counts = { availableProducts, lowStockProducts, outOfStockProducts, totalUnits };

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-inventory-summary>
      {summaryItems.map((item) => (
        <article
          className="rounded-md border border-noviq-border bg-noviq-card px-4 py-3"
          key={item.key}
        >
          <p className="text-xs font-semibold text-noviq-secondaryText">{item.label}</p>
          <p className="mt-2 text-2xl font-bold leading-none text-noviq-text">
            {counts[item.key]}
          </p>
        </article>
      ))}
    </div>
  );
}
