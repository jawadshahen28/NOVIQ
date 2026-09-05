interface ProductsSummaryProps {
  total: number;
  available: number;
  lowStock: number;
  outOfStock: number;
}

const summaryItems = [
  { key: 'total', label: 'إجمالي المنتجات' },
  { key: 'available', label: 'المنتجات المتوفرة' },
  { key: 'lowStock', label: 'المخزون المنخفض' },
  { key: 'outOfStock', label: 'المنتجات النافدة' },
] as const;

export default function ProductsSummary({
  total,
  available,
  lowStock,
  outOfStock,
}: ProductsSummaryProps) {
  const counts = { total, available, lowStock, outOfStock };

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-products-summary>
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
