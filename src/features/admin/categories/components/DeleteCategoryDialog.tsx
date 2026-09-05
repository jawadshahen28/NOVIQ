import type { Category } from '../../../../types/catalog';

interface DeleteCategoryDialogProps {
  category: Category | null;
  productCount: number;
  onCancel: () => void;
  onConfirm: (categoryId: string) => void;
}

export default function DeleteCategoryDialog({
  category,
  productCount,
  onCancel,
  onConfirm,
}: DeleteCategoryDialogProps) {
  if (!category) {
    return null;
  }

  const hasProducts = productCount > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-category-title"
      data-delete-category-dialog
    >
      <div className="w-full max-w-md rounded-md border border-noviq-border bg-noviq-card p-5">
        <p id="delete-category-title" className="text-base font-bold text-noviq-text">
          هل أنت متأكد من حذف هذه الفئة؟
        </p>

        {hasProducts ? (
          <p
            className="mt-3 rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm font-semibold leading-7 text-red-200"
            role="alert"
            data-delete-category-blocked
          >
            لا يمكن حذف هذه الفئة لأنها تحتوي على منتجات.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-7 text-noviq-secondaryText">
            سيتم حذف الفئة من القائمة المؤقتة داخل لوحة الإدارة فقط.
          </p>
        )}

        <p className="mt-4 rounded-md border border-noviq-border bg-noviq-secondary px-3 py-2 text-sm font-semibold text-noviq-text">
          {category.name}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {!hasProducts ? (
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-500/50 bg-red-500/10 px-4 text-sm font-semibold text-red-200 transition hover:border-red-400"
              onClick={() => onConfirm(category.id)}
              type="button"
              data-delete-category-confirm
            >
              حذف الفئة
            </button>
          ) : null}
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-border px-4 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={onCancel}
            type="button"
            data-delete-category-cancel
          >
            تراجع
          </button>
        </div>
      </div>
    </div>
  );
}
