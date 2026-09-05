import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStoreCatalog } from '../features/store/catalog/StoreCatalogContext';
import HomeProductCard from '../features/store/components/HomeProductCard';
import TrustStrip from '../features/store/components/TrustStrip';
import { getDiscountedPrice } from '../utils/format';

type SortMode = 'newest' | 'price-asc' | 'price-desc' | 'discount';

const categoryImagePositions: Record<string, string> = {
  rolex: '38% center',
  curren: '48% center',
  boss: '30% center',
};

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'discount', label: 'الأكثر خصما' },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const { categories, loadProductsByCategory, products } = useStoreCatalog();

  const normalizedSlug = slug?.toLowerCase();
  const category = categories.find((candidate) => candidate.slug === normalizedSlug);

  useEffect(() => {
    if (normalizedSlug) {
      void loadProductsByCategory(normalizedSlug);
    }
  }, [loadProductsByCategory, normalizedSlug]);

  const categoryProducts = useMemo(() => {
    if (!category) {
      return [];
    }

    return products
      .filter((product) => product.category === category.slug)
      .sort((first, second) => {
        if (sortMode === 'price-asc') {
          return getDiscountedPrice(first) - getDiscountedPrice(second);
        }

        if (sortMode === 'price-desc') {
          return getDiscountedPrice(second) - getDiscountedPrice(first);
        }

        if (sortMode === 'discount') {
          return second.discountPercent - first.discountPercent;
        }

        return 0;
      });
  }, [category, sortMode]);

  if (!category) {
    return (
      <section className="min-h-[520px] bg-noviq-black py-14 sm:py-16">
        <div className="luxury-container">
          <div className="mx-auto max-w-xl rounded-md border border-noviq-border bg-noviq-card px-5 py-12 text-center sm:px-6 sm:py-14">
            <p className="text-xs font-semibold text-noviq-gold">NOVIQ</p>
            <h1 className="mt-3 font-heading text-2xl font-bold text-noviq-text sm:text-3xl">
              الفئة غير موجودة
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-noviq-secondaryText">
              لم نتمكن من العثور على الفئة المطلوبة.
            </p>
            <Link
              to="/"
              className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-6 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
            >
              العودة للمتجر
              <ArrowLeft size={17} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const availableCount = categoryProducts.filter(
    (product) => product.isAvailable && product.stock > 0,
  ).length;
  const productCountLabel = `${categoryProducts.length} ساعة`;
  const imagePosition = categoryImagePositions[category.slug] ?? 'center';

  return (
    <div className="bg-noviq-black">
      <section className="relative overflow-hidden border-b border-noviq-border bg-noviq-pure">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[48%] sm:w-[42%] lg:hidden">
          <img
            src={category.image}
            alt=""
            className="h-full w-full object-cover opacity-55"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 bg-noviq-black opacity-35" />
          <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-noviq-pure to-transparent" />
        </div>

        <div className="luxury-container relative grid min-h-[220px] py-5 min-[390px]:min-h-[228px] sm:min-h-[250px] sm:py-6 lg:min-h-[300px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:py-11">
          <div className="home-reveal max-w-[80%] min-[390px]:max-w-[82%] sm:max-w-[70%] lg:max-w-2xl">
            <nav
              aria-label="مسار الصفحة"
              className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-noviq-muted sm:mb-3 sm:text-xs"
            >
              <Link to="/" className="transition hover:text-noviq-gold">
                الرئيسية
              </Link>
              <span>/</span>
              <Link to="/#categories" className="transition hover:text-noviq-gold">
                الفئات
              </Link>
              <span>/</span>
              <span className="text-noviq-gold">{category.name}</span>
            </nav>

            <div className="mb-2.5 h-px w-14 bg-noviq-gold sm:mb-4 sm:w-16" />
            <h1 className="font-heading text-[28px] font-bold leading-tight text-noviq-text min-[390px]:text-3xl sm:text-4xl lg:text-[42px]">
              ساعات {category.name}
            </h1>
            <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-noviq-secondaryText sm:mt-3 sm:text-base sm:leading-8">
              اكتشف مجموعة مختارة من ساعات {category.name} المتوفرة لدى NOVIQ.
            </p>
            <p className="mt-3 inline-flex rounded-sm border border-noviq-goldBorder bg-noviq-secondary px-3 py-1.5 text-xs font-semibold text-noviq-gold sm:mt-4">
              {availableCount} ساعة متوفرة
            </p>
          </div>

          <div className="hero-image-reveal relative hidden h-60 overflow-hidden rounded-sm bg-noviq-secondary lg:block">
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover"
              style={{ objectPosition: imagePosition }}
            />
            <div className="absolute inset-0 bg-noviq-black opacity-35" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-noviq-pure to-transparent" />
          </div>
        </div>
      </section>

      <section className="border-b border-noviq-border bg-noviq-black py-4">
        <div className="luxury-container">
          <div className="flex flex-col gap-3 rounded-md border border-noviq-border bg-noviq-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-xs font-medium text-noviq-muted sm:text-sm">{productCountLabel}</p>

            <label className="flex w-full flex-col gap-2 text-xs font-semibold text-noviq-secondaryText sm:w-auto sm:min-w-[270px] sm:flex-row sm:items-center">
              <span className="shrink-0">ترتيب حسب</span>
              <span className="relative block w-full">
                <select
                  className="field h-11 appearance-none py-2.5 pl-10 pr-3 text-xs sm:text-sm"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-noviq-muted"
                  size={16}
                  strokeWidth={1.8}
                />
              </span>
            </label>
          </div>
        </div>
      </section>

      <section className="py-7 pb-12 lg:py-10 lg:pb-14">
        <div className="luxury-container">
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {categoryProducts.map((product, index) => (
                <HomeProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-noviq-border bg-noviq-card px-5 py-12 text-center sm:px-6">
              <h2 className="font-heading text-2xl font-bold text-noviq-text">
                لا توجد ساعات متوفرة في هذه الفئة حاليا.
              </h2>
              <Link
                to="/#selected-watches"
                className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-noviq-gold bg-noviq-gold px-6 text-sm font-bold text-noviq-black transition hover:border-noviq-goldHover hover:bg-noviq-goldHover"
              >
                تصفح جميع الساعات
                <ArrowLeft size={17} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <TrustStrip />
    </div>
  );
}
