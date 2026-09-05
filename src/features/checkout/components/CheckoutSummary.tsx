import { Link } from 'react-router-dom';
import { useCart } from '../../cart/CartContext';
import { formatCurrency, getDiscountedPrice } from '../../../utils/format';

export default function CheckoutSummary() {
  const { items, subtotal } = useCart();
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  return (
    <aside
      className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5 lg:sticky lg:top-28"
      data-checkout-summary
    >
      <h2 className="font-heading text-lg font-bold text-noviq-text">ملخص الطلب</h2>

      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-noviq-border pb-4 last:border-b-0"
            data-checkout-line
          >
            <Link
              to={`/product/${item.product.slug}`}
              className="aspect-square overflow-hidden rounded-md border border-noviq-border bg-noviq-secondary"
            >
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold leading-6 text-noviq-text">
                {item.product.name}
              </p>
              <p className="mt-1 text-xs text-noviq-muted">الكمية: {item.quantity}</p>
              <p className="mt-2 text-sm font-bold text-noviq-gold">
                {formatCurrency(getDiscountedPrice(item.product) * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 border-t border-noviq-border pt-5 text-sm">
        <div className="flex items-center justify-between text-noviq-secondaryText">
          <span>المجموع الفرعي</span>
          <span data-checkout-subtotal>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-noviq-secondaryText">
          <span>التوصيل</span>
          <span>{shipping === 0 ? 'مجاني' : formatCurrency(shipping)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-noviq-border pt-4 text-base font-bold text-noviq-text">
          <span>الإجمالي</span>
          <span className="text-noviq-gold" data-checkout-total>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </aside>
  );
}
