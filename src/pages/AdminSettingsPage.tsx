import {
  Image,
  MessageCircle,
  RefreshCcw,
  Save,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Button from '../components/Button';
import {
  defaultAdminSettings,
  useAdminSettings,
  type AdminSettings,
} from '../features/admin/settings/AdminSettingsContext';
import {
  normalizeAdminSettings,
  validateAdminSettings,
  type AdminSettingsFormErrors,
  type AdminSettingsFormValues,
} from '../features/admin/settings/settingsAdminUtils';
import { ApiClientError } from '../services/apiClient';

interface SettingsSectionProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  icon: typeof Store;
  dataAttribute: string;
}

function SettingsSection({
  children,
  dataAttribute,
  eyebrow,
  icon: Icon,
  title,
}: SettingsSectionProps) {
  return (
    <section
      className="min-w-0 rounded-md border border-noviq-border bg-noviq-card p-4 sm:p-5"
      data-settings-section={dataAttribute}
    >
      <div className="mb-5 flex items-start gap-3 border-b border-noviq-border pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-gold text-noviq-gold">
          <Icon size={19} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">{eyebrow}</p>
          <h3 className="mt-1 text-lg font-bold text-noviq-text">{title}</h3>
        </div>
      </div>

      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function getFieldErrorId(field: keyof AdminSettingsFormErrors) {
  return `settings-${field}-error`;
}

const serverValidationMessage = 'تعذر حفظ الإعدادات. يرجى مراجعة الحقول والمحاولة مرة أخرى.';
const serverSaveErrorMessage = 'تعذر حفظ الإعدادات، يرجى المحاولة مرة أخرى.';

const serverErrorFields = [
  'storeName',
  'whatsappNumber',
  'storePhone',
  'heroTitle',
  'heroImage',
] as const;

function isServerErrorField(path: string): path is keyof AdminSettingsFormErrors {
  return serverErrorFields.some((field) => field === path);
}

function getServerFieldErrors(error: ApiClientError) {
  const nextErrors: AdminSettingsFormErrors = {};

  error.errors?.forEach((detail) => {
    if (detail.path && isServerErrorField(detail.path)) {
      nextErrors[detail.path] = serverValidationMessage;
    }
  });

  return nextErrors;
}

export default function AdminSettingsPage() {
  const { isLoading, loadError, reloadSettings, saveSettings, settings } = useAdminSettings();
  const [values, setValues] = useState<AdminSettingsFormValues>(settings);
  const [errors, setErrors] = useState<AdminSettingsFormErrors>({});
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    setValues(settings);
  }, [settings]);

  function updateValue<Field extends keyof AdminSettings>(
    field: Field,
    value: AdminSettings[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setFeedback('');

    if (field in errors) {
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[field as keyof AdminSettingsFormErrors];
        return nextErrors;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSavingRef.current || isLoading || loadError) {
      return;
    }

    const nextErrors = validateAdminSettings(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback('');
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      const savedSettings = await saveSettings(normalizeAdminSettings(values));
      setValues(savedSettings);
      setErrors({});
      setFeedback('تم حفظ الإعدادات');
    } catch (error) {
      if (error instanceof ApiClientError) {
        const serverErrors = getServerFieldErrors(error);

        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
          setFeedback(serverValidationMessage);
          return;
        }
      }

      setFeedback(serverSaveErrorMessage);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <section className="grid min-w-0 gap-6" data-admin-settings-page>
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-noviq-gold">NOVIQ ADMIN</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
            الإعدادات
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-noviq-secondaryText">
            إدارة الإعدادات الأساسية لمتجر NOVIQ
          </p>
        </div>
      </div>

      {isLoading ? (
        <p
          className="rounded-md border border-noviq-border bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-secondaryText"
          data-settings-loading
          role="status"
        >
          جاري تحميل الإعدادات...
        </p>
      ) : null}

      {loadError ? (
        <div
          className="flex flex-col gap-3 rounded-md border border-noviq-gold/50 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold sm:flex-row sm:items-center sm:justify-between"
          data-settings-load-error
          role="alert"
        >
          <p>{loadError}</p>
          <Button
            icon={<RefreshCcw size={17} strokeWidth={1.8} />}
            onClick={() => void reloadSettings()}
            type="button"
            variant="outline"
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : null}

      {feedback ? (
        <p
          className="rounded-md border border-noviq-gold/40 bg-noviq-card px-4 py-3 text-sm font-semibold text-noviq-gold"
          data-settings-feedback
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      <form className="grid min-w-0 gap-6" data-settings-form noValidate onSubmit={handleSubmit}>
        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <SettingsSection
            dataAttribute="store"
            eyebrow="المتجر"
            icon={Store}
            title="معلومات المتجر"
          >
            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>اسم المتجر</span>
              <input
                aria-describedby={errors.storeName ? getFieldErrorId('storeName') : undefined}
                aria-invalid={Boolean(errors.storeName)}
                className="field"
                data-store-name-input
                onChange={(event) => updateValue('storeName', event.target.value)}
                value={values.storeName}
              />
              {errors.storeName ? (
                <span
                  className="text-xs font-medium text-noviq-gold"
                  data-settings-error="storeName"
                  id={getFieldErrorId('storeName')}
                >
                  {errors.storeName}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>وصف مختصر</span>
              <textarea
                className="field min-h-28 resize-y leading-7"
                data-store-description-input
                onChange={(event) => updateValue('storeDescription', event.target.value)}
                value={values.storeDescription}
              />
            </label>
          </SettingsSection>

          <SettingsSection
            dataAttribute="contact"
            eyebrow="التواصل"
            icon={MessageCircle}
            title="إعدادات التواصل"
          >
            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>رقم WhatsApp</span>
              <input
                aria-describedby={
                  errors.whatsappNumber ? getFieldErrorId('whatsappNumber') : undefined
                }
                aria-invalid={Boolean(errors.whatsappNumber)}
                className="field"
                data-whatsapp-input
                dir="ltr"
                inputMode="tel"
                onChange={(event) => updateValue('whatsappNumber', event.target.value)}
                placeholder="+972500000000"
                value={values.whatsappNumber}
              />
              {errors.whatsappNumber ? (
                <span
                  className="text-xs font-medium text-noviq-gold"
                  data-settings-error="whatsappNumber"
                  id={getFieldErrorId('whatsappNumber')}
                >
                  {errors.whatsappNumber}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>رقم هاتف المتجر</span>
              <input
                aria-describedby={errors.storePhone ? getFieldErrorId('storePhone') : undefined}
                aria-invalid={Boolean(errors.storePhone)}
                className="field"
                data-store-phone-input
                dir="ltr"
                inputMode="tel"
                onChange={(event) => updateValue('storePhone', event.target.value)}
                placeholder="0500000000"
                value={values.storePhone}
              />
              {errors.storePhone ? (
                <span
                  className="text-xs font-medium text-noviq-gold"
                  data-settings-error="storePhone"
                  id={getFieldErrorId('storePhone')}
                >
                  {errors.storePhone}
                </span>
              ) : null}
            </label>
          </SettingsSection>
        </div>

        <SettingsSection
          dataAttribute="hero"
          eyebrow="واجهة المتجر"
          icon={Image}
          title="واجهة المتجر"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>عنوان Hero</span>
              <input
                aria-describedby={errors.heroTitle ? getFieldErrorId('heroTitle') : undefined}
                aria-invalid={Boolean(errors.heroTitle)}
                className="field"
                data-hero-title-input
                onChange={(event) => updateValue('heroTitle', event.target.value)}
                value={values.heroTitle}
              />
              {errors.heroTitle ? (
                <span
                  className="text-xs font-medium text-noviq-gold"
                  data-settings-error="heroTitle"
                  id={getFieldErrorId('heroTitle')}
                >
                  {errors.heroTitle}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
              <span>رابط / مسار صورة Hero</span>
              <input
                aria-describedby={errors.heroImage ? getFieldErrorId('heroImage') : undefined}
                aria-invalid={Boolean(errors.heroImage)}
                className="field"
                data-hero-image-input
                dir="ltr"
                onChange={(event) => updateValue('heroImage', event.target.value)}
                value={values.heroImage}
              />
              {errors.heroImage ? (
                <span
                  className="text-xs font-medium text-noviq-gold"
                  data-settings-error="heroImage"
                  id={getFieldErrorId('heroImage')}
                >
                  {errors.heroImage}
                </span>
              ) : null}
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
            <span>وصف Hero</span>
            <textarea
              className="field min-h-28 resize-y leading-7"
              data-hero-description-input
              onChange={(event) => updateValue('heroDescription', event.target.value)}
              value={values.heroDescription}
            />
          </label>

          {values.heroImage.trim() ? (
            <div
              className="overflow-hidden rounded-md border border-noviq-border bg-noviq-secondary"
              data-hero-image-preview
            >
              <img
                alt="معاينة صورة Hero"
                className="h-44 w-full object-cover"
                src={values.heroImage}
              />
            </div>
          ) : null}
        </SettingsSection>

        <SettingsSection
          dataAttribute="orders"
          eyebrow="الطلبات"
          icon={ShoppingBag}
          title="إعدادات الطلبات"
        >
          <div className="grid gap-3">
            <p className="text-sm font-semibold text-noviq-secondaryText">استقبال الطلبات</p>
            <div className="grid grid-cols-2 gap-2" data-orders-open-toggle>
              <button
                aria-pressed={values.ordersOpen}
                className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 text-sm font-semibold transition ${
                  values.ordersOpen
                    ? 'border-noviq-gold bg-noviq-gold text-noviq-black'
                    : 'border-noviq-border text-noviq-secondaryText hover:border-noviq-gold hover:text-noviq-gold'
                }`}
                data-orders-open-option="open"
                onClick={() => updateValue('ordersOpen', true)}
                type="button"
              >
                مفتوح
              </button>
              <button
                aria-pressed={!values.ordersOpen}
                className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 text-sm font-semibold transition ${
                  !values.ordersOpen
                    ? 'border-noviq-gold bg-noviq-gold text-noviq-black'
                    : 'border-noviq-border text-noviq-secondaryText hover:border-noviq-gold hover:text-noviq-gold'
                }`}
                data-orders-open-option="closed"
                onClick={() => updateValue('ordersOpen', false)}
                type="button"
              >
                مغلق
              </button>
            </div>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
            <span>رسالة الإغلاق</span>
            <textarea
              className="field min-h-24 resize-y leading-7"
              data-closed-message-input
              onChange={(event) => updateValue('closedMessage', event.target.value)}
              placeholder={defaultAdminSettings.closedMessage}
              value={values.closedMessage}
            />
          </label>

          <div
            className="rounded-md border border-noviq-border bg-noviq-secondary px-4 py-3 text-sm leading-7 text-noviq-secondaryText"
            data-orders-state-preview
          >
            {values.ordersOpen
              ? 'يتم استقبال الطلبات حالياً'
              : values.closedMessage || defaultAdminSettings.closedMessage}
          </div>

          <div
            className="rounded-md border border-noviq-border bg-noviq-secondary px-4 py-3 text-sm font-semibold text-noviq-secondaryText"
            data-payment-current
          >
            طريقة الدفع الحالية: الدفع عند الاستلام
          </div>
        </SettingsSection>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            disabled={isSaving || isLoading || Boolean(loadError)}
            data-settings-save
            icon={<Save size={18} strokeWidth={1.8} />}
            type="submit"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>
    </section>
  );
}
