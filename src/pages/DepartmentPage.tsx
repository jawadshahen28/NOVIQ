import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../features/products/components/ProductCard';
import { useStoreCatalog } from '../features/store/catalog/StoreCatalogContext';
import { listProducts } from '../services/catalogApi';
import type { Product, ProductDepartment } from '../types/catalog';

interface DepartmentPageProps {
  department: ProductDepartment;
  title: string;
}

function normalizeBrand(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function getBrandKey(value: string) {
  return normalizeBrand(value).toLocaleLowerCase();
}

export default function DepartmentPage({ department, title }: DepartmentPageProps) {
  const { cacheProducts, categories } = useStoreCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category')?.trim().toLowerCase() ?? '';
  const selectedBrand = normalizeBrand(searchParams.get('brand') ?? '');
  const [departmentProducts, setDepartmentProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadDepartmentProducts() {
      setIsLoading(true);
      setHasError(false);
      setDepartmentProducts([]);
      setCategoryProducts([]);
      setProducts([]);

      try {
        const departmentResponse = await listProducts({ department });
        if (!isCurrent) return;

        const availableCategorySlugs = new Set(
          departmentResponse.products.map((product) => product.category),
        );
        setDepartmentProducts(departmentResponse.products);
        cacheProducts(departmentResponse.products);

        if (!selectedCategory) {
          if (selectedBrand) {
            setSearchParams({}, { replace: true });
          }
          setProducts(departmentResponse.products);
          return;
        }

        if (!availableCategorySlugs.has(selectedCategory)) {
          setSearchParams({}, { replace: true });
          setProducts(departmentResponse.products);
          return;
        }

        const categoryResponse = await listProducts({
          category: selectedCategory,
          department,
        });
        if (!isCurrent) return;

        setCategoryProducts(categoryResponse.products);

        if (!selectedBrand) {
          setProducts(categoryResponse.products);
          return;
        }

        const availableBrand = categoryResponse.products
          .map((product) => normalizeBrand(product.brand ?? ''))
          .find((brand) => brand && getBrandKey(brand) === getBrandKey(selectedBrand));

        if (!availableBrand) {
          setSearchParams({ category: selectedCategory }, { replace: true });
          setProducts(categoryResponse.products);
          return;
        }

        const brandResponse = await listProducts({
          brand: availableBrand,
          category: selectedCategory,
          department,
        });
        if (isCurrent) {
          setProducts(brandResponse.products);
        }
      } catch {
        if (isCurrent) {
          setDepartmentProducts([]);
          setCategoryProducts([]);
          setProducts([]);
          setHasError(true);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadDepartmentProducts();

    return () => {
      isCurrent = false;
    };
  }, [cacheProducts, department, selectedBrand, selectedCategory, setSearchParams]);

  const availableCategories = useMemo(() => {
    const availableSlugs = new Set(departmentProducts.map((product) => product.category));
    return categories.filter((category) => availableSlugs.has(category.slug));
  }, [categories, departmentProducts]);

  const availableBrands = useMemo(() => {
    const brands = new Map<string, string>();

    categoryProducts.forEach((product) => {
      const brand = normalizeBrand(product.brand ?? '');
      if (brand) {
        brands.set(getBrandKey(brand), brands.get(getBrandKey(brand)) ?? brand);
      }
    });

    return Array.from(brands.values()).sort((first, second) =>
      first.localeCompare(second, undefined, { sensitivity: 'base' }),
    );
  }, [categoryProducts]);

  function selectCategory(category: string) {
    setSearchParams(category ? { category } : {});
  }

  function selectBrand(brand: string) {
    setSearchParams(brand ? { category: selectedCategory, brand } : { category: selectedCategory });
  }

  return (
    <div className="min-h-[560px] bg-noviq-black">
      <section className="border-b border-noviq-border bg-noviq-pure py-9 sm:py-11 lg:py-12">
        <div className="luxury-container text-center">
          <div className="mx-auto mb-4 h-px w-14 bg-noviq-gold" />
          <h1 className="font-heading text-3xl font-bold text-noviq-text sm:text-4xl lg:text-[42px]">
            {title}
          </h1>
        </div>
      </section>

      <section className="border-b border-noviq-border py-5 sm:py-6">
        <div className="luxury-container">
          <h2 className="mb-4 font-heading text-xl font-semibold text-noviq-gold sm:text-2xl">
            الفئات
          </h2>
          <div
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="تصفية المنتجات حسب الفئة"
          >
            <button
              className={`min-h-11 shrink-0 rounded border px-5 text-sm font-semibold transition ${
                !selectedCategory
                  ? 'border-noviq-gold bg-noviq-gold text-noviq-black'
                  : 'border-noviq-border bg-noviq-card text-noviq-secondaryText hover:border-noviq-gold hover:text-noviq-gold'
              }`}
              onClick={() => selectCategory('')}
              type="button"
              aria-pressed={!selectedCategory}
            >
              الكل
            </button>
            {availableCategories.map((category) => {
              const isSelected = selectedCategory === category.slug;

              return (
                <button
                  key={category.id}
                  className={`min-h-11 shrink-0 rounded border px-5 text-sm font-semibold transition ${
                    isSelected
                      ? 'border-noviq-gold bg-noviq-gold text-noviq-black'
                      : 'border-noviq-border bg-noviq-card text-noviq-secondaryText hover:border-noviq-gold hover:text-noviq-gold'
                  }`}
                  onClick={() => selectCategory(category.slug)}
                  type="button"
                  aria-pressed={isSelected}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selectedCategory ? (
        <section className="border-b border-noviq-border py-5 sm:py-6">
          <div className="luxury-container">
            <h2 className="mb-4 font-heading text-xl font-semibold text-noviq-gold sm:text-2xl">
              {'\u0627\u0644\u0645\u0627\u0631\u0643\u0627\u062a'}
            </h2>
            <div
              className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label={'\u062a\u0635\u0641\u064a\u0629 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u062d\u0633\u0628 \u0627\u0644\u0645\u0627\u0631\u0643\u0629'}
            >
              <button
                className={`min-h-11 shrink-0 rounded border px-5 text-sm font-semibold transition ${
                  !selectedBrand
                    ? 'border-noviq-gold bg-noviq-gold text-noviq-black'
                    : 'border-noviq-border bg-noviq-card text-noviq-secondaryText hover:border-noviq-gold hover:text-noviq-gold'
                }`}
                onClick={() => selectBrand('')}
                type="button"
                aria-pressed={!selectedBrand}
              >
                {'\u0643\u0644 \u0627\u0644\u0645\u0627\u0631\u0643\u0627\u062a'}
              </button>
              {availableBrands.map((brand) => {
                const isSelected = getBrandKey(selectedBrand) === getBrandKey(brand);

                return (
                  <button
                    key={getBrandKey(brand)}
                    className={`min-h-11 shrink-0 rounded border px-5 text-sm font-semibold transition ${
                      isSelected
                        ? 'border-noviq-gold bg-noviq-gold text-noviq-black'
                        : 'border-noviq-border bg-noviq-card text-noviq-secondaryText hover:border-noviq-gold hover:text-noviq-gold'
                    }`}
                    onClick={() => selectBrand(brand)}
                    type="button"
                    aria-pressed={isSelected}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-7 pb-12 lg:py-10 lg:pb-14">
        <div className="luxury-container">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center" aria-label="جارٍ تحميل المنتجات" role="status">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-noviq-border border-t-noviq-gold" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-noviq-border bg-noviq-card px-5 py-12 text-center sm:px-6">
              <h2 className="font-heading text-xl font-bold text-noviq-text sm:text-2xl">
                {hasError
                  ? 'تعذر تحميل المنتجات'
                  : 'لا توجد منتجات متاحة حاليًا'}
              </h2>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
