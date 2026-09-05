import { Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { uploadCatalogImage } from '../../../../services/catalogApi';
import type { Category, Product } from '../../../../types/catalog';
import { formatCurrency } from '../../../../utils/format';
import {
  emptyProductFormValues,
  getDerivedDiscountPercent,
  productToFormValues,
  type ProductFormErrors,
  type ProductFormValues,
  validateProductForm,
} from '../productAdminUtils';

interface ProductFormDrawerProps {
  categories: Category[];
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: ProductFormValues, product?: Product) => void;
}

function getNumericValue(value: string) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function getFieldErrorId(field: keyof ProductFormErrors) {
  return `product-${field}-error`;
}

export default function ProductFormDrawer({
  categories,
  product,
  isOpen,
  onClose,
  onSave,
}: ProductFormDrawerProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyProductFormValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [imageInput, setImageInput] = useState('');
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const isEditing = Boolean(product);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(product ? productToFormValues(product) : emptyProductFormValues);
    setErrors({});
    setImageInput('');
    setImageUploadError('');
    setImageUploadSuccess(false);
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sellingPrice = getNumericValue(values.sellingPrice);
  const costPrice = getNumericValue(values.costPrice);
  const compareAtPrice = values.compareAtPrice.trim()
    ? getNumericValue(values.compareAtPrice)
    : null;
  const previewImages = values.images.filter((image) => image.trim().length > 0);
  const derivedDiscount =
    sellingPrice && sellingPrice > 0 ? getDerivedDiscountPercent(sellingPrice, compareAtPrice) : 0;
  const unitProfit =
    sellingPrice !== null && sellingPrice > 0 && costPrice !== null && costPrice >= 0
      ? sellingPrice - costPrice
      : null;

  if (!isOpen) {
    return null;
  }

  function updateValue<Field extends keyof ProductFormValues>(
    field: Field,
    value: ProductFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));

    if (field in errors) {
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[field as keyof ProductFormErrors];
        return nextErrors;
      });
    }
  }

  function addImage() {
    const nextImage = imageInput.trim();

    if (!nextImage) {
      return;
    }

    setValues((current) => {
      if (current.images.includes(nextImage)) {
        return current;
      }

      return {
        ...current,
        images: [...current.images, nextImage],
        primaryImageIndex: current.images.length === 0 ? 0 : current.primaryImageIndex,
      };
    });
    setImageInput('');
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.images;
      return nextErrors;
    });
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsImageUploading(true);
    setImageUploadError('');
    setImageUploadSuccess(false);

    try {
      for (const file of Array.from(files)) {
        const uploadedImage = await uploadCatalogImage(file, 'product');
        setValues((current) => {
          if (current.images.includes(uploadedImage.url)) {
            return current;
          }

          return {
            ...current,
            images: [...current.images, uploadedImage.url],
            primaryImageIndex: current.images.length === 0 ? 0 : current.primaryImageIndex,
          };
        });
      }

      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors.images;
        return nextErrors;
      });
      setImageUploadSuccess(true);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'فشل رفع الصورة');
    } finally {
      setIsImageUploading(false);
    }
  }

  function removeImage(index: number) {
    setValues((current) => {
      const images = current.images.filter((_, imageIndex) => imageIndex !== index);
      let primaryImageIndex = current.primaryImageIndex;

      if (images.length === 0 || index === current.primaryImageIndex) {
        primaryImageIndex = 0;
      } else if (index < current.primaryImageIndex) {
        primaryImageIndex -= 1;
      }

      return { ...current, images, primaryImageIndex };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateProductForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(values, product ?? undefined);
  }

  return (
    <div className="fixed inset-0 z-50" data-product-form-drawer>
      <button
        className="absolute inset-0 h-full w-full bg-black/70"
        onClick={onClose}
        type="button"
        aria-label="إغلاق نموذج المنتج"
        data-product-form-overlay
      />

      <aside
        className="absolute inset-y-0 left-0 flex w-full flex-col border-r border-noviq-border bg-noviq-black shadow-2xl sm:max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-noviq-border px-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-noviq-gold">
              {isEditing ? 'تعديل المنتج' : 'إضافة منتج'}
            </p>
            <h3 id="product-form-title" className="mt-1 text-xl font-bold text-noviq-text">
              {isEditing ? product?.name : 'منتج جديد'}
            </h3>
          </div>
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={onClose}
            type="button"
            aria-label="إغلاق نموذج المنتج"
            data-product-form-close
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
          noValidate
          data-product-form
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            <div className="grid gap-5">
              <section className="rounded-md border border-noviq-border bg-noviq-card p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText sm:col-span-2">
                    <span>اسم المنتج</span>
                    <input
                      aria-describedby={errors.name ? getFieldErrorId('name') : undefined}
                      aria-invalid={Boolean(errors.name)}
                      className="field"
                      onChange={(event) => updateValue('name', event.target.value)}
                      value={values.name}
                      data-product-name-input
                    />
                    {errors.name ? (
                      <span id={getFieldErrorId('name')} className="text-xs font-medium text-noviq-gold">
                        {errors.name}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>الفئة</span>
                    <select
                      aria-describedby={errors.category ? getFieldErrorId('category') : undefined}
                      aria-invalid={Boolean(errors.category)}
                      className="field"
                      onChange={(event) => updateValue('category', event.target.value as ProductFormValues['category'])}
                      value={values.category}
                      data-product-category-input
                    >
                      <option value="">اختر الفئة</option>
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category ? (
                      <span id={getFieldErrorId('category')} className="text-xs font-medium text-noviq-gold">
                        {errors.category}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>حالة المنتج</span>
                    <select
                      className="field"
                      onChange={(event) => updateValue('isAvailable', event.target.value === 'active')}
                      value={values.isAvailable ? 'active' : 'hidden'}
                      data-product-availability-input
                    >
                      <option value="active">نشط</option>
                      <option value="hidden">مخفي</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText sm:col-span-2">
                    <span>وصف المنتج</span>
                    <textarea
                      aria-describedby={errors.description ? getFieldErrorId('description') : undefined}
                      aria-invalid={Boolean(errors.description)}
                      className="field min-h-28 resize-y leading-7"
                      onChange={(event) => updateValue('description', event.target.value)}
                      value={values.description}
                      data-product-description-input
                    />
                    {errors.description ? (
                      <span id={getFieldErrorId('description')} className="text-xs font-medium text-noviq-gold">
                        {errors.description}
                      </span>
                    ) : null}
                  </label>
                </div>
              </section>

              <section className="rounded-md border border-noviq-border bg-noviq-card p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>سعر البيع</span>
                    <input
                      aria-describedby={errors.sellingPrice ? getFieldErrorId('sellingPrice') : undefined}
                      aria-invalid={Boolean(errors.sellingPrice)}
                      className="field"
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => updateValue('sellingPrice', event.target.value)}
                      step="1"
                      type="number"
                      value={values.sellingPrice}
                      data-product-selling-price-input
                    />
                    {errors.sellingPrice ? (
                      <span id={getFieldErrorId('sellingPrice')} className="text-xs font-medium text-noviq-gold">
                        {errors.sellingPrice}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>السعر قبل الخصم</span>
                    <input
                      aria-describedby={errors.compareAtPrice ? getFieldErrorId('compareAtPrice') : undefined}
                      aria-invalid={Boolean(errors.compareAtPrice)}
                      className="field"
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => updateValue('compareAtPrice', event.target.value)}
                      step="1"
                      type="number"
                      value={values.compareAtPrice}
                      data-product-compare-price-input
                    />
                    {errors.compareAtPrice ? (
                      <span id={getFieldErrorId('compareAtPrice')} className="text-xs font-medium text-noviq-gold">
                        {errors.compareAtPrice}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>تكلفة الشراء</span>
                    <input
                      aria-describedby={errors.costPrice ? getFieldErrorId('costPrice') : undefined}
                      aria-invalid={Boolean(errors.costPrice)}
                      className="field"
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => updateValue('costPrice', event.target.value)}
                      step="1"
                      type="number"
                      value={values.costPrice}
                      data-product-cost-price-input
                    />
                    {errors.costPrice ? (
                      <span id={getFieldErrorId('costPrice')} className="text-xs font-medium text-noviq-gold">
                        {errors.costPrice}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>الكمية في المخزون</span>
                    <input
                      aria-describedby={errors.stock ? getFieldErrorId('stock') : undefined}
                      aria-invalid={Boolean(errors.stock)}
                      className="field"
                      inputMode="numeric"
                      min="0"
                      onChange={(event) => updateValue('stock', event.target.value)}
                      step="1"
                      type="number"
                      value={values.stock}
                      data-product-stock-input
                    />
                    {errors.stock ? (
                      <span id={getFieldErrorId('stock')} className="text-xs font-medium text-noviq-gold">
                        {errors.stock}
                      </span>
                    ) : null}
                  </label>
                </div>

                <div className="mt-4 grid gap-3 rounded-md border border-noviq-border bg-noviq-secondary p-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-noviq-muted">نسبة الخصم</p>
                    <p className="mt-1 font-bold text-noviq-secondaryText" data-product-discount-preview>
                      {derivedDiscount > 0 ? `${derivedDiscount}%` : 'بدون خصم'}
                    </p>
                  </div>
                  {unitProfit !== null ? (
                    <div data-product-profit-preview>
                      <p className="text-xs font-semibold text-noviq-muted">
                        الربح التقريبي للوحدة
                      </p>
                      <p className="mt-1 font-bold text-noviq-gold">
                        {formatCurrency(unitProfit)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-md border border-noviq-border bg-noviq-card p-4">
                <div className="grid gap-3">
                  <div className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>صور المنتج</span>
                    <span className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <input
                        className="field"
                        onChange={(event) => setImageInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addImage();
                          }
                        }}
                        placeholder="أضف رابط صورة محلي أو رابط صورة"
                        value={imageInput}
                        data-product-image-input
                      />
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-border px-4 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
                        onClick={addImage}
                        type="button"
                        data-product-image-add
                      >
                        <Plus size={16} strokeWidth={1.8} />
                        إضافة صورة
                      </button>
                    </span>
                    <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-noviq-gold px-4 text-sm font-semibold text-noviq-gold transition hover:bg-noviq-gold/10">
                      <Upload size={16} strokeWidth={1.8} />
                      {isImageUploading ? 'جاري رفع الصورة...' : 'رفع من الجهاز'}
                      <input
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        disabled={isImageUploading}
                        multiple
                        onChange={(event) => {
                          void handleImageUpload(event.target.files);
                          event.target.value = '';
                        }}
                        type="file"
                        data-product-image-upload
                      />
                    </label>
                  </div>

                  {imageUploadSuccess ? (
                    <span className="text-xs font-medium text-noviq-gold">تم رفع الصورة بنجاح</span>
                  ) : null}
                  {imageUploadError ? (
                    <span className="text-xs font-medium text-red-200" role="alert">
                      {imageUploadError}
                    </span>
                  ) : null}

                  {errors.images ? (
                    <span id={getFieldErrorId('images')} className="text-xs font-medium text-noviq-gold">
                      {errors.images}
                    </span>
                  ) : null}

                  {previewImages.length > 0 ? (
                    <div className="grid gap-3" data-product-image-list>
                      {values.images.map((image, index) => (
                        <article
                          className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-md border border-noviq-border bg-noviq-secondary p-3"
                          key={image}
                          data-product-image-preview={index}
                        >
                          <img
                            alt={`صورة المنتج ${index + 1}`}
                            className="h-16 w-16 rounded-md border border-noviq-border object-cover"
                            src={image}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs text-noviq-muted" dir="ltr">
                              {image}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <label className="inline-flex min-h-9 items-center gap-2 rounded-md border border-noviq-border px-3 text-xs font-semibold text-noviq-secondaryText">
                                <input
                                  checked={index === values.primaryImageIndex}
                                  className="accent-noviq-gold"
                                  name="primary-product-image"
                                  onChange={() => updateValue('primaryImageIndex', index)}
                                  type="radio"
                                  data-product-primary-image={index}
                                />
                                الصورة الرئيسية
                              </label>
                              <button
                                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-red-500/35 px-3 text-xs font-semibold text-red-200 transition hover:border-red-400"
                                onClick={() => removeImage(index)}
                                type="button"
                                aria-label={`إزالة صورة المنتج ${index + 1}`}
                                data-product-image-remove={index}
                              >
                                <Trash2 size={14} strokeWidth={1.8} />
                                إزالة
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>

          <footer className="grid shrink-0 gap-3 border-t border-noviq-border bg-noviq-black px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-5">
            <p className="text-xs leading-6 text-noviq-muted">
              التغييرات في هذه المرحلة محلية داخل واجهة الإدارة فقط.
            </p>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-noviq-border px-4 text-sm font-semibold text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
              onClick={onClose}
              type="button"
              data-product-form-cancel
            >
              تراجع
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-5 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
              type="submit"
              disabled={isImageUploading}
              data-product-form-save
            >
              <Save size={17} strokeWidth={1.8} />
              حفظ المنتج
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
