interface CategoriesSummaryProps {
  active: number;
  linkedProducts: number;
  total: number;
}

const summaryItems = [
  { key: 'total', label: 'إجمالي الفئات' },
  { key: 'active', label: 'الفئات النشطة' },
  { key: 'linkedProducts', label: 'عدد المنتجات المرتبطة بالفئات' },
] as const;

export default function CategoriesSummary({
  active,
  linkedProducts,
  total,
}: CategoriesSummaryProps) {
  const counts = { active, linkedProducts, total };

  return (
    <div className="grid gap-2 sm:grid-cols-3" data-categories-summary>
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
