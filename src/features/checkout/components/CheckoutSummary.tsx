import { Link } from 'react-router-dom';
import { useCart } from '../../cart/CartContext';
import { getDeliveryRegionOption } from '../../../config/delivery';
import { formatCurrency, getDiscountedPrice } from '../../../utils/format';
import { getOptimizedImageUrl } from '../../../utils/responsiveImages';

interface CheckoutSummaryProps {
  deliveryRegion: string;
}

const chooseDeliveryRegionText = 'اختر منطقة التوصيل';

export default function CheckoutSummary({ deliveryRegion }: CheckoutSummaryProps) {
  const { items, subtotal } = useCart();
  const selectedDeliveryRegion = getDeliveryRegionOption(deliveryRegion);
  const shipping = selectedDeliveryRegion?.fee;
  const total = shipping === undefined ? undefined : subtotal + shipping;

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
                src={getOptimizedImageUrl(item.product.images[0], 180)}
                alt={item.product.name}
                className="h-full w-full object-cover"
                decoding="async"
                loading="lazy"
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
        <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
          <span>منطقة التوصيل</span>
          <span className="text-left" data-checkout-delivery-region>
            {selectedDeliveryRegion?.label ?? chooseDeliveryRegionText}
          </span>
        </div>
        <div className="flex items-center justify-between text-noviq-secondaryText">
          <span>التوصيل</span>
          <span data-checkout-delivery-fee>
            {shipping === undefined ? chooseDeliveryRegionText : formatCurrency(shipping)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-noviq-border pt-4 text-base font-bold text-noviq-text">
          <span>الإجمالي</span>
          <span className="text-noviq-gold" data-checkout-total>
            {total === undefined ? chooseDeliveryRegionText : formatCurrency(total)}
          </span>
        </div>
      </div>
    </aside>
  );
}
