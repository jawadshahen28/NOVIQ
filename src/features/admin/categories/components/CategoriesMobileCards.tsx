import type { Category } from '../../../../types/catalog';

interface CategoriesMobileCardsProps {
  categories: Category[];
  getProductCount: (categorySlug: string) => number;
  onDeleteCategory: (category: Category) => void;
  onEditCategory: (category: Category) => void;
}

export default function CategoriesMobileCards({
  categories,
  getProductCount,
  onDeleteCategory,
  onEditCategory,
}: CategoriesMobileCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden" data-categories-mobile-cards>
      {categories.map((category) => (
        <article
          className="rounded-md border border-noviq-border bg-noviq-card p-4"
          key={category.id}
          data-category-mobile-card={category.id}
        >
          <div className="grid grid-cols-[82px_minmax(0,1fr)] gap-3">
            <img
              alt={category.name}
              className="h-[70px] w-[82px] rounded-md border border-noviq-border object-cover"
              src={category.image}
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-bold leading-6 text-noviq-text">
                {category.name}
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-noviq-secondaryText" dir="ltr">
                {category.slug}
              </p>
              <p className="mt-2 text-xs text-noviq-muted">
                {getProductCount(category.slug)} منتج
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-noviq-border px-3 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
              onClick={() => onEditCategory(category)}
              type="button"
              data-category-edit={category.id}
            >
              تعديل
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-red-500/35 px-3 text-sm font-semibold text-red-200 transition hover:border-red-400"
              onClick={() => onDeleteCategory(category)}
              type="button"
              data-category-delete={category.id}
            >
              حذف
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
