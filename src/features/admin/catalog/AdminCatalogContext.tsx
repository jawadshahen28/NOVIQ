import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createCategory as createCategoryApi,
  createProduct as createProductApi,
  deleteCategory as deleteCategoryApi,
  deleteProduct as deleteProductApi,
  listCategories,
  listProducts,
  updateCategory as updateCategoryApi,
  updateProduct as updateProductApi,
  updateProductStock as updateProductStockApi,
} from '../../../services/catalogApi';
import type { Category, Product } from '../../../types/catalog';
import { useAdminAuth } from '../auth/AdminAuthContext';

interface AdminCatalogContextValue {
  categories: Category[];
  products: Product[];
  addCategory: (category: Category) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getCategoryProductCount: (categorySlug: string) => number;
  updateCategory: (categoryId: string, category: Category) => Promise<void>;
  updateProduct: (productId: string, product: Product) => Promise<void>;
  updateProductStock: (productId: string, stock: number) => Promise<void>;
}

const AdminCatalogContext = createContext<AdminCatalogContextValue | undefined>(undefined);

export function AdminCatalogProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogError, setCatalogError] = useState(false);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    void Promise.all([listCategories(true), listProducts({ admin: true })])
      .then(([categoryResponse, productResponse]) => {
        if (isMounted) {
          setCategories(categoryResponse.categories);
          setProducts(productResponse.products);
          setCatalogError(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCatalogError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading]);

  const addProduct = useCallback(async (product: Product) => {
    const response = await createProductApi(product);
    setProducts((currentProducts) => [response.product, ...currentProducts]);
  }, []);

  const updateProduct = useCallback(async (productId: string, product: Product) => {
    const response = await updateProductApi(productId, product);
    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === productId ? response.product : currentProduct,
      ),
    );
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    await deleteProductApi(productId);
    setProducts((currentProducts) =>
      currentProducts.filter((currentProduct) => currentProduct.id !== productId),
    );
  }, []);

  const updateProductStock = useCallback(async (productId: string, stock: number) => {
    const response = await updateProductStockApi(productId, stock);
    setProducts((currentProducts) =>
      currentProducts.map((product) => (product.id === productId ? response.product : product)),
    );
  }, []);

  const addCategory = useCallback(async (category: Category) => {
    const response = await createCategoryApi(category);
    setCategories((currentCategories) => [response.category, ...currentCategories]);
  }, []);

  const updateCategory = useCallback(async (categoryId: string, category: Category) => {
    const response = await updateCategoryApi(categoryId, category);
    setCategories((currentCategories) =>
      currentCategories.map((currentCategory) =>
        currentCategory.id === categoryId ? response.category : currentCategory,
      ),
    );
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    await deleteCategoryApi(categoryId);
    setCategories((currentCategories) =>
      currentCategories.filter((currentCategory) => currentCategory.id !== categoryId),
    );
  }, []);

  const getCategoryProductCount = useCallback(
    (categorySlug: string) =>
      products.filter((product) => product.category === categorySlug).length,
    [products],
  );

  const value = useMemo<AdminCatalogContextValue>(
    () => ({
      categories,
      products,
      addCategory,
      addProduct,
      deleteCategory,
      deleteProduct,
      getCategoryProductCount,
      updateCategory,
      updateProduct,
      updateProductStock,
    }),
    [
      addCategory,
      addProduct,
      categories,
      deleteCategory,
      deleteProduct,
      getCategoryProductCount,
      products,
      updateCategory,
      updateProduct,
      updateProductStock,
    ],
  );

  return (
    <AdminCatalogContext.Provider value={value}>
      {catalogError ? (
        <p className="mb-4 text-sm font-semibold text-noviq-gold">
          تعذر تحميل بيانات المنتجات والفئات
        </p>
      ) : null}
      {children}
    </AdminCatalogContext.Provider>
  );
}

export function useAdminCatalog() {
  const context = useContext(AdminCatalogContext);

  if (!context) {
    throw new Error('useAdminCatalog must be used inside AdminCatalogProvider');
  }

  return context;
}
