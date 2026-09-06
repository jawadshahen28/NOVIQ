import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStoreCatalog } from '../catalog/StoreCatalogContext';
import type { CategorySlug } from '../../../types/catalog';
import { getResponsiveImageProps } from '../../../utils/responsiveImages';

const brandLabels: Record<CategorySlug, string> = {
  rolex: 'ROLEX',
  curren: 'CURREN',
  boss: 'BOSS',
};

const imagePositions: Record<CategorySlug, string> = {
  rolex: '38% center',
  curren: '48% center',
  boss: '30% center',
};

const categoryImageSizes =
  '(max-width: 429px) 68vw, (max-width: 639px) 62vw, (max-width: 1023px) 46vw, 31vw';
const categoryImageWidths = [320, 480, 640, 960] as const;

export default function HomeCategoryGallery() {
  const { categories } = useStoreCatalog();
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollGallery(direction: 'left' | 'right') {
    scrollerRef.current?.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth',
    });
  }

  return (
    <section id="categories" className="bg-noviq-black pt-7 pb-7 lg:pt-9 lg:pb-10">
      <div className="luxury-container">
        <div className="mb-5 text-center lg:mb-6">
          <h2 className="font-heading text-2xl font-semibold text-noviq-gold lg:text-[28px]">
            الفئات
          </h2>
        </div>

        <div className="relative">
          <button
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-noviq-border bg-noviq-pure text-noviq-text transition duration-200 hover:border-noviq-gold hover:text-noviq-gold lg:flex"
            onClick={() => scrollGallery('left')}
            type="button"
            aria-label="تحريك الفئات يسارا"
          >
            <ArrowLeft size={18} />
          </button>

          <div
            ref={scrollerRef}
            className="grid snap-x snap-mandatory auto-cols-[68%] grid-flow-col gap-3 overflow-x-auto pb-1 [scrollbar-width:none] min-[430px]:auto-cols-[62%] sm:auto-cols-[46%] sm:gap-4 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="home-reveal group relative h-[116px] snap-start overflow-hidden rounded border border-noviq-luxuryBorder bg-noviq-card transition duration-300 hover:-translate-y-0.5 hover:border-noviq-gold min-[390px]:h-[126px] sm:h-[142px] lg:h-auto lg:aspect-[2.2/1]"
                style={{ animationDelay: `${index * 60}ms` }}
                data-home-category-card
              >
                <img
                  {...getResponsiveImageProps(category.image, {
                    fallbackWidth: 640,
                    sizes: categoryImageSizes,
                    widths: categoryImageWidths,
                  })}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
                  style={{ objectPosition: imagePositions[category.slug] }}
                  decoding="async"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-noviq-black opacity-45" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-noviq-pure opacity-75 lg:h-16" />
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-noviq-gold sm:text-xs lg:bottom-4">
                  {brandLabels[category.slug]}
                </p>
                <h3 className="absolute bottom-2.5 right-3 font-heading text-sm font-semibold text-noviq-text sm:text-base lg:bottom-3 lg:right-4">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>

          <button
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-noviq-border bg-noviq-pure text-noviq-text transition duration-200 hover:border-noviq-gold hover:text-noviq-gold lg:flex"
            onClick={() => scrollGallery('right')}
            type="button"
            aria-label="تحريك الفئات يمينا"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
