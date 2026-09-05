import type { Category } from '../../../types/catalog';

export interface CategoryFormValues {
  name: string;
  slug: string;
  image: string;
  description: string;
}

export type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>;

export const emptyCategoryFormValues: CategoryFormValues = {
  name: '',
  slug: '',
  image: '',
  description: '',
};

export function normalizeCategorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
  };
}

export function validateCategoryForm(
  values: CategoryFormValues,
  categories: Category[],
  editingCategoryId?: string,
) {
  const errors: CategoryFormErrors = {};
  const normalizedSlug = normalizeCategorySlug(values.slug);

  if (!values.name.trim()) {
    errors.name = 'يرجى إدخال اسم الفئة';
  }

  if (!values.slug.trim()) {
    errors.slug = 'يرجى إدخال الرابط المختصر';
  } else if (!normalizedSlug || normalizedSlug !== values.slug.trim().toLowerCase()) {
    errors.slug = 'الرابط المختصر يجب أن يكون بحروف صغيرة وبدون مسافات';
  } else if (
    categories.some(
      (category) => category.slug === normalizedSlug && category.id !== editingCategoryId,
    )
  ) {
    errors.slug = 'هذا الرابط المختصر مستخدم بالفعل';
  }

  if (!values.image.trim()) {
    errors.image = 'يرجى إدخال صورة الفئة';
  }

  return errors;
}

export function createCategoryFromForm(
  values: CategoryFormValues,
  existingCategory?: Category,
): Category {
  const name = values.name.trim();
  const description = values.description.trim();
  const now = Date.now();
  const featuredCopy = description || existingCategory?.featuredCopy || `مجموعة ${name} لدى NOVIQ`;

  return {
    ...existingCategory,
    id: existingCategory?.id ?? `cat-admin-${now}`,
    name,
    slug: normalizeCategorySlug(values.slug),
    image: values.image.trim(),
    description,
    featuredCopy,
  };
}
