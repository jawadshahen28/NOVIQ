import { Save, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { uploadCatalogImage } from '../../../../services/catalogApi';
import type { Category } from '../../../../types/catalog';
import {
  categoryToFormValues,
  emptyCategoryFormValues,
  normalizeCategorySlug,
  type CategoryFormErrors,
  type CategoryFormValues,
  validateCategoryForm,
} from '../categoryAdminUtils';

interface CategoryFormDrawerProps {
  categories: Category[];
  category: Category | null;
  isOpen: boolean;
  isSlugLocked: boolean;
  onClose: () => void;
  onSave: (values: CategoryFormValues, category?: Category) => void;
}

function getFieldErrorId(field: keyof CategoryFormErrors) {
  return `category-${field}-error`;
}

export default function CategoryFormDrawer({
  categories,
  category,
  isOpen,
  isSlugLocked,
  onClose,
  onSave,
}: CategoryFormDrawerProps) {
  const [values, setValues] = useState<CategoryFormValues>(emptyCategoryFormValues);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const isEditing = Boolean(category);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(category ? categoryToFormValues(category) : emptyCategoryFormValues);
    setErrors({});
    setImageUploadError('');
    setImageUploadSuccess(false);
  }, [category, isOpen]);

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

  if (!isOpen) {
    return null;
  }

  function updateValue<Field extends keyof CategoryFormValues>(
    field: Field,
    value: CategoryFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));

    if (field === 'image') {
      setImageUploadError('');
      setImageUploadSuccess(false);
    }

    if (errors[field]) {
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[field];
        return nextErrors;
      });
    }
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsImageUploading(true);
    setImageUploadError('');
    setImageUploadSuccess(false);

    try {
      const uploadedImage = await uploadCatalogImage(file, 'category');
      updateValue('image', uploadedImage.url);
      setImageUploadSuccess(true);
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : 'فشل رفع الصورة');
    } finally {
      setIsImageUploading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateCategoryForm(values, categories, category?.id);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(values, category ?? undefined);
  }

  return (
    <div className="fixed inset-0 z-50" data-category-form-drawer>
      <button
        className="absolute inset-0 h-full w-full bg-black/70"
        onClick={onClose}
        type="button"
        aria-label="إغلاق نموذج الفئة"
        data-category-form-overlay
      />

      <aside
        className="absolute inset-y-0 left-0 flex w-full flex-col border-r border-noviq-border bg-noviq-black shadow-2xl sm:max-w-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
      >
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-noviq-border px-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-noviq-gold">
              {isEditing ? 'تعديل الفئة' : 'إضافة فئة'}
            </p>
            <h3 id="category-form-title" className="mt-1 text-xl font-bold text-noviq-text">
              {isEditing ? category?.name : 'فئة جديدة'}
            </h3>
          </div>
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-noviq-border text-noviq-secondaryText transition hover:border-noviq-gold hover:text-noviq-gold"
            onClick={onClose}
            type="button"
            aria-label="إغلاق نموذج الفئة"
            data-category-form-close
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
          noValidate
          data-category-form
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            <div className="grid gap-5">
              <section className="rounded-md border border-noviq-border bg-noviq-card p-4">
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>اسم الفئة</span>
                    <input
                      aria-describedby={errors.name ? getFieldErrorId('name') : undefined}
                      aria-invalid={Boolean(errors.name)}
                      className="field"
                      onChange={(event) => updateValue('name', event.target.value)}
                      value={values.name}
                      data-category-name-input
                    />
                    {errors.name ? (
                      <span id={getFieldErrorId('name')} className="text-xs font-medium text-noviq-gold">
                        {errors.name}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>الرابط المختصر</span>
                    <input
                      aria-describedby={errors.slug ? getFieldErrorId('slug') : undefined}
                      aria-invalid={Boolean(errors.slug)}
                      className="field disabled:cursor-not-allowed disabled:text-noviq-muted"
                      dir="ltr"
                      disabled={isSlugLocked}
                      onBlur={(event) => {
                        if (!isSlugLocked) {
                          updateValue('slug', normalizeCategorySlug(event.target.value));
                        }
                      }}
                      onChange={(event) => updateValue('slug', event.target.value.toLowerCase())}
                      value={values.slug}
                      data-category-slug-input
                    />
                    {isSlugLocked ? (
                      <span className="text-xs leading-6 text-noviq-muted" data-category-slug-locked>
                        لا يمكن تعديل الرابط المختصر لفئة تحتوي على منتجات في هذه المرحلة.
                      </span>
                    ) : null}
                    {errors.slug ? (
                      <span id={getFieldErrorId('slug')} className="text-xs font-medium text-noviq-gold">
                        {errors.slug}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>صورة الفئة</span>
                    <span className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-noviq-gold px-4 text-sm font-semibold text-noviq-gold transition hover:bg-noviq-gold/10">
                      <Upload size={16} strokeWidth={1.8} />
                      {isImageUploading ? 'جاري رفع الصورة...' : 'رفع صورة من الجهاز'}
                      <input
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        disabled={isImageUploading}
                        onChange={(event) => {
                          void handleImageUpload(event.target.files?.[0]);
                          event.target.value = '';
                        }}
                        type="file"
                        data-category-image-upload
                      />
                    </span>
                    <input
                      aria-describedby={errors.image ? getFieldErrorId('image') : undefined}
                      aria-invalid={Boolean(errors.image)}
                      className="field"
                      onChange={(event) => updateValue('image', event.target.value)}
                      placeholder="أضف رابط صورة الفئة"
                      value={values.image}
                      data-category-image-input
                    />
                    {imageUploadSuccess ? (
                      <span className="text-xs font-medium text-noviq-gold">تم رفع الصورة بنجاح</span>
                    ) : null}
                    {imageUploadError ? (
                      <span className="text-xs font-medium text-red-200" role="alert">
                        {imageUploadError}
                      </span>
                    ) : null}
                    {errors.image ? (
                      <span id={getFieldErrorId('image')} className="text-xs font-medium text-noviq-gold">
                        {errors.image}
                      </span>
                    ) : null}
                  </label>

                  {values.image.trim() ? (
                    <div
                      className="overflow-hidden rounded-md border border-noviq-border bg-noviq-secondary"
                      data-category-image-preview
                    >
                      <img
                        alt="معاينة صورة الفئة"
                        className="h-36 w-full object-cover"
                        src={values.image}
                      />
                    </div>
                  ) : null}

                  <label className="grid gap-2 text-sm font-semibold text-noviq-secondaryText">
                    <span>وصف مختصر</span>
                    <textarea
                      className="field min-h-28 resize-y leading-7"
                      onChange={(event) => updateValue('description', event.target.value)}
                      value={values.description}
                      data-category-description-input
                    />
                  </label>
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
              data-category-form-cancel
            >
              تراجع
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-5 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
              type="submit"
              disabled={isImageUploading}
              data-category-form-save
            >
              <Save size={17} strokeWidth={1.8} />
              حفظ الفئة
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
