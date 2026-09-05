import { Check, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  addToCartSuccessStyle,
  useAddToCartSuccess,
} from '../../../features/cart/hooks/useAddToCartSuccess';
import type { Product } from '../../../types/catalog';
import { formatCurrency, getDiscountedPrice } from '../../../utils/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { handleAddToCart, isSuccess } = useAddToCartSuccess(product);
  const discountedPrice = getDiscountedPrice(product);
  const hasDiscount = product.discountPercent > 0;

  return (
    <article className="group overflow-hidden rounded-md border border-noviq-border bg-noviq-card transition duration-300 hover:border-noviq-gold">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-noviq-secondary"
        aria-label={`عرض تفاصيل ${product.name}`}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-noviq-black opacity-20 transition group-hover:opacity-0" />
        {hasDiscount ? (
          <span className="absolute right-3 top-3 rounded-sm bg-noviq-gold px-3 py-1 text-xs font-bold text-noviq-black">
            خصم {product.discountPercent}%
          </span>
        ) : null}
      </Link>

      <div className="grid gap-4 p-4">
        <div>
          <Link
            to={`/product/${product.slug}`}
            className="font-heading text-base font-semibold text-noviq-text transition hover:text-noviq-gold"
          >
            {product.name}
          </Link>
          <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-6 text-noviq-secondaryText">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex min-h-11 items-center justify-between gap-4 border-t border-noviq-border pt-4">
          <div>
            <p className="text-base font-bold text-noviq-gold">
              {formatCurrency(discountedPrice)}
            </p>
            {hasDiscount ? (
              <p className="mt-1 text-xs text-noviq-muted line-through">
                {formatCurrency(product.price)}
              </p>
            ) : null}
          </div>
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-border bg-noviq-secondary text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold disabled:cursor-not-allowed disabled:text-noviq-muted"
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.stock <= 0 || isSuccess}
            type="button"
            aria-label={
              isSuccess
                ? `تمت إضافة ${product.name} إلى السلة`
                : `إضافة ${product.name} إلى السلة`
            }
            aria-live="polite"
            data-add-to-cart-button
            data-add-to-cart-success={isSuccess ? 'true' : undefined}
            style={isSuccess ? addToCartSuccessStyle : undefined}
          >
            {isSuccess ? <Check size={17} strokeWidth={2.2} /> : <ShoppingBag size={17} />}
          </button>
        </div>
      </div>
    </article>
  );
}
