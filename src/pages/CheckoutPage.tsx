import { ArrowLeft, Banknote, CheckCircle2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useCart } from '../features/cart/CartContext';
import CheckoutSummary from '../features/checkout/components/CheckoutSummary';
import { useStoreSettings } from '../features/store/settings/StoreSettingsContext';
import { defaultStoreSettings } from '../features/store/settings/storeSettingsDefaults';
import { ApiClientError } from '../services/apiClient';
import { createOrder, type CreatedOrder } from '../services/orderApi';
import { saveSubmittedOrderSnapshot } from '../services/submittedOrderStorage';
import type { SubmittedOrderSnapshot } from '../types/catalog';
import { formatCurrency } from '../utils/format';

interface CheckoutFormValues {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
}

type CheckoutErrors = Partial<Record<keyof Omit<CheckoutFormValues, 'notes'>, string>>;

const cashOnDeliveryMethod = 'الدفع عند الاستلام';
const submissionErrorMessage = 'تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.';

const initialFormValues: CheckoutFormValues = {
  fullName: '',
  phone: '',
  address: '',
  notes: '',
};

function createSubmittedOrderSnapshot(order: CreatedOrder): SubmittedOrderSnapshot {
  return {
    items: order.items.map((item) => ({
      image: item.image,
      lineTotal: item.lineTotal,
      productId: item.productId,
      productName: item.name,
      productSlug: item.productSlug ?? '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod || cashOnDeliveryMethod,
    shipping: order.shipping,
    submittedAt: order.createdAt,
    subtotal: order.subtotal,
    total: order.total,
  };
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { clearCart, items, subtotal } = useCart();
  const { settings } = useStoreSettings();
  const [formValues, setFormValues] = useState<CheckoutFormValues>(initialFormValues);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  function validateForm(values: CheckoutFormValues) {
    const nextErrors: CheckoutErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = 'يرجى إدخال الاسم الكامل.';
    }

    if (!values.phone.trim()) {
      nextErrors.phone = 'يرجى إدخال رقم الهاتف.';
    }

    if (!values.address.trim()) {
      nextErrors.address = 'يرجى إدخال العنوان.';
    }

    return nextErrors;
  }

  function updateField(field: keyof CheckoutFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }));
    setSubmitError('');

    if (field !== 'notes' && errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    if (!settings.ordersOpen) {
      setSubmitError(settings.closedMessage || defaultStoreSettings.closedMessage);
      return;
    }

    const nextErrors = validateForm(formValues);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      const customer = {
        address: formValues.address.trim(),
        name: formValues.fullName.trim(),
        phone: formValues.phone.trim(),
        ...(formValues.notes.trim() ? { notes: formValues.notes.trim() } : {}),
      };
      const { order } = await createOrder({
        customer,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      const submittedOrder = createSubmittedOrderSnapshot(order);

      saveSubmittedOrderSnapshot(submittedOrder);
      clearCart();
      navigate('/order-success', {
        replace: true,
        state: { order: submittedOrder },
      });
    } catch (error) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setSubmitError(
        error instanceof ApiClientError &&
          error.errors?.some((detail) => detail.code === 'orders_closed')
          ? error.message || defaultStoreSettings.closedMessage
          : error instanceof ApiClientError && error.status === 409
          ? 'الكمية المطلوبة غير متوفرة لأحد المنتجات.'
          : error instanceof ApiClientError && error.status === 400
            ? 'يرجى مراجعة بيانات الطلب والمحاولة مرة أخرى.'
            : submissionErrorMessage,
      );
    }
  }

  if (items.length === 0) {
    return (
      <section className="min-h-[540px] bg-noviq-black py-12 sm:py-16" data-checkout-page>
        <div className="luxury-container">
          <div className="mx-auto max-w-xl rounded-md border border-noviq-border bg-noviq-card px-5 py-12 text-center sm:px-6 sm:py-14">
            <h1 className="font-heading text-2xl font-bold text-noviq-text">
              لا توجد منتجات للدفع
            </h1>
            <p className="mt-3 text-sm leading-7 text-noviq-secondaryText">
              أضف ساعة إلى السلة قبل الانتقال إلى صفحة الدفع.
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
    <section className="bg-noviq-black py-8 lg:py-12" data-checkout-page>
      <div className="luxury-container">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold text-noviq-gold">الدفع</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            إكمال بيانات الطلب
          </h1>
          <p className="mt-3 text-sm text-noviq-secondaryText">
            إجمالي الطلب الحالي {formatCurrency(subtotal)}
          </p>
          {!settings.ordersOpen ? (
            <p
              className="mt-4 rounded-md border border-noviq-gold/50 bg-noviq-card px-4 py-3 text-sm font-semibold leading-7 text-noviq-gold"
              role="alert"
              data-checkout-closed-message
            >
              {settings.closedMessage || defaultStoreSettings.closedMessage}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <form
            className="grid gap-6 rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5 lg:p-6"
            onSubmit={handleSubmit}
            noValidate
            data-checkout-form
          >
            <fieldset className="grid gap-4">
              <legend className="mb-1 font-heading text-lg font-bold text-noviq-text">
                بيانات العميل
              </legend>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                  <span>الاسم الكامل</span>
                  <input
                    aria-describedby={errors.fullName ? 'full-name-error' : undefined}
                    aria-invalid={Boolean(errors.fullName)}
                    className="field"
                    data-full-name-input
                    onChange={(event) => updateField('fullName', event.target.value)}
                    value={formValues.fullName}
                  />
                  {errors.fullName ? (
                    <span id="full-name-error" className="text-xs font-medium text-noviq-gold">
                      {errors.fullName}
                    </span>
                  ) : null}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                  <span>رقم الهاتف</span>
                  <input
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    aria-invalid={Boolean(errors.phone)}
                    className="field"
                    data-phone-input
                    inputMode="tel"
                    onChange={(event) => updateField('phone', event.target.value)}
                    type="tel"
                    value={formValues.phone}
                  />
                  {errors.phone ? (
                    <span id="phone-error" className="text-xs font-medium text-noviq-gold">
                      {errors.phone}
                    </span>
                  ) : null}
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                <span>العنوان</span>
                <textarea
                  aria-describedby={errors.address ? 'address-error' : undefined}
                  aria-invalid={Boolean(errors.address)}
                  className="field min-h-28 resize-y"
                  data-address-input
                  onChange={(event) => updateField('address', event.target.value)}
                  value={formValues.address}
                />
                {errors.address ? (
                  <span id="address-error" className="text-xs font-medium text-noviq-gold">
                    {errors.address}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                <span>ملاحظات على الطلب (اختياري)</span>
                <textarea
                  className="field min-h-24 resize-y"
                  data-notes-input
                  onChange={(event) => updateField('notes', event.target.value)}
                  value={formValues.notes}
                />
              </label>
            </fieldset>

            <section className="border-t border-noviq-border pt-5" data-payment-static>
              <h2 className="font-heading text-lg font-bold text-noviq-text">طريقة الدفع</h2>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
                  <Banknote size={20} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-noviq-text">
                    {cashOnDeliveryMethod}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-noviq-secondaryText">
                    يتم الدفع نقدا عند استلام الطلب.
                  </p>
                </div>
              </div>
            </section>

            {submitError ? (
              <p
                className="rounded-md border border-noviq-gold/50 bg-noviq-secondary px-4 py-3 text-sm font-semibold leading-7 text-noviq-gold"
                role="alert"
                data-submit-error
              >
                {submitError}
              </p>
            ) : null}

            <Button
              className="min-h-12 w-full md:w-auto"
              disabled={isSubmitting || !settings.ordersOpen}
              data-confirm-order
              icon={<CheckCircle2 size={18} />}
              type="submit"
            >
              {isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}
            </Button>
          </form>

          <CheckoutSummary />
        </div>
      </div>
    </section>
  );
}
