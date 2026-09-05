import { ArrowLeft, Check, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import QuantityStepper from '../components/QuantityStepper';
import SectionHeader from '../components/SectionHeader';
import { useStoreCatalog } from '../features/store/catalog/StoreCatalogContext';
import {
  ADD_TO_CART_SUCCESS_TEXT,
  addToCartSuccessStyle,
  useAddToCartSuccess,
} from '../features/cart/hooks/useAddToCartSuccess';
import ProductGallery from '../features/products/components/ProductGallery';
import HomeProductCard from '../features/store/components/HomeProductCard';
import { formatCurrency, getDiscountedPrice, stockLabel } from '../utils/format';
import NotFoundPage from './NotFoundPage';

export default function ProductPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { categories, loadProduct, products } = useStoreCatalog();

  const product = products.find((candidate) => candidate.slug === slug);

  useEffect(() => {
    if (slug) {
      void loadProduct(slug);
    }
  }, [loadProduct, slug]);
  const { handleAddToCart, isSuccess } = useAddToCartSuccess(product, quantity);

  useEffect(() => {
    setQuantity(1);
  }, [slug]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
      .slice(0, 3);
  }, [product]);

  if (!product) {
    return <NotFoundPage />;
  }

  const category = categories.find((candidate) => candidate.slug === product.category);
  const discountedPrice = getDiscountedPrice(product);
  const isPurchasable = product.isAvailable && product.stock > 0;

  return (
    <div className="bg-noviq-black">
      <section className="border-b border-noviq-border py-6 sm:py-8 lg:py-12">
        <div className="luxury-container">
          <div className="mb-5 flex min-w-0 flex-wrap items-center gap-2 text-xs leading-6 text-noviq-muted sm:mb-7 sm:text-sm">
            <Link to="/" className="transition hover:text-noviq-gold">
              الرئيسية
            </Link>
            <span>/</span>
            {category ? (
              <Link
                to={`/category/${category.slug}`}
                className="transition hover:text-noviq-gold"
              >
                {category.name}
              </Link>
            ) : null}
            <span>/</span>
            <span className="min-w-0 text-noviq-secondaryText">{product.name}</span>
          </div>

          <div className="mx-auto grid max-w-[1180px] gap-7 lg:grid-cols-[minmax(0,560px)_minmax(0,540px)] lg:items-start lg:gap-10">
            <ProductGallery product={product} />

            <div className="min-w-0 lg:sticky lg:top-28">
              <p className="text-xs font-semibold text-noviq-gold">
                {category?.name ?? 'NOVIQ'}
              </p>
              <h1 className="mt-2.5 font-heading text-2xl font-bold leading-tight text-noviq-text min-[390px]:text-[28px] sm:text-3xl lg:text-[34px]">
                {product.name}
              </h1>
              <p
                className="mt-4 max-w-[560px] text-sm leading-7 text-noviq-secondaryText sm:text-base sm:leading-8"
                data-product-description
              >
                {product.description}
              </p>

              <div
                className="mt-5 rounded-md border border-noviq-border bg-noviq-card p-4 sm:mt-6 sm:p-5"
                data-product-purchase-card
              >
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <div className="min-w-0">
                    <p className="text-xs text-noviq-muted sm:text-sm">السعر</p>
                    <p className="mt-1 truncate text-2xl font-bold text-noviq-gold min-[390px]:text-[28px] lg:text-[32px]">
                      {formatCurrency(discountedPrice)}
                    </p>
                    {product.discountPercent > 0 ? (
                      <p className="mt-1.5 text-xs text-noviq-muted sm:text-sm">
                        بدلا من{' '}
                        <span className="line-through">{formatCurrency(product.price)}</span>
                      </p>
                    ) : null}
                  </div>

                  <span className="w-fit rounded-sm border border-noviq-border bg-noviq-secondary px-3 py-1.5 text-xs font-semibold text-noviq-secondaryText sm:py-2 sm:text-sm">
                    {stockLabel(product.stock)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                  {isPurchasable ? (
                    <div data-product-quantity>
                      <QuantityStepper
                        value={quantity}
                        max={product.stock}
                        onChange={setQuantity}
                      />
                    </div>
                  ) : null}
                  <Button
                    icon={
                      isSuccess ? (
                        <Check size={18} strokeWidth={2.2} />
                      ) : (
                        <ShoppingBag size={18} />
                      )
                    }
                    onClick={handleAddToCart}
                    disabled={!isPurchasable || isSuccess}
                    className="min-h-[46px] w-full"
                    aria-live="polite"
                    data-add-to-cart-button
                    data-add-to-cart-success={isSuccess ? 'true' : undefined}
                    data-product-add-button
                    style={isSuccess ? addToCartSuccessStyle : undefined}
                  >
                    {isPurchasable
                      ? isSuccess
                        ? ADD_TO_CART_SUCCESS_TEXT
                        : 'أضف إلى السلة'
                      : 'غير متوفر حاليا'}
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-md border border-noviq-border bg-noviq-secondary p-4 text-sm leading-7 text-noviq-secondaryText sm:mt-5 sm:p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="shrink-0 text-noviq-gold" />
                  <span>فحص جودة وتغليف فاخر قبل التسليم.</span>
                </div>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 font-semibold text-noviq-gold transition hover:text-noviq-goldHover"
                >
                  الانتقال إلى السلة
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14" data-product-specs>
        <div className="luxury-container">
          <SectionHeader title="المواصفات" description="تفاصيل أساسية قبل قرار الشراء." />
          <div className="overflow-hidden rounded-md border border-noviq-border">
            <table className="w-full border-collapse bg-noviq-card text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([label, value]) => (
                  <tr key={label} className="border-b border-noviq-border last:border-b-0">
                    <th className="w-[38%] bg-noviq-secondary px-3 py-3 text-right align-top font-semibold leading-7 text-noviq-text sm:w-1/3 sm:px-5 sm:py-4">
                      {label}
                    </th>
                    <td className="px-3 py-3 leading-7 text-noviq-secondaryText sm:px-5 sm:py-4">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="border-t border-noviq-border bg-noviq-secondary py-10 lg:py-14">
          <div className="luxury-container">
            <SectionHeader title="قد يناسبك أيضا" />
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct, index) => (
                <HomeProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
