import { Check, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  addToCartSuccessStyle,
  useAddToCartSuccess,
} from '../../cart/hooks/useAddToCartSuccess';
import type { Product } from '../../../types/catalog';
import { formatCurrency, getDiscountedPrice } from '../../../utils/format';
import { getResponsiveImageProps } from '../../../utils/responsiveImages';

const imagePositions = ['34% center', '43% center', '50% center', '28% center'];
const productCardImageSizes =
  '(max-width: 639px) calc(50vw - 18px), (max-width: 1023px) calc(50vw - 24px), 255px';
const productCardImageWidths = [220, 360, 480, 640] as const;

interface HomeProductCardProps {
  product: Product;
  index: number;
}

export default function HomeProductCard({ product, index }: HomeProductCardProps) {
  const { handleAddToCart, isSuccess } = useAddToCartSuccess(product);
  const discountedPrice = getDiscountedPrice(product);
  const hasDiscount = product.discountPercent > 0;

  return (
    <article
      className="home-reveal group overflow-hidden rounded-[5px] border border-noviq-productBorder bg-noviq-card transition duration-300 hover:-translate-y-[3px] hover:border-noviq-gold"
      style={{ animationDelay: `${index * 60}ms` }}
      data-home-product-card
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-noviq-pure sm:aspect-[4/5] lg:h-[255px] lg:aspect-auto"
        aria-label={`عرض ${product.name}`}
      >
        <img
          {...getResponsiveImageProps(product.images[0], {
            fallbackWidth: 480,
            sizes: productCardImageSizes,
            widths: productCardImageWidths,
          })}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
          style={{ objectPosition: imagePositions[index % imagePositions.length] }}
          decoding="async"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-noviq-black opacity-20" />
        {hasDiscount ? (
          <span className="absolute right-2 top-2 rounded-sm bg-noviq-darkGold px-2 py-0.5 text-[10px] font-semibold text-noviq-text sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            -{product.discountPercent}%
          </span>
        ) : null}
      </Link>

      <div className="grid gap-2.5 p-2.5 sm:gap-3 sm:p-4">
        <div>
          <Link
            to={`/product/${product.slug}`}
            className="line-clamp-2 font-heading text-[13px] font-semibold leading-5 text-noviq-text transition hover:text-noviq-gold sm:text-sm sm:leading-6"
          >
            {product.name}
          </Link>
          <p className="mt-1 line-clamp-1 text-[11px] leading-5 text-noviq-productText sm:text-xs sm:leading-6">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex min-h-9 items-end justify-between gap-2 sm:min-h-10 sm:gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-noviq-gold sm:text-base">
              {formatCurrency(discountedPrice)}
            </p>
            {hasDiscount ? (
              <p className="truncate text-[10px] text-noviq-muted line-through sm:text-xs">
                {formatCurrency(product.price)}
              </p>
            ) : null}
          </div>

          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-noviq-darkGold text-noviq-text transition duration-200 hover:bg-noviq-goldHover hover:text-noviq-black disabled:cursor-not-allowed disabled:bg-noviq-border disabled:text-noviq-muted min-[390px]:h-9 min-[390px]:w-9"
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
            {isSuccess ? (
              <Check size={15} strokeWidth={2.2} />
            ) : (
              <ShoppingCart size={15} strokeWidth={1.9} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
