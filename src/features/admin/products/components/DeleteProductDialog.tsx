import type { Product } from '../../../../types/catalog';

interface DeleteProductDialogProps {
  product: Product | null;
  onCancel: () => void;
  onConfirm: (productId: string) => void;
}

export default function DeleteProductDialog({
  product,
  onCancel,
  onConfirm,
}: DeleteProductDialogProps) {
  if (!product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
      data-delete-product-dialog
    >
      <div className="w-full max-w-md rounded-md border border-noviq-border bg-noviq-card p-5">
        <p id="delete-product-title" className="text-base font-bold text-noviq-text">
          هل أنت متأكد من حذف هذا المنتج؟
        </p>
        <p className="mt-2 text-sm leading-7 text-noviq-secondaryText">
          لن تتمكن من التراجع عن هذا الإجراء في النسخة الحقيقية لاحقاً.
        </p>
        <p className="mt-4 rounded-md border border-noviq-border bg-noviq-secondary px-3 py-2 text-sm font-semibold text-noviq-text">
          {product.name}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-500/50 bg-red-500/10 px-4 text-sm font-semibold text-red-200 transition hover:border-red-400"
            onClick={() => onConfirm(product.id)}
            type="button"
            data-delete-product-confirm
          >
            حذف المنتج
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-border px-4 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={onCancel}
            type="button"
            data-delete-product-cancel
          >
            تراجع
          </button>
        </div>
      </div>
    </div>
  );
}
