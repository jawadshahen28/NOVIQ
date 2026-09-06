import { useEffect, useState } from 'react';
import type { Product } from '../../../types/catalog';
import { getOptimizedImageUrl, getResponsiveImageProps } from '../../../utils/responsiveImages';

interface ProductGalleryProps {
  product: Product;
}

const mainProductImageSizes =
  '(max-width: 639px) 100vw, (max-width: 1023px) 80vw, 560px';
const mainProductImageWidths = [480, 720, 960, 1280] as const;

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  useEffect(() => {
    setSelectedImage(product.images[0]);
  }, [product]);

  return (
    <div className="grid gap-3 sm:gap-4" data-product-gallery>
      <div
        className="flex h-[min(86vw,380px)] w-full items-center justify-center overflow-hidden rounded-md border border-noviq-border bg-noviq-card p-2 sm:h-[430px] sm:p-3 lg:h-[520px] xl:h-[560px]"
        data-product-main-frame
      >
        <img
          {...getResponsiveImageProps(selectedImage, {
            fallbackWidth: 960,
            sizes: mainProductImageSizes,
            widths: mainProductImageWidths,
          })}
          alt={product.name}
          className="h-full w-full object-contain"
          decoding="async"
          fetchPriority="high"
          loading="eager"
          data-product-main-image
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden">
        {product.images.map((image) => (
          <button
            key={image}
            className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-md border bg-noviq-card p-1 transition sm:h-[88px] sm:w-[88px] lg:h-[92px] lg:w-[92px] ${
              selectedImage === image
                ? 'border-noviq-gold'
                : 'border-noviq-border hover:border-noviq-goldHover'
            }`}
            onClick={() => setSelectedImage(image)}
            type="button"
            aria-label={`اختيار صورة ${product.name}`}
            aria-pressed={selectedImage === image}
            data-product-thumbnail
          >
            <img
              src={getOptimizedImageUrl(image, 240)}
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
