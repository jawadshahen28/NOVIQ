import { matchPath, useLocation } from 'react-router-dom';
import Seo, {
  createAbsoluteUrl,
  createSiteUrl,
  SEO_SITE_NAME,
  type JsonLdValue,
} from '../../../components/Seo';
import fallbackOgImage from '../../../assets/noviq-reference-hero-lcp.jpg';
import type { Category, Product } from '../../../types/catalog';
import { getDiscountedPrice, STORE_CURRENCY_CODE } from '../../../utils/format';
import { useStoreCatalog } from '../catalog/StoreCatalogContext';
import { useStoreSettings } from '../settings/StoreSettingsContext';
import { defaultStoreSettings, type StoreSettings } from '../settings/storeSettingsDefaults';

const fallbackDescription =
  'NOVIQ متجر ساعات بتصاميم مختارة تجمع بين الأناقة والجودة والتفاصيل التي تصنع الفرق.';

const workflowSeo: Record<string, { description: string; title: string }> = {
  '/cart': {
    description: 'راجع الساعات المختارة في سلة NOVIQ قبل إتمام الطلب.',
    title: `سلة التسوق | ${SEO_SITE_NAME}`,
  },
  '/checkout': {
    description: 'أكمل بيانات طلبك لدى NOVIQ بطريقة آمنة وواضحة.',
    title: `إتمام الطلب | ${SEO_SITE_NAME}`,
  },
  '/order-success': {
    description: 'تم استلام طلبك لدى NOVIQ وسيتم التواصل معك لتأكيد التفاصيل.',
    title: `تم استلام الطلب | ${SEO_SITE_NAME}`,
  },
};

function normalizePathname(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function getText(value: string | undefined, fallback: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : fallback;
}

function createSocialUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const isPublicHttpUrl = url.protocol === 'https:' || url.protocol === 'http:';
    const hostname = url.hostname.toLowerCase();
    const isPlaceholder =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost') ||
      hostname === 'example.com' ||
      hostname.endsWith('.example.com');

    return isPublicHttpUrl && !isPlaceholder ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function createHomepageStructuredData(settings: StoreSettings): JsonLdValue[] {
  const sameAs = [settings.instagramUrl, settings.facebookUrl]
    .map(createSocialUrl)
    .filter((url): url is string => Boolean(url));
  const organization: JsonLdValue = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    logo: createSiteUrl('/noviq-favicon.png'),
    name: SEO_SITE_NAME,
    url: createSiteUrl('/'),
  };

  if (sameAs.length > 0) {
    organization.sameAs = sameAs;
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      inLanguage: 'ar',
      name: SEO_SITE_NAME,
      url: createSiteUrl('/'),
    },
    organization,
  ];
}

function createBreadcrumbList(items: Array<{ item: string; name: string }>): JsonLdValue {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      item: item.item,
      name: item.name,
      position: index + 1,
    })),
  };
}

function createCategoryBreadcrumb(category: Category): JsonLdValue {
  return createBreadcrumbList([
    { item: createSiteUrl('/'), name: SEO_SITE_NAME },
    { item: createSiteUrl(`/category/${category.slug}`), name: category.name },
  ]);
}

function createProductBreadcrumb(product: Product, category: Category | undefined): JsonLdValue {
  return createBreadcrumbList([
    { item: createSiteUrl('/'), name: SEO_SITE_NAME },
    {
      item: createSiteUrl(`/category/${category?.slug ?? product.category}`),
      name: category?.name ?? product.category,
    },
    { item: createSiteUrl(`/product/${product.slug}`), name: product.name },
  ]);
}

function createProductStructuredData(product: Product): JsonLdValue {
  const productImages = product.images
    .map(createAbsoluteUrl)
    .filter((url): url is string => Boolean(url));
  const productData: JsonLdValue = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: getText(
      product.description || product.shortDescription,
      `اكتشف ${product.name} لدى NOVIQ ضمن مجموعة ساعات مختارة.`,
    ),
    image: productImages.length === 1 ? productImages[0] : productImages,
    name: product.name,
    offers: {
      '@type': 'Offer',
      availability:
        product.isAvailable && product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      price: getDiscountedPrice(product),
      priceCurrency: STORE_CURRENCY_CODE,
      url: createSiteUrl(`/product/${product.slug}`),
    },
  };
  const productBrand = product.brand?.trim() ?? '';

  if (productBrand) {
    productData.brand = {
      '@type': 'Brand',
      name: productBrand,
    };
  }

  return productData;
}

export default function StorefrontSeo() {
  const location = useLocation();
  const pathname = normalizePathname(location.pathname);
  const { categories, isLoading, products } = useStoreCatalog();
  const { settings } = useStoreSettings();
  const homeDescription = getText(settings.storeDescription, defaultStoreSettings.storeDescription || fallbackDescription);
  const homeImage = getText(settings.heroImage, fallbackOgImage);

  if (pathname === '/') {
    return (
      <Seo
        canonicalPath="/"
        description={homeDescription}
        image={homeImage}
        structuredData={createHomepageStructuredData(settings)}
        title={SEO_SITE_NAME}
      />
    );
  }

  const categoryMatch = matchPath({ end: true, path: '/category/:slug' }, pathname);

  if (categoryMatch?.params.slug) {
    const slug = categoryMatch.params.slug.toLowerCase();
    const category = categories.find((candidate) => candidate.slug === slug);

    if (category) {
      return (
        <Seo
          canonicalPath={`/category/${category.slug}`}
          description={getText(
            category.description,
            `اكتشف ساعات ${category.name} المختارة لدى NOVIQ بتصاميم تجمع بين الأناقة والجودة والتفاصيل الراقية.`,
          )}
          image={category.image || homeImage}
          structuredData={[createCategoryBreadcrumb(category)]}
          title={`${category.name} | ${SEO_SITE_NAME}`}
        />
      );
    }

    return (
      <Seo
        canonicalPath={isLoading ? `/category/${slug}` : undefined}
        description={homeDescription}
        image={homeImage}
        openGraph={isLoading}
        robots={isLoading ? undefined : 'noindex,nofollow'}
        title={SEO_SITE_NAME}
      />
    );
  }

  const productMatch = matchPath({ end: true, path: '/product/:slug' }, pathname);

  if (productMatch?.params.slug) {
    const slug = productMatch.params.slug.toLowerCase();
    const product = products.find((candidate) => candidate.slug === slug);

    if (product) {
      const category = categories.find((candidate) => candidate.slug === product.category);

      return (
        <Seo
          canonicalPath={`/product/${product.slug}`}
          description={getText(
            product.shortDescription || product.description,
            `اكتشف ${product.name} لدى NOVIQ ضمن مجموعة ساعات مختارة بتفاصيل أنيقة وجودة موثوقة.`,
          )}
          image={product.images[0] || homeImage}
          ogType="product"
          structuredData={[
            createProductStructuredData(product),
            createProductBreadcrumb(product, category),
          ]}
          title={`${product.name} | ${SEO_SITE_NAME}`}
        />
      );
    }

    return (
      <Seo
        canonicalPath={isLoading ? `/product/${slug}` : undefined}
        description={homeDescription}
        image={homeImage}
        openGraph={isLoading}
        robots={isLoading ? undefined : 'noindex,nofollow'}
        title={SEO_SITE_NAME}
      />
    );
  }

  const workflowPageSeo = workflowSeo[pathname];

  if (workflowPageSeo) {
    return (
      <Seo
        description={workflowPageSeo.description}
        openGraph={false}
        robots="noindex,follow"
        title={workflowPageSeo.title}
      />
    );
  }

  return (
    <Seo
      description={homeDescription}
      openGraph={false}
      robots="noindex,nofollow"
      title={SEO_SITE_NAME}
    />
  );
}
