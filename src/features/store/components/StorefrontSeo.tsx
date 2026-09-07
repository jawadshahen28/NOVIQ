import { matchPath, useLocation } from 'react-router-dom';
import Seo, { SEO_SITE_NAME } from '../../../components/Seo';
import fallbackOgImage from '../../../assets/noviq-reference-hero-lcp.jpg';
import { useStoreCatalog } from '../catalog/StoreCatalogContext';
import { useStoreSettings } from '../settings/StoreSettingsContext';
import { defaultStoreSettings } from '../settings/storeSettingsDefaults';

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
      return (
        <Seo
          canonicalPath={`/product/${product.slug}`}
          description={getText(
            product.shortDescription || product.description,
            `اكتشف ${product.name} لدى NOVIQ ضمن مجموعة ساعات مختارة بتفاصيل أنيقة وجودة موثوقة.`,
          )}
          image={product.images[0] || homeImage}
          ogType="product"
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
