import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuantityStepper from '../components/QuantityStepper';
import { useCart } from '../features/cart/CartContext';
import { formatCurrency, getDiscountedPrice } from '../utils/format';

export default function CartPage() {
  const { items, removeItem, subtotal, updateQuantity } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <section className="min-h-[560px] bg-noviq-black py-12 sm:py-16" data-cart-page>
        <div className="luxury-container">
          <div className="mx-auto max-w-xl rounded-md border border-noviq-border bg-noviq-card px-5 py-12 text-center sm:px-6 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
              <ShoppingBag size={24} />
            </div>
            <h1 className="mt-6 font-heading text-2xl font-bold text-noviq-text">
              سلة التسوق فارغة
            </h1>
            <p className="mt-3 text-sm leading-7 text-noviq-secondaryText">
              اختر ساعة من المجموعات وأضفها إلى السلة لإكمال الطلب.
            </p>
            <Link
              to="/#selected-watches"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-6 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
            >
              تصفح الساعات
              <ArrowLeft size={17} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-noviq-black py-8 lg:py-12" data-cart-page>
      <div className="luxury-container">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold text-noviq-gold">سلة التسوق</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            مراجعة الطلب
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="grid gap-3 sm:gap-4">
            {items.map((item) => {
              const discountedPrice = getDiscountedPrice(item.product);
              const hasDiscount = item.product.discountPercent > 0;

              return (
                <article
                  key={item.product.id}
                  className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-md border border-noviq-border bg-noviq-card p-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:p-4 md:grid-cols-[118px_minmax(0,1fr)_auto] md:gap-5"
                  data-cart-item
                >
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="h-[92px] w-[92px] overflow-hidden rounded-md border border-noviq-border bg-noviq-secondary sm:h-28 sm:w-28 md:h-[118px] md:w-[118px]"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="line-clamp-2 font-heading text-sm font-bold leading-6 text-noviq-text transition hover:text-noviq-gold sm:text-lg"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs leading-6 text-noviq-secondaryText sm:mt-2 sm:text-sm">
                      {item.product.shortDescription}
                    </p>
                    <div className="mt-2 sm:mt-3">
                      <p className="text-base font-bold text-noviq-gold sm:text-lg">
                        {formatCurrency(discountedPrice)}
                      </p>
                      {hasDiscount ? (
                        <p className="mt-0.5 text-xs text-noviq-muted line-through">
                          {formatCurrency(item.product.price)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-between gap-3 border-t border-noviq-border pt-3 md:col-span-1 md:flex-col md:items-end md:border-t-0 md:pt-0">
                    <div data-cart-quantity>
                      <QuantityStepper
                        value={item.quantity}
                        max={item.product.stock}
                        onChange={(value) => updateQuantity(item.product.id, value)}
                      />
                    </div>
                    <button
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                      onClick={() => removeItem(item.product.id)}
                      type="button"
                      aria-label={`إزالة ${item.product.name}`}
                      data-cart-remove
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside
            className="rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5 lg:sticky lg:top-28"
            data-cart-summary
          >
            <h2 className="font-heading text-xl font-bold text-noviq-text">ملخص السلة</h2>
            <div className="mt-5 grid gap-3 border-y border-noviq-border py-5 text-sm">
              <div className="flex items-center justify-between text-noviq-secondaryText">
                <span>عدد القطع</span>
                <span data-cart-summary-count>{itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-noviq-secondaryText">
                <span>التوصيل</span>
                <span>مجاني</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-noviq-text">
                <span>الإجمالي</span>
                <span className="text-noviq-gold" data-cart-total>
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-6 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
              data-checkout-link
            >
              إتمام الشراء
              <ArrowLeft size={18} />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
