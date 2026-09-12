import { useEffect, useRef, useState } from 'react';
import type { Product } from '../../../types/catalog';
import { getOptimizedImageUrl, getResponsiveImageProps } from '../../../utils/responsiveImages';

interface ProductGalleryProps {
  product: Product;
}

const mainProductImageSizes =
  '(max-width: 639px) calc(100vw - 28px), (max-width: 1023px) calc(100vw - 48px), 560px';
const mainProductImageWidths = [480, 640, 800, 960, 1120, 1280] as const;
const mainProductImageFallbackWidth = 960;

const prefetchedMainImageUrls = new Set<string>();
const pendingMainImagePrefetches = new Map<string, Promise<void>>();

type ImageFetchPriority = 'high' | 'low' | 'auto';

function setImageFetchPriority(image: HTMLImageElement, fetchPriority: ImageFetchPriority) {
  (image as HTMLImageElement & { fetchPriority?: ImageFetchPriority }).fetchPriority =
    fetchPriority;
}

function getMainProductDisplayWidth() {
  if (typeof window === 'undefined') {
    return mainProductImageFallbackWidth;
  }

  const viewportWidth = window.innerWidth || mainProductImageFallbackWidth;
  const displayWidth =
    viewportWidth <= 639
      ? Math.max(320, viewportWidth - 28)
      : viewportWidth <= 1023
        ? Math.max(320, viewportWidth - 48)
        : 560;
  const devicePixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
  const requestedWidth = displayWidth * devicePixelRatio;

  return (
    mainProductImageWidths.find((width) => width >= requestedWidth) ??
    mainProductImageWidths[mainProductImageWidths.length - 1]
  );
}

function getMainProductDisplayImageUrl(source: string) {
  return getOptimizedImageUrl(source, getMainProductDisplayWidth());
}

function preloadMainProductImageUrl(url: string) {
  if (typeof Image === 'undefined' || !url) {
    return Promise.resolve();
  }

  if (prefetchedMainImageUrls.has(url)) {
    return Promise.resolve();
  }

  const pendingPrefetch = pendingMainImagePrefetches.get(url);

  if (pendingPrefetch) {
    return pendingPrefetch;
  }

  const prefetch = new Promise<void>((resolve) => {
    const image = new Image();

    image.decoding = 'async';
    setImageFetchPriority(image, 'low');

    image.onload = () => {
      prefetchedMainImageUrls.add(url);
      resolve();
    };
    image.onerror = () => {
      resolve();
    };
    image.src = url;
  }).finally(() => {
    pendingMainImagePrefetches.delete(url);
  });

  pendingMainImagePrefetches.set(url, prefetch);

  return prefetch;
}

async function preloadMainProductImageForDisplay(url: string) {
  if (typeof Image === 'undefined' || !url) {
    return;
  }

  const pendingPrefetch = pendingMainImagePrefetches.get(url);

  if (pendingPrefetch) {
    await pendingPrefetch;
  }

  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    let isSettled = false;

    const resolveAfterDecode = () => {
      if (isSettled) {
        return;
      }

      isSettled = true;

      if (typeof image.decode === 'function') {
        image
          .decode()
          .catch(() => undefined)
          .then(() => resolve());
        return;
      }

      resolve();
    };

    image.decoding = 'async';
    setImageFetchPriority(image, 'high');
    image.onload = resolveAfterDecode;
    image.onerror = () => reject(new Error('Product image failed to load.'));
    image.src = url;

    if (image.complete) {
      resolveAfterDecode();
    }
  });
}

function scheduleIdlePrefetch(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  if ('requestIdleCallback' in window) {
    const idleHandle = window.requestIdleCallback(callback, { timeout: 1200 });

    return () => window.cancelIdleCallback(idleHandle);
  }

  const timeoutHandle = setTimeout(callback, 650);

  return () => clearTimeout(timeoutHandle);
}

function prefetchMainProductImages(images: readonly string[], isCurrent: () => boolean) {
  for (const image of images) {
    if (!isCurrent()) {
      return;
    }

    void preloadMainProductImageUrl(getMainProductDisplayImageUrl(image));
  }
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const initialImage = product.images[0];
  const imageListKey = product.images.join('\u0001');
  const prefetchRunRef = useRef(0);
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [visibleImage, setVisibleImage] = useState(initialImage);
  const [isInitialMainImageLoaded, setIsInitialMainImageLoaded] = useState(false);

  useEffect(() => {
    prefetchRunRef.current += 1;
    setSelectedImage(initialImage);
    setVisibleImage(initialImage);
    setIsInitialMainImageLoaded(false);
  }, [imageListKey, initialImage, product.id]);

  useEffect(() => {
    if (selectedImage === visibleImage) {
      return undefined;
    }

    let isStale = false;

    void preloadMainProductImageForDisplay(getMainProductDisplayImageUrl(selectedImage))
      .catch(() => undefined)
      .then(() => {
        if (!isStale) {
          setVisibleImage(selectedImage);
        }
      });

    return () => {
      isStale = true;
    };
  }, [product.id, selectedImage, visibleImage]);

  useEffect(() => {
    if (!isInitialMainImageLoaded) {
      return undefined;
    }

    const runId = prefetchRunRef.current + 1;

    prefetchRunRef.current = runId;

    prefetchMainProductImages(product.images.slice(1, 3), () => prefetchRunRef.current === runId);

    const cancelIdlePrefetch = scheduleIdlePrefetch(() => {
      prefetchMainProductImages(product.images.slice(3), () => {
        return prefetchRunRef.current === runId;
      });
    });

    return () => {
      prefetchRunRef.current += 1;
      cancelIdlePrefetch();
    };
  }, [imageListKey, isInitialMainImageLoaded, product.id]);

  const handleMainImageLoad = () => {
    if (visibleImage === initialImage) {
      setIsInitialMainImageLoaded(true);
    }
  };

  return (
    <div className="grid gap-3 sm:gap-4" data-product-gallery>
      <div
        className="flex h-[min(86vw,380px)] w-full items-center justify-center overflow-hidden rounded-md border border-noviq-border bg-noviq-card p-2 sm:h-[430px] sm:p-3 lg:h-[520px] xl:h-[560px]"
        data-product-main-frame
      >
        <img
          {...getResponsiveImageProps(visibleImage, {
            fallbackWidth: mainProductImageFallbackWidth,
            sizes: mainProductImageSizes,
            widths: mainProductImageWidths,
          })}
          alt={product.name}
          className="h-full w-full object-contain"
          decoding="async"
          fetchPriority="high"
          loading="eager"
          onLoad={handleMainImageLoad}
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
