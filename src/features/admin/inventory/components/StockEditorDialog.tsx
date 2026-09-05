import { Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Product } from '../../../../types/catalog';
import { getStockCondition } from '../../products/productAdminUtils';
import ProductStockBadge from '../../products/components/ProductStockBadge';

interface StockEditorDialogProps {
  product: Product | null;
  onClose: () => void;
  onSave: (productId: string, stock: number) => void;
}

function parseStock(value: string) {
  const stock = Number(value);

  return Number.isInteger(stock) ? stock : null;
}

export default function StockEditorDialog({
  product,
  onClose,
  onSave,
}: StockEditorDialogProps) {
  const [stockValue, setStockValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product) {
      return;
    }

    setStockValue(String(product.stock));
    setError('');
  }, [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, product]);

  const previewStock = useMemo(() => {
    const stock = parseStock(stockValue);

    return stock !== null && stock >= 0 ? stock : product?.stock ?? 0;
  }, [product?.stock, stockValue]);

  if (!product) {
    return null;
  }

  const activeProduct = product;

  function adjustStock(delta: number) {
    const currentStock = parseStock(stockValue) ?? 0;
    setStockValue(String(Math.max(0, currentStock + delta)));
    setError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const stock = parseStock(stockValue);

    if (stock === null || stock < 0) {
      setError('يرجى إدخال كمية صحيحة بدون أرقام سالبة');
      return;
    }

    onSave(activeProduct.id, stock);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-editor-title"
      data-stock-editor-dialog
    >
      <form
        className="w-full max-w-md rounded-md border border-noviq-border bg-noviq-card p-5"
        onSubmit={handleSubmit}
        noValidate
        data-stock-editor-form
      >
        <p className="text-xs font-semibold text-noviq-gold">تعديل المخزون</p>
        <h3 id="stock-editor-title" className="mt-2 text-lg font-bold text-noviq-text">
          {activeProduct.name}
        </h3>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-noviq-border bg-noviq-secondary px-3 py-3">
          <div>
            <p className="text-xs text-noviq-muted">الكمية الحالية</p>
            <p className="mt-1 text-xl font-bold leading-none text-noviq-text">{activeProduct.stock}</p>
          </div>
          <ProductStockBadge status={getStockCondition(previewStock)} />
        </div>

        <label className="mt-5 grid gap-2 text-sm font-semibold text-noviq-secondaryText">
          <span>الكمية الجديدة</span>
          <span className="grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2">
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
              onClick={() => adjustStock(-1)}
              type="button"
              aria-label="إنقاص الكمية"
              data-stock-decrement
            >
              <Minus size={16} strokeWidth={1.8} />
            </button>
            <input
              aria-describedby={error ? 'stock-editor-error' : undefined}
              aria-invalid={Boolean(error)}
              className="field text-center"
              inputMode="numeric"
              min="0"
              onChange={(event) => {
                setStockValue(event.target.value);
                setError('');
              }}
              step="1"
              type="number"
              value={stockValue}
              data-stock-quantity-input
            />
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
              onClick={() => adjustStock(1)}
              type="button"
              aria-label="زيادة الكمية"
              data-stock-increment
            >
              <Plus size={16} strokeWidth={1.8} />
            </button>
          </span>
          {error ? (
            <span id="stock-editor-error" className="text-xs font-medium text-noviq-gold">
              {error}
            </span>
          ) : null}
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-gold bg-noviq-gold px-4 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
            type="submit"
            data-stock-save
          >
            حفظ الكمية
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-border px-4 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={onClose}
            type="button"
            data-stock-cancel
          >
            تراجع
          </button>
        </div>
      </form>
    </div>
  );
}
