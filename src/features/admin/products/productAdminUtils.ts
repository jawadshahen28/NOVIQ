import {
  productDepartmentLabels,
  productDepartments,
  unsetProductDepartmentLabel,
  type Category,
  type CategorySlug,
  type Product,
  type ProductDepartment,
} from '../../../types/catalog';
import { getDiscountedPrice } from '../../../utils/format';

export type ProductStockCondition = 'available' | 'low' | 'out';
export type ProductDepartmentFilter = 'all' | ProductDepartment | 'unset';
export type ProductStockFilter = 'all' | ProductStockCondition;
export type ProductStockStatus = ProductStockCondition | 'hidden';

export interface ProductFormValues {
  name: string;
  department: ProductDepartment | '';
  category: CategorySlug | '';
  brand: string;
  description: string;
  sellingPrice: string;
  compareAtPrice: string;
  costPrice: string;
  stock: string;
  images: string[];
  primaryImageIndex: number;
  isAvailable: boolean;
}

export type ProductFormErrors = Partial<
  Record<
    | 'name'
    | 'department'
    | 'category'
    | 'brand'
    | 'description'
    | 'sellingPrice'
    | 'compareAtPrice'
    | 'costPrice'
    | 'stock'
    | 'images',
    string
  >
>;

export const lowStockThreshold = 3;

export const emptyProductFormValues: ProductFormValues = {
  name: '',
  department: '',
  category: '',
  brand: '',
  description: '',
  sellingPrice: '',
  compareAtPrice: '',
  costPrice: '',
  stock: '',
  images: [],
  primaryImageIndex: 0,
  isAvailable: true,
};

const arabicSlugMap: Record<string, string> = {
  ا: 'a',
  أ: 'a',
  إ: 'a',
  آ: 'a',
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'j',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'th',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'd',
  ط: 't',
  ظ: 'z',
  ع: 'a',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  ة: 'h',
  و: 'w',
  ؤ: 'w',
  ي: 'y',
  ى: 'a',
  ئ: 'y',
};

export function createCategoryNameMap(categories: Category[]) {
  return new Map(categories.map((category) => [category.slug, category.name]));
}

export function getCategoryName(categoryMap: Map<CategorySlug, string>, slug: CategorySlug) {
  return categoryMap.get(slug) ?? slug;
}

export function getProductDepartmentLabel(department?: ProductDepartment | null) {
  return department ? productDepartmentLabels[department] : unsetProductDepartmentLabel;
}

export function getProductCompareAtPrice(product: Product) {
  const sellingPrice = product.sellingPrice ?? getProductSellingPrice(product);
  const compareAtPrice =
    product.compareAtPrice !== undefined
      ? product.compareAtPrice
      : product.discountPercent > 0
        ? product.price
        : null;

  return compareAtPrice && compareAtPrice > sellingPrice ? compareAtPrice : null;
}

export function getProductSellingPrice(product: Product) {
  return getDiscountedPrice(product);
}

export function getStockCondition(stock: number): ProductStockCondition {
  if (stock <= 0) {
    return 'out';
  }

  if (stock <= lowStockThreshold) {
    return 'low';
  }

  return 'available';
}

export function getStockStatus(product: Pick<Product, 'isActive' | 'isAvailable' | 'stock'>): ProductStockStatus {
  if (product.isActive === false || (!product.isAvailable && product.stock > 0)) {
    return 'hidden';
  }

  return getStockCondition(product.stock);
}

export function getStockStatusLabel(status: ProductStockStatus) {
  const labels: Record<ProductStockStatus, string> = {
    available: 'متوفر',
    low: 'مخزون منخفض',
    out: 'نافد',
    hidden: 'مخفي',
  };

  return labels[status];
}

export function matchesStockFilter(product: Product, filter: ProductStockFilter) {
  if (filter === 'all') {
    return true;
  }

  return getStockCondition(product.stock) === filter;
}

export function matchesDepartmentFilter(product: Product, filter: ProductDepartmentFilter) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'unset') {
    return !product.department;
  }

  return product.department === filter;
}

export const productDepartmentOptions = productDepartments.map((department) => ({
  label: productDepartmentLabels[department],
  value: department,
}));

export function productToFormValues(product: Product): ProductFormValues {
  const sellingPrice = product.sellingPrice ?? getProductSellingPrice(product);
  const compareAtPrice = product.compareAtPrice ?? getProductCompareAtPrice(product);

  return {
    name: product.name,
    department: product.department ?? '',
    category: product.category,
    brand: product.brand ?? '',
    description: product.description,
    sellingPrice: String(sellingPrice),
    compareAtPrice: compareAtPrice ? String(compareAtPrice) : '',
    costPrice: String(product.costPrice),
    stock: String(product.stock),
    images: [...product.images],
    primaryImageIndex: 0,
    isAvailable: product.isActive ?? product.isAvailable,
  };
}

export function normalizeImages(images: string[], primaryImageIndex: number) {
  const cleanImages = images
    .map((image) => image.trim())
    .filter((image, index, allImages) => image.length > 0 && allImages.indexOf(image) === index);

  if (cleanImages.length === 0) {
    return [];
  }

  const safePrimaryIndex =
    primaryImageIndex >= 0 && primaryImageIndex < cleanImages.length ? primaryImageIndex : 0;
  const primaryImage = cleanImages[safePrimaryIndex];

  return [primaryImage, ...cleanImages.filter((_, index) => index !== safePrimaryIndex)];
}

export function normalizeProductBrand(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function getDerivedDiscountPercent(sellingPrice: number, compareAtPrice: number | null) {
  if (!compareAtPrice || compareAtPrice <= sellingPrice) {
    return 0;
  }

  return Math.round(((compareAtPrice - sellingPrice) / compareAtPrice) * 100);
}

export function validateProductForm(values: ProductFormValues) {
  const errors: ProductFormErrors = {};
  const sellingPrice = Number(values.sellingPrice);
  const compareAtPrice = values.compareAtPrice.trim() ? Number(values.compareAtPrice) : null;
  const costPrice = Number(values.costPrice);
  const stock = Number(values.stock);
  const images = normalizeImages(values.images, values.primaryImageIndex);

  if (!values.name.trim()) {
    errors.name = 'يرجى إدخال اسم المنتج';
  }

  if (!values.department) {
    errors.department = '\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0642\u0633\u0645';
  }

  if (!values.category) {
    errors.category = 'يرجى اختيار الفئة';
  }

  if (normalizeProductBrand(values.brand).length > 120) {
    errors.brand = '\u064a\u062c\u0628 \u0623\u0644\u0627 \u062a\u062a\u062c\u0627\u0648\u0632 \u0627\u0644\u0645\u0627\u0631\u0643\u0629 120 \u062d\u0631\u0641\u064b\u0627';
  }

  if (!values.description.trim()) {
    errors.description = 'يرجى إدخال وصف المنتج';
  }

  if (!values.sellingPrice.trim() || !Number.isFinite(sellingPrice) || sellingPrice <= 0) {
    errors.sellingPrice = 'يرجى إدخال سعر بيع صحيح أكبر من صفر';
  }

  if (
    values.compareAtPrice.trim() &&
    (compareAtPrice === null || !Number.isFinite(compareAtPrice) || compareAtPrice <= sellingPrice)
  ) {
    errors.compareAtPrice = 'السعر قبل الخصم يجب أن يكون أكبر من سعر البيع أو اتركه فارغا';
  }

  if (!values.costPrice.trim() || !Number.isFinite(costPrice) || costPrice < 0) {
    errors.costPrice = 'يرجى إدخال تكلفة شراء صحيحة';
  }

  if (!values.stock.trim() || !Number.isInteger(stock) || stock < 0) {
    errors.stock = 'يرجى إدخال كمية مخزون صحيحة بدون كسور';
  }

  if (images.length === 0) {
    errors.images = 'يرجى إضافة صورة واحدة على الأقل';
  }

  return errors;
}

export function createProductFromForm(values: ProductFormValues, existingProduct?: Product): Product {
  const sellingPrice = Number(values.sellingPrice);
  const compareAtPrice = values.compareAtPrice.trim() ? Number(values.compareAtPrice) : null;
  const costPrice = Number(values.costPrice);
  const stock = Number(values.stock);
  const price = compareAtPrice && compareAtPrice > sellingPrice ? compareAtPrice : sellingPrice;
  const discountPercent = getDerivedDiscountPercent(sellingPrice, compareAtPrice);
  const images = normalizeImages(values.images, values.primaryImageIndex);
  const now = Date.now();

  return {
    ...existingProduct,
    id: existingProduct?.id ?? `prd-admin-${now}`,
    slug: existingProduct?.slug ?? createProductSlug(values.name, now),
    shortDescription: values.description.trim().slice(0, 140),
    specifications: existingProduct?.specifications ?? {},
    name: values.name.trim(),
    department: values.department as ProductDepartment,
    category: values.category as CategorySlug,
    brand: normalizeProductBrand(values.brand),
    description: values.description.trim(),
    price,
    compareAtPrice,
    sellingPrice,
    costPrice,
    discountPercent,
    images,
    stock,
    isActive: values.isAvailable,
    isAvailable: values.isAvailable && stock > 0,
  };
}

export function createProductSlug(name: string, suffix = Date.now()) {
  const normalized = name
    .trim()
    .toLowerCase()
    .split('')
    .map((character) => arabicSlugMap[character] ?? character)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${normalized || 'product'}-${suffix.toString(36)}`;
}
