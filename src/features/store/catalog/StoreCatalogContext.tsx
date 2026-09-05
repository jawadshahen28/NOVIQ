import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getProduct, listCategories, listProducts } from '../../../services/catalogApi';
import type { Category, Product } from '../../../types/catalog';

interface StoreCatalogContextValue {
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  loadProductsByCategory: (slug: string) => Promise<Product[]>;
  loadProduct: (slug: string) => Promise<Product>;
}

const StoreCatalogContext = createContext<StoreCatalogContextValue | undefined>(undefined);

export function StoreCatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void Promise.all([listCategories(), listProducts()]).then(
      ([categoryResponse, productResponse]) => {
        setCategories(categoryResponse.categories);
        setProducts(productResponse.products);
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
  }, []);

  const loadProductsByCategory = useCallback(async (slug: string) => {
    const response = await listProducts({ category: slug });
    setProducts((current) => [
      ...current.filter((product) => product.category !== slug),
      ...response.products,
    ]);
    return response.products;
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
      loadProductsByCategory,
      loadProduct,
    }),
    [categories, isLoading, loadProduct, loadProductsByCategory, products],
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
