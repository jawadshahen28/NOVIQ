import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { getProduct, listCategories, listProducts } from '../../../services/catalogApi';
import type { Category, Product } from '../../../types/catalog';

interface StoreCatalogContextValue {
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  cacheProducts: (products: Product[]) => void;
  loadProductsByCategory: (slug: string) => Promise<Product[]>;
  loadProduct: (slug: string) => Promise<Product>;
}

const StoreCatalogContext = createContext<StoreCatalogContextValue | undefined>(undefined);

export function StoreCatalogProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isDepartmentRoute = location.pathname === '/men' || location.pathname === '/women';
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    void Promise.all([
      listCategories(),
      isDepartmentRoute ? Promise.resolve({ products: [] }) : listProducts(),
    ]).then(
      ([categoryResponse, productResponse]) => {
        setCategories(categoryResponse.categories);
        if (!isDepartmentRoute) {
          setProducts(productResponse.products);
        }
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
  }, [isDepartmentRoute]);

  const loadProductsByCategory = useCallback(async (slug: string) => {
    const response = await listProducts({ category: slug });
    setProducts((current) => [
      ...current.filter((product) => product.category !== slug),
      ...response.products,
    ]);
    return response.products;
  }, []);

  const cacheProducts = useCallback((nextProducts: Product[]) => {
    const nextProductIds = new Set(nextProducts.map((product) => product.id));
    setProducts((current) => [
      ...current.filter((product) => !nextProductIds.has(product.id)),
      ...nextProducts,
    ]);
  }, []);

  const loadProduct = useCallback(async (slug: string) => {
    const response = await getProduct(slug);
    setProducts((current) => [
      ...current.filter((product) => product.slug !== slug),
      response.product,
    ]);
    return response.product;
  }, []);

  const value = useMemo<StoreCatalogContextValue>(
    () => ({
      categories,
      products,
      isLoading,
      cacheProducts,
      loadProductsByCategory,
      loadProduct,
    }),
    [cacheProducts, categories, isLoading, loadProduct, loadProductsByCategory, products],
  );

  return <StoreCatalogContext.Provider value={value}>{children}</StoreCatalogContext.Provider>;
}

export function useStoreCatalog() {
  const context = useContext(StoreCatalogContext);

  if (!context) {
    throw new Error('useStoreCatalog must be used inside StoreCatalogProvider');
  }

  return context;
}
