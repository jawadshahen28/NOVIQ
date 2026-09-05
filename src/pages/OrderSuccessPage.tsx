import { CheckCircle2, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  clearSubmittedOrderSnapshot,
  loadSubmittedOrderSnapshot,
} from '../services/submittedOrderStorage';
import type { SubmittedOrderSnapshot } from '../types/catalog';
import { formatCurrency } from '../utils/format';

interface SuccessState {
  order?: SubmittedOrderSnapshot;
}

export default function OrderSuccessPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessState;
  const submittedOrder = state.order ?? loadSubmittedOrderSnapshot();

  if (!submittedOrder) {
    return (
      <section className="min-h-[540px] bg-noviq-black py-12 pb-20 sm:py-16" data-order-success-page>
        <div className="luxury-container">
          <div className="mx-auto max-w-xl rounded-md border border-noviq-border bg-noviq-card px-5 py-12 text-center sm:px-6 sm:py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
              <CheckCircle2 size={24} strokeWidth={1.8} />
            </div>
            <h1 className="mt-6 font-heading text-2xl font-bold text-noviq-text">
              لا يوجد طلب لعرضه
            </h1>
            <p className="mt-3 text-sm leading-7 text-noviq-secondaryText">
              يمكنك العودة إلى المتجر ومتابعة اختيار ساعتك المناسبة.
            </p>
            <Link
              to="/"
              replace
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-6 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
            >
              <Home size={17} />
              العودة إلى المتجر
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-noviq-black py-8 pb-20 sm:py-10 lg:py-12" data-order-success-page>
      <div className="luxury-container">
        <div className="mx-auto max-w-3xl rounded-md border border-noviq-border bg-noviq-card px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
            <CheckCircle2 size={26} strokeWidth={1.8} />
          </div>
          <p className="mt-5 text-center text-xs font-semibold text-noviq-gold">
            تم استلام الطلب
          </p>
          <h1 className="mt-3 text-center font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            تم استلام طلبك بنجاح
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-7 text-noviq-secondaryText">
            شكراً لاختيارك NOVIQ، سيتم التواصل معك لتأكيد الطلب. الدفع عند الاستلام.
          </p>

          <div className="mt-7 grid gap-5 rounded-md border border-noviq-border bg-noviq-secondary p-4 sm:p-5">
            <div className="grid gap-1">
              <h2 className="font-heading text-lg font-bold text-noviq-text">ملخص الطلب</h2>
              <p className="text-xs leading-6 text-noviq-secondaryText">
                تم حفظ تفاصيل المنتجات التي قمت بتأكيدها للتو.
              </p>
            </div>

            <div className="grid gap-3" data-success-order-items>
              {submittedOrder.items.map((item) => (
                <article
                  key={item.productId}
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-noviq-border pb-3 last:border-b-0 last:pb-0"
                  data-success-order-item
                >
                  <Link
                    to={`/product/${item.productSlug}`}
                    className="aspect-square overflow-hidden rounded-md border border-noviq-border bg-noviq-card"
                    aria-label={item.productName}
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/product/${item.productSlug}`}
                      className="line-clamp-2 text-sm font-semibold leading-6 text-noviq-text transition hover:text-noviq-gold"
                    >
                      {item.productName}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-noviq-secondaryText">
                      <span>الكمية: {item.quantity}</span>
                      <span>{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-noviq-gold">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-3 border-t border-noviq-border pt-4 text-sm">
              {submittedOrder.orderNumber ? (
                <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
                  <span>رقم الطلب</span>
                  <span className="font-semibold text-noviq-text">
                    {submittedOrder.orderNumber}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-noviq-secondaryText">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(submittedOrder.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-noviq-secondaryText">
                <span>التوصيل</span>
                <span>{submittedOrder.shipping === 0 ? 'مجاني' : formatCurrency(submittedOrder.shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-noviq-border pt-4 text-base font-bold text-noviq-text">
                <span>الإجمالي</span>
                <span className="font-semibold text-noviq-gold">
                  {formatCurrency(submittedOrder.total)}
                </span>
              </div>
              <div className="grid gap-1 rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3">
                <div className="flex items-center justify-between gap-4 text-noviq-secondaryText">
                  <span>الدفع</span>
                  <span className="font-semibold text-noviq-text">
                    {submittedOrder.paymentMethod}
                  </span>
                </div>
                <p className="text-xs leading-6 text-noviq-secondaryText">
                  يتم الدفع عند استلام الطلب.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-center">
            <Link
              to="/"
              replace
              onClick={clearSubmittedOrderSnapshot}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-6 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
            >
              <Home size={17} />
              العودة إلى المتجر
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
