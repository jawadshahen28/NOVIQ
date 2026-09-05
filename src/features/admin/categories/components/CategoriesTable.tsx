import type { Category } from '../../../../types/catalog';

interface CategoriesTableProps {
  categories: Category[];
  getProductCount: (categorySlug: string) => number;
  onDeleteCategory: (category: Category) => void;
  onEditCategory: (category: Category) => void;
}

export default function CategoriesTable({
  categories,
  getProductCount,
  onDeleteCategory,
  onEditCategory,
}: CategoriesTableProps) {
  return (
    <div
      className="hidden overflow-hidden rounded-md border border-noviq-border bg-noviq-card lg:block"
      data-categories-table
    >
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full border-collapse text-right">
          <thead className="bg-noviq-secondary text-xs font-semibold text-noviq-secondaryText">
            <tr>
              <th className="border-b border-noviq-border px-4 py-3">الصورة</th>
              <th className="border-b border-noviq-border px-4 py-3">اسم الفئة</th>
              <th className="border-b border-noviq-border px-4 py-3">Slug</th>
              <th className="border-b border-noviq-border px-4 py-3">عدد المنتجات</th>
              <th className="border-b border-noviq-border px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-noviq-border">
            {categories.map((category) => (
              <tr
                className="transition hover:bg-noviq-secondary"
                key={category.id}
                data-category-table-row={category.id}
              >
                <td className="px-4 py-4">
                  <img
                    alt={category.name}
                    className="h-14 w-20 rounded-md border border-noviq-border object-cover"
                    src={category.image}
                  />
                </td>
                <td className="max-w-[360px] px-4 py-4">
                  <p className="font-semibold text-noviq-text">{category.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-noviq-muted">
                    {category.description || 'لا يوجد وصف مختصر'}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-noviq-secondaryText" dir="ltr">
                  {category.slug}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-noviq-secondaryText">
                  {getProductCount(category.slug)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-noviq-border px-3 text-xs font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                      onClick={() => onEditCategory(category)}
                      type="button"
                      data-category-edit={category.id}
                    >
                      تعديل
                    </button>
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-500/35 px-3 text-xs font-semibold text-red-200 transition hover:border-red-400"
                      onClick={() => onDeleteCategory(category)}
                      type="button"
                      data-category-delete={category.id}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
