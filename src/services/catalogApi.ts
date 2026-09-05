import { apiRequest } from './apiClient';
import type { Category, Product } from '../types/catalog';

interface CategoryResponse {
  category: Category;
}

interface CategoriesResponse {
  categories: Category[];
}

interface ProductResponse {
  product: Product;
}

interface ProductsResponse {
  products: Product[];
  pagination?: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

export function listCategories(admin = false) {
  return apiRequest<CategoriesResponse>(admin ? '/admin/categories' : '/categories');
}

export function listProducts(options: { admin?: boolean; category?: string } = {}) {
  const path = options.admin ? '/admin/products' : '/products';
  const query = options.category ? `?category=${encodeURIComponent(options.category)}` : '';
  return apiRequest<ProductsResponse>(`${path}${query}`);
}

export function getProduct(slug: string) {
  return apiRequest<ProductResponse>(`/products/${encodeURIComponent(slug)}`);
}

export function createCategory(category: Omit<Category, 'id'>) {
  return apiRequest<CategoryResponse>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

export function updateCategory(id: string, category: Partial<Omit<Category, 'id'>>) {
  return apiRequest<CategoryResponse>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(category),
  });
}

export function deleteCategory(id: string) {
  return apiRequest<{ categoryId: string; deleted: boolean }>(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

interface UploadedImageResponse {
  url: string;
  publicId: string;
}

export async function uploadCatalogImage(file: File, type: 'category' | 'product') {
  const body = new FormData();
  body.set('image', file);
  body.set('type', type);

  return apiRequest<UploadedImageResponse>('/admin/uploads/image', {
    body,
    method: 'POST',
  });
}
function toProductPayload(product: Product) {
  return {
    categoryId: product.categoryId,
    category: product.categoryId ? undefined : product.category,
    compareAtPrice: product.discountPercent > 0 ? product.price : null,
    costPrice: product.costPrice,
    description: product.description,
    images: product.images,
    isActive: product.isAvailable,
    name: product.name,
    price: product.sellingPrice ?? Math.round(product.price * (1 - product.discountPercent / 100)),
    primaryImage: product.images[0],
    shortDescription: product.shortDescription,
    slug: product.slug,
    specifications: product.specifications,
    stock: product.stock,
  };
}

export function createProduct(product: Product) {
  return apiRequest<ProductResponse>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(toProductPayload(product)),
  });
}

export function updateProduct(id: string, product: Product) {
  return apiRequest<ProductResponse>(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toProductPayload(product)),
  });
}

export function updateProductStock(id: string, stock: number) {
  return apiRequest<ProductResponse>(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  });
}

export function deleteProduct(id: string) {
  return apiRequest<{ deleted: boolean; productId: string }>(`/admin/products/${id}`, {
    method: 'DELETE',
  });
}
